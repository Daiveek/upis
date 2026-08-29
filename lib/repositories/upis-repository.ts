import { createHash, randomBytes } from "crypto";
import { supabaseQuery } from "../db/supabase";

type CitizenRow = { id: string; full_name: string; mobile: string; email: string; pan_masked: string };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const code = (prefix: string) => `${prefix}-${randomBytes(4).toString("hex").toUpperCase().match(/.{1,4}/g)?.join("-")}`;
const signalFor = (passportId: string) => passportId.replace(/[^A-Z0-9]/g, "").split("").map((value) => value.charCodeAt(0).toString(2).padStart(6, "0").replace(/0/g, "•").replace(/1/g, "━")).join("");
export const maskPan = (pan: string) => `${pan.slice(0, 5)}••••${pan.slice(-1)}`;

export async function createCitizen(input: { name: string; mobile: string; email: string; pan: string }) {
  const panHash = hash(input.pan);
  const existing = await supabaseQuery<CitizenRow[]>("citizens", `?select=id&pan_hash=eq.${panHash}`);
  if (existing.length) return { duplicate: true as const };
  const rows = await supabaseQuery<CitizenRow[]>("citizens", "", { method: "POST", body: { full_name: input.name, mobile: input.mobile, email: input.email, pan_hash: panHash, pan_masked: maskPan(input.pan) } });
  const citizen = rows[0];
  const token = randomBytes(32).toString("base64url");
  await supabaseQuery("authentication_sessions", "", { method: "POST", body: { citizen_id: citizen.id, session_token_hash: hash(token), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() } });
  return { duplicate: false as const, citizen, token };
}

export async function citizenForSession(token?: string) {
  if (!token) return undefined;
  const rows = await supabaseQuery<Array<{ citizens: CitizenRow | null }>>("authentication_sessions", `?select=citizens(*)&session_token_hash=eq.${hash(token)}&expires_at=gt.${new Date().toISOString()}`);
  return rows[0]?.citizens ?? undefined;
}

export async function dashboardForCitizen(citizenId: string) {
  type PassportRow = { id: string; passport_id: string; passport_signal: string; issue_date: string | null; credential_version: string; properties: Array<{ id: string; property_number: number; address: string; locality: string | null; area: string | null; status: string }> | null };
  const rows = await supabaseQuery<Array<CitizenRow & { property_passports: PassportRow | PassportRow[] | null }>>("citizens", `?select=*,property_passports(id,passport_id,passport_signal,issue_date,credential_version,properties(id,property_number,address,locality,area,status))&id=eq.${citizenId}`);
  const citizen = rows[0]; if (!citizen) return undefined;
  const passport = Array.isArray(citizen.property_passports) ? citizen.property_passports[0] : citizen.property_passports;
  return { citizen: { id: citizen.id, name: citizen.full_name, mobile: citizen.mobile, email: citizen.email, panMasked: citizen.pan_masked }, passport: passport && { dbId: passport.id, passportId: passport.passport_id, signal: passport.passport_signal, issueDate: passport.issue_date, version: passport.credential_version }, properties: (passport?.properties ?? []).map((item) => ({ id: `PROP-${String(item.property_number).padStart(3, "0")}`, dbId: item.id, address: item.address, locality: item.locality, area: item.area, status: item.status })) };
}

export async function applicationForCitizen(citizenId: string, propertyId: string) {
  const data = await dashboardForCitizen(citizenId); const property = data?.properties.find((item) => item.id === propertyId); if (!property) return undefined;
  const applications = await supabaseQuery<Array<{ id: string; application_id: string; status: string; created_at: string }>>("property_applications", `?select=*&property_id=eq.${property.dbId}&order=created_at.desc&limit=1`); const application = applications[0];
  const events = application ? await supabaseQuery<Array<{ event_type: string; status: string; message: string; created_at: string }>>("verification_events", `?select=*&application_id=eq.${application.id}&order=created_at.asc`) : [];
  const documents = await supabaseQuery<Array<{ document_type: string; display_name: string; status: string; filename: string | null }>>("documents", `?select=document_type,display_name,status,filename&property_id=eq.${property.dbId}&order=created_at.asc`);
  return { data, property, application, events, documents };
}

