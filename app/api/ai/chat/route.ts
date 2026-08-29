import { NextResponse } from "next/server";
import { aiTools, AiPermissionContext, AiToolName, runAiTool } from "@/lib/ai-tools";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; text: string };
type ChatRequest = { message?: string; history?: ChatMessage[]; context?: { page?: string; authenticated?: boolean; propertyAccess?: boolean } };

const systemInstructions = `You are PROPERTY PASSPORT ASSISTANT for a fictional competition prototype. Help ordinary citizens navigate property-record workflows in simple, calm language. You are not BBMP or any government body. Never invent records, make legal determinations, approve or reject properties, or expose private documents. Never treat PID, SAS, Khata, or survey numbers as a blocker. Use tools only when appropriate. start_property_registration always needs explicit user confirmation; explain it and offer an action, never perform it. Private documents require authentication through /scan. Return ONLY JSON: {"message":"plain-language response","action":null|{"label":"short label","href":"allowed route"},"toolStatus":null|"citizen-friendly present-tense status"}. Routes allowed: /register, /passport, /passport/status, /passport/lost, /scan?next=/passport/property/PROP-001/vault. Keep responses below 110 words.`;

function actionFromTools(toolResults: Array<{ name: string; result: Record<string, unknown> }>) {
  if (toolResults.some((item) => item.name === "get_property_documents" && item.result.allowed === false)) return { label: "Open Property Vault", href: "/scan?next=/passport/property/PROP-001/vault" };
  if (toolResults.some((item) => item.name === "start_property_registration")) return { label: "Start registration", href: "/register" };
  return null;
}

function safeAction(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const action = value as { label?: unknown; href?: unknown };
  const allowed = ["/register", "/passport", "/passport/status", "/passport/lost", "/scan?next=/passport/property/PROP-001/vault"];
  return typeof action.label === "string" && typeof action.href === "string" && allowed.includes(action.href) ? { label: action.label.slice(0, 60), href: action.href } : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) return NextResponse.json({ mode: "fallback", reason: "unavailable" });
  try {
    const body = await request.json() as ChatRequest;
    if (!body.message || body.message.length > 1000) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    const permissions: AiPermissionContext = { authenticated: Boolean(body.context?.authenticated), propertyAccess: Boolean(body.context?.propertyAccess) };
    const history = (body.history ?? []).slice(-8).map((item) => ({ role: item.role, content: item.text.slice(0, 1000) }));
    const input = [...history, { role: "user", content: body.message }];
    let response = await callOpenAi(apiKey, { model, input, instructions: `${systemInstructions}\nCurrent page: ${body.context?.page ?? "/"}. Demo user is fictional.`, tools: aiTools, tool_choice: "auto", store: false });
    const toolResults: Array<{ name: string; result: Record<string, unknown> }> = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const calls = Array.isArray(response.output) ? response.output.filter((item: { type?: string }) => item.type === "function_call") : [];
      if (!calls.length) break;
      const outputs = calls.map((call: { call_id: string; name: AiToolName; arguments: string }) => {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(call.arguments); } catch { args = {}; }
        const result = runAiTool(call.name, args, permissions) as Record<string, unknown>;
        toolResults.push({ name: call.name, result });
        return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) };
      });
      response = await callOpenAi(apiKey, { model, previous_response_id: response.id, input: outputs, store: false });
    }
    let parsed: { message?: unknown; action?: unknown; toolStatus?: unknown } = {};
    try { parsed = JSON.parse(response.output_text ?? "{}"); } catch { parsed.message = response.output_text; }
    const fallbackAction = actionFromTools(toolResults);
    return NextResponse.json({ mode: "ai", message: typeof parsed.message === "string" ? parsed.message.slice(0, 900) : "I can help you with that.", action: safeAction(parsed.action) ?? fallbackAction, toolStatus: typeof parsed.toolStatus === "string" ? parsed.toolStatus.slice(0, 120) : null });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    if (process.env.NODE_ENV !== "production") console.error("Property Passport AI request failed", detail);
    return NextResponse.json({ mode: "fallback", reason: "error" });
  }
}

async function callOpenAi(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);
  return response.json() as Promise<{ id: string; output?: Array<{ type?: string; call_id: string; name: AiToolName; arguments: string }>; output_text?: string }>;
}
