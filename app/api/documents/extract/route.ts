import { NextResponse } from "next/server";
import { demoExtraction, normaliseExtraction } from "@/lib/document-extraction-service";

export const runtime = "nodejs";
const acceptedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("document");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF, JPG, JPEG or PNG file." }, { status: 400 });
    if (!acceptedTypes.has(file.type)) return NextResponse.json({ error: "Please choose a PDF, JPG, JPEG or PNG file." }, { status: 415 });
    if (file.size > maxFileSize) return NextResponse.json({ error: "This file is larger than 10 MB. Please choose a smaller file." }, { status: 413 });
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) return NextResponse.json({ mode: "demo", details: demoExtraction });
    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString("base64");
    const content = file.type === "application/pdf"
      ? [{ type: "input_file", filename: file.name, file_data: base64 }]
      : [{ type: "input_image", image_url: `data:${file.type};base64,${base64}`, detail: "high" }];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        store: false,
        instructions: "You extract details from a fictional property sale deed for a demo. Return ONLY JSON with ownerName, propertyAddress, area, surveyNumber, registrationNumber, purchaseDate. Use empty strings for uncertain or unreadable fields. Never infer a value that is not clearly present.",
        input: [{ role: "user", content: [{ type: "input_text", text: "Extract the six requested fields from this fictional document." }, ...content] }],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI document extraction failed with status ${response.status}`);
    const payload = await response.json() as { output_text?: string };
    const details = normaliseExtraction(parseJson(payload.output_text ?? ""));
    if (process.env.NODE_ENV !== "production") console.info(JSON.stringify({ event: "property_passport_document_extraction", timestamp: new Date().toISOString(), success: true, mode: "ai" }));
    return NextResponse.json({ mode: "ai", details });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Property Passport document extraction failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ mode: "demo", details: demoExtraction });
  }
}

function parseJson(value: string) {
  try { return JSON.parse(value.replace(/^```json\s*|\s*```$/g, "")); } catch { return {}; }
}