export async function createPropertyForCitizen(citizenId: string, details: { address: string; area: string; surveyNumber: string; registrationNumber: string; purchaseDate: string }) {
  let passports = await supabaseQuery<Array<{ id: string; passport_id: string }>>("property_passports", `?select=id,passport_id&citizen_id=eq.${citizenId}`);
  if (!passports.length) { const passportId = code("PP"); passports = await supabaseQuery("property_passports", "", { method: "POST", body: { citizen_id: citizenId, passport_id: passportId, passport_signal: signalFor(passportId) } }); }
  const passport = passports[0];
  const current = await supabaseQuery<Array<{ property_number: number }>>("properties", `?select=property_number&passport_id=eq.${passport.id}&order=property_number.desc&limit=1`);
  const propertyNumber = (current[0]?.property_number ?? 0) + 1;
  const properties = await supabaseQuery<Array<{ id: string }>>("properties", "", { method: "POST", body: { passport_id: passport.id, property_number: propertyNumber, address: details.address, area: details.area, survey_number: details.surveyNumber, registration_number: details.registrationNumber, purchase_date: details.purchaseDate, status: "in_review" } });
  const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const applications = await supabaseQuery<Array<{ id: string }>>("property_applications", "", { method: "POST", body: { property_id: properties[0].id, application_id: applicationId, status: "created" } });
  await supabaseQuery("documents", "", { method: "POST", body: ["Sale Deed", "Property Tax Receipt", "RTC", "Encumbrance Certificate"].map((document_type) => ({ property_id: properties[0].id, document_type, display_name: `Demo ${document_type}`, filename: `fictional-demo-${document_type.toLowerCase().replaceAll(" ", "-")}.pdf`, status: "received", is_fictional: true })) });
  await supabaseQuery("verification_events", "", { method: "POST", body: { application_id: applications[0].id, event_type: "APPLICATION_SUBMITTED", status: "complete", message: "Property application submitted in this fictional competition prototype." } });
  return { passportId: passport.passport_id, propertyId: `PROP-${String(propertyNumber).padStart(3, "0")}`, applicationId };
}

const demoSeedCitizen = {
  name: "Demo Citizen",
  mobile: "9000000000",
  email: "demo-citizen@example.com",
  pan: "DEMOX2026P",
};

const demoSeedProperty = {
  address: "Site 42, Ward 174, Bengaluru",
  area: "2,400 sq.ft",
  surveyNumber: "84/2",
  registrationNumber: "REG-2026-847291",
  purchaseDate: "14 August 2026",
};

/** Development-only helper. It follows the regular UPIS creation path and is safe to rerun. */
export async function seedDemoApplication() {
  const existingCitizens = await supabaseQuery<Array<{ id: string }>>("citizens", `?select=id&email=eq.${encodeURIComponent(demoSeedCitizen.email)}&limit=1`);
  let citizenId = existingCitizens[0]?.id;
  let citizenCreated = false;

  if (!citizenId) {
    const createdCitizen = await createCitizen(demoSeedCitizen);
    if (createdCitizen.duplicate) throw new Error("The fictional demo citizen already exists with a different email.");
    citizenId = createdCitizen.citizen.id;
    citizenCreated = true;
  }

  const passports = await supabaseQuery<Array<{ id: string; passport_id: string; properties: Array<{ id: string; property_number: number; address: string }> | null }>>("property_passports", `?select=id,passport_id,properties(id,property_number,address)&citizen_id=eq.${citizenId}`);
  const passport = passports[0];
  const matchingProperties = (passport?.properties ?? [])
    .filter((property) => property.address === demoSeedProperty.address)
    .sort((first, second) => first.property_number - second.property_number);
  const existingProperty = matchingProperties[0];
  const duplicateProperties = matchingProperties.slice(1);

  for (const duplicateProperty of duplicateProperties) {
    await supabaseQuery("properties", `?id=eq.${duplicateProperty.id}`, { method: "DELETE" });
  }

  if (existingProperty) {
    const applications = await supabaseQuery<Array<{ application_id: string }>>("property_applications", `?select=application_id&property_id=eq.${existingProperty.id}&limit=1`);
    const existingApplication = applications[0];
    if (!existingApplication) throw new Error("The fictional demo property exists without an application.");
    return {
      created: false as const,
      citizenCreated,
      duplicatesRemoved: duplicateProperties.length,
      passportId: passport?.passport_id,
      propertyId: `PROP-${String(existingProperty.property_number).padStart(3, "0")}`,
      applicationId: existingApplication.application_id,
    };
  }

  const createdProperty = await createPropertyForCitizen(citizenId, demoSeedProperty);
  return { created: true as const, citizenCreated, duplicatesRemoved: 0, ...createdProperty };
}

