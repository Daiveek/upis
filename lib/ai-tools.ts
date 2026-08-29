import { propertyService } from "@/lib/property-service";

export type AiPermissionContext = { authenticated: boolean; propertyAccess: boolean };
export type AiToolName = "get_my_properties" | "get_property_details" | "get_application_status" | "get_property_documents" | "start_property_registration" | "get_property_verification_status";

const documentIndex = ["Sale Deed", "e-Khata", "Property Tax Receipt", "RTC", "Encumbrance Certificate", "Verification Report"];

export const aiTools = [
  { type: "function", name: "get_my_properties", description: "Get the authenticated demo citizen's property index.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_property_details", description: "Get summary details for one authenticated property.", parameters: { type: "object", properties: { property_id: { type: "string" } }, required: ["property_id"], additionalProperties: false } },
  { type: "function", name: "get_application_status", description: "Get the authenticated demo citizen's application status.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_property_documents", description: "Check whether the citizen may proceed to the private Property Vault. Never returns document content.", parameters: { type: "object", properties: { property_id: { type: "string" } }, required: ["property_id"], additionalProperties: false } },
  { type: "function", name: "start_property_registration", description: "Prepare, but never submit, a new-property registration. This always requires the citizen's explicit confirmation.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_property_verification_status", description: "Get the field and supervisor verification status for an authenticated property.", parameters: { type: "object", properties: { property_id: { type: "string" } }, required: ["property_id"], additionalProperties: false } },
] as const;

function deny(message: string) { return { allowed: false, message }; }

export function runAiTool(name: AiToolName, args: Record<string, unknown>, permissions: AiPermissionContext) {
  const log = (success: boolean) => { if (process.env.NODE_ENV !== "production") console.info(JSON.stringify({ event: "property_passport_ai_tool", intent: name, tool: name, timestamp: new Date().toISOString(), success })); };
  if (name === "start_property_registration") { log(true); return { allowed: true, requiresConfirmation: true, message: "Registration is ready to begin only after the citizen confirms." }; }
  if (!permissions.authenticated) { log(false); return deny("Authentication is required before accessing property information."); }
  if (name === "get_my_properties") { log(true); return { allowed: true, properties: propertyService.getUserProperties() }; }
  if (name === "get_property_details") { const property = propertyService.getProperty(String(args.property_id)); log(Boolean(property)); return property ? { allowed: true, property } : deny("That property could not be found in this fictional demo."); }
  if (name === "get_application_status") { log(true); return { allowed: true, status: propertyService.getApplicationStatus() }; }
  if (name === "get_property_verification_status") { log(true); return { allowed: true, verification: propertyService.getVerification() }; }
  if (name === "get_property_documents") { if (!permissions.propertyAccess) { log(false); return deny("Private documents require a separate identity check. Route the citizen to /scan?next=/passport/property/PROP-001/vault."); } log(true); return { allowed: true, documents: documentIndex.map((name) => ({ name, status: "Verified in this prototype" })) }; }
  log(false); return deny("That action is not available.");
}