export async function simulateVerification(citizenId: string, propertyId: string) {
  const resource = await applicationForCitizen(citizenId, propertyId); if (!resource?.application) return undefined;
  const steps = [["PROPERTY_VISIT_SCHEDULED", "Property visit scheduled. This verification is simulated for this competition prototype."], ["DOCUMENTS_CHECKED", "Ownership documents checked."], ["OWNERSHIP_VERIFIED", "Ownership details matched."], ["FIELD_VERIFICATION_COMPLETED", "Property location verified and owner presence recorded."], ["GOVERNMENT_REVIEW", "Verification report reviewed in the simulated workflow."], ["GOVERNMENT_APPROVED", "Government approval completed in this simulated competition workflow."], ["PASSPORT_ISSUED", "Property Passport issued. Your verified property is now part of UPIS records for this prototype."]];
  for (const [event_type, message] of steps) await supabaseQuery("verification_events", "", { method: "POST", body: { application_id: resource.application.id, event_type, status: "complete", message } });
  await supabaseQuery("properties", `?id=eq.${resource.property.dbId}`, { method: "PATCH", body: { status: "verified" } });
  await supabaseQuery("property_applications", `?id=eq.${resource.application.id}`, { method: "PATCH", body: { status: "issued" } });
  return applicationForCitizen(citizenId, propertyId);
}

export async function passportLookup(passportId: string) {
  const rows = await supabaseQuery<Array<{ citizen_id: string; passport_id: string; citizens: CitizenRow | null }>>("property_passports", `?select=citizen_id,passport_id,citizens(*)&passport_id=eq.${encodeURIComponent(passportId)}`);
  const row = rows[0]; return row?.citizens ? { citizenId: row.citizen_id, passportId: row.passport_id, owner: row.citizens.full_name.replace(/(?<=.)./g, "•") } : undefined;
}

function credentialVersionNumber(version: string) {
  return Number(version.match(/\d+/)?.[0] ?? "1");
}

export async function requestPassportReplacement(citizenId: string) {
  const passports = await supabaseQuery<Array<{ id: string; passport_id: string; passport_signal: string; credential_version: string }>>(
    "property_passports",
    `?select=id,passport_id,passport_signal,credential_version&citizen_id=eq.${citizenId}&limit=1`,
  );
  const passport = passports[0];
  if (!passport) return undefined;
  if (credentialVersionNumber(passport.credential_version) >= 2) {
    return { alreadyReplaced: true, passportId: passport.passport_id, signal: passport.passport_signal, version: passport.credential_version };
  }
  const nextVersion = "CRED. 02";
  const updated = await supabaseQuery<Array<{ passport_id: string; passport_signal: string; credential_version: string }>>(
    "property_passports",
    `?id=eq.${passport.id}`,
    { method: "PATCH", body: { credential_version: nextVersion } },
  );
  const replacement = updated[0];
  return { alreadyReplaced: false, passportId: replacement.passport_id, signal: replacement.passport_signal, version: replacement.credential_version };
}

export async function sessionForCitizen(citizenId: string) { const token = randomBytes(32).toString("base64url"); await supabaseQuery("authentication_sessions", "", { method: "POST", body: { citizen_id: citizenId, session_token_hash: hash(token), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() } }); return token; }

export async function staffApplicationList() { const rows = await supabaseQuery<Array<{ application_id: string; status: string; properties: { property_number: number; address: string; status: string; property_passports: { citizens: CitizenRow | null } | null } | null }>>("property_applications", "?select=application_id,status,properties(property_number,address,status,property_passports(citizens(*)))&order=created_at.desc"); return rows.map((row) => ({ applicationId: row.application_id, propertyId: `PROP-${String(row.properties?.property_number ?? 0).padStart(3, "0")}`, ownerDisplayName: row.properties?.property_passports?.citizens?.full_name ?? "Citizen", propertyAddress: row.properties?.address ?? "Property address unavailable", scheduledVisit: "Simulated visit", status: row.status, verificationStatus: row.properties?.status ?? "in_review" })); }

export async function staffApplicationDetail(applicationId: string) {
  const rows = await supabaseQuery<Array<{
    id: string;
    application_id: string;
    status: string;
    properties: {
      property_number: number;
      address: string;
      status: string;
      property_passports: { citizens: { full_name: string } | null } | null;
    } | null;
  }>>("property_applications", `?select=id,application_id,status,properties(property_number,address,status,property_passports(citizens(full_name)))&application_id=eq.${encodeURIComponent(applicationId)}&limit=1`);
  const application = rows[0];
  if (!application) return undefined;

  const verificationEvents = await supabaseQuery<Array<{ id: string; event_type: string; status: string; message: string; created_at: string }>>(
    "verification_events",
    `?select=id,event_type,status,message,created_at&application_id=eq.${application.id}&order=created_at.asc`,
  );

  return {
    applicationId: application.application_id,
    propertyId: `PROP-${String(application.properties?.property_number ?? 0).padStart(3, "0")}`,
    ownerDisplayName: application.properties?.property_passports?.citizens?.full_name ?? "Citizen",
    propertyAddress: application.properties?.address ?? "Property address unavailable",
    scheduledVisit: "Simulated visit",
    status: application.status,
    verificationStatus: application.properties?.status ?? "in_review",
    verificationEvents: verificationEvents.map((event) => ({
      id: event.id,
      action: event.event_type,
      status: event.status,
      timestamp: event.created_at,
      message: event.message,
    })),
  };
}

const officerActions = ["PROPERTY_LOCATION_CHECKED", "OWNER_PRESENCE_CONFIRMED", "DOCUMENTS_REVIEWED", "FIELD_VERIFICATION_COMPLETED"] as const;
export type OfficerAction = typeof officerActions[number];
export async function recordOfficerVerification(applicationId: string, action: OfficerAction) { const applications = await supabaseQuery<Array<{ id: string; application_id: string; status: string }>>("property_applications", `?select=id,application_id,status&application_id=eq.${encodeURIComponent(applicationId)}`); const application = applications[0]; if (!application) return { kind: "missing" as const }; const events = await supabaseQuery<Array<{ event_type: string }>>("verification_events", `?select=event_type&application_id=eq.${application.id}&order=created_at.asc`); if (events.some((event) => event.event_type === action)) return { kind: "duplicate" as const }; const index = officerActions.indexOf(action); if (index > 0 && !events.some((event) => event.event_type === officerActions[index - 1])) return { kind: "out_of_order" as const, required: officerActions[index - 1] }; const messages: Record<OfficerAction, string> = { PROPERTY_LOCATION_CHECKED: "Property location checked by demo officer.", OWNER_PRESENCE_CONFIRMED: "Owner presence confirmed by demo officer.", DOCUMENTS_REVIEWED: "Submitted documents reviewed by demo officer.", FIELD_VERIFICATION_COMPLETED: "Field verification completed by demo officer." }; const created = await supabaseQuery<Array<{ id: string; event_type: string; status: string; message: string; created_at: string }>>("verification_events", "", { method: "POST", body: { application_id: application.id, event_type: action, status: "complete", message: messages[action] } }); return { kind: "success" as const, application, event: created[0], verificationStatus: action === "FIELD_VERIFICATION_COMPLETED" ? "field_verification_complete" : "field_verification_in_progress" }; }

type ApprovalEvent = { id: string; event_type: string; status: string; message: string; created_at: string };

export async function approveApplication(applicationId: string) {
  const applications = await supabaseQuery<Array<{ id: string; application_id: string; property_id: string }>>(
    "property_applications",
    `?select=id,application_id,property_id&application_id=eq.${encodeURIComponent(applicationId)}&limit=1`,
  );
  const application = applications[0];
  if (!application) return { kind: "missing" as const };

  const events = await supabaseQuery<ApprovalEvent[]>("verification_events", `?select=id,event_type,status,message,created_at&application_id=eq.${application.id}&order=created_at.asc`);
  const missingActions = officerActions.filter((action) => !events.some((event) => event.event_type === action && event.status === "complete"));
  if (missingActions.length) return { kind: "incomplete" as const, missingActions };

  let approvalEvent = events.find((event) => event.event_type === "GOVERNMENT_APPROVAL_COMPLETED");
  if (!approvalEvent) {
    const created = await supabaseQuery<ApprovalEvent[]>("verification_events", "", {
      method: "POST",
      body: {
        application_id: application.id,
        event_type: "GOVERNMENT_APPROVAL_COMPLETED",
        status: "complete",
        message: "Government approval completed by demo supervisor.",
      },
    });
    approvalEvent = created[0];
  }

  if (!events.some((event) => event.event_type === "PASSPORT_ISSUED" && event.status === "complete")) {
    await supabaseQuery("verification_events", "", {
      method: "POST",
      body: {
        application_id: application.id,
        event_type: "PASSPORT_ISSUED",
        status: "complete",
        message: "Property Passport issued after supervisor approval in this fictional competition prototype.",
      },
    });
  }

  const properties = await supabaseQuery<Array<{ passport_id: string }>>("properties", `?select=passport_id&id=eq.${application.property_id}&limit=1`);
  const property = properties[0];
  if (!property) throw new Error("Application property is missing.");
  await supabaseQuery("property_applications", `?id=eq.${application.id}`, { method: "PATCH", body: { status: "issued" } });
  await supabaseQuery("properties", `?id=eq.${application.property_id}`, { method: "PATCH", body: { status: "verified" } });
  await supabaseQuery("property_passports", `?id=eq.${property.passport_id}&issue_date=is.null`, { method: "PATCH", body: { issue_date: new Date().toISOString().slice(0, 10) } });

  return {
    kind: "approved" as const,
    alreadyApproved: events.some((event) => event.event_type === "GOVERNMENT_APPROVAL_COMPLETED"),
    applicationId: application.application_id,
    applicationStatus: "issued",
    verificationStatus: "passport_issued",
    approvalEvent,
  };
}
