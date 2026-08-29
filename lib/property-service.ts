import { demoCitizen, demoData, properties } from "./mock-data";

export type DemoStage = "NEW_APPLICATION" | "AWAITING_FIELD_VERIFICATION" | "FIELD_VERIFIED" | "AWAITING_APPROVAL" | "APPROVED" | "PASSPORT_ISSUED";
export type ConfirmedPropertyDetails = { ownerName: string; propertyAddress: string; area: string; surveyNumber: string; registrationNumber: string; purchaseDate: string };
export type PropertyApplication = { id: string; status: "created" | "visit_scheduled"; appointment?: string; confirmedDetails?: ConfirmedPropertyDetails };
export type VerificationState = { applicationId: string; fieldStatus: "ready" | "complete"; approvalStatus: "awaiting" | "approved"; officer: string; location?: string; timestamp?: string; propertyPhotoCaptured: boolean; ownerPhotoCaptured: boolean; documentsReviewed: boolean };
export type DemoState = { stage: DemoStage; application: PropertyApplication; verification: VerificationState };

const initialState = (): DemoState => ({ stage: "AWAITING_FIELD_VERIFICATION", application: { id: demoData.applicationId, status: "visit_scheduled", appointment: "Monday at 10:00 AM" }, verification: { applicationId: demoData.applicationId, fieldStatus: "ready", approvalStatus: "awaiting", officer: `Officer ${demoData.officerId}`, propertyPhotoCaptured: false, ownerPhotoCaptured: false, documentsReviewed: false } });
let demoState = initialState();
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const storageKey = "property-passport-demo-state";

function cookieState(): DemoState | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${storageKey}=`));
  if (!match) return undefined;
  try { return JSON.parse(decodeURIComponent(match.slice(storageKey.length + 1))) as DemoState; } catch { return undefined; }
}

function activeState(): DemoState {
  if (typeof window === "undefined") return demoState;
  const fromCookie = cookieState();
  if (fromCookie) return fromCookie;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored) as DemoState;
  } catch { /* Demo mode remains available even when browser storage is blocked. */ }
  return demoState;
}

function saveState(next: DemoState) {
  demoState = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Cookie fallback below keeps the demo usable. */ }
    try { document.cookie = `${storageKey}=${encodeURIComponent(JSON.stringify(next))}; path=/; SameSite=Lax`; } catch { /* Keep the in-memory demo state. */ }
  }
  return copy(next);
}

function statusFor(stage: DemoStage) {
  const map: Record<DemoStage, { stage: string; next: string; explanation: string }> = {
    NEW_APPLICATION: { stage: "Application created", next: "Schedule a property visit", explanation: "Your property details and documents have been received. Choose a time for an authorised field visit." },
    AWAITING_FIELD_VERIFICATION: { stage: "Property visit scheduled", next: "Field verification", explanation: "Your documents are ready. An authorised officer will verify the property at the scheduled visit." },
    FIELD_VERIFIED: { stage: "Field verification complete", next: "Supervisor review", explanation: "The officer has completed the field report. It will now be prepared for supervisory review." },
    AWAITING_APPROVAL: { stage: "Awaiting final approval", next: "Government approval", explanation: "Your documents have been verified and your property inspection is complete. The application is now waiting for final government approval." },
    APPROVED: { stage: "Property approved", next: "Issue Property Passport", explanation: "Your property has been approved. Your Property Passport credential is now being issued." },
    PASSPORT_ISSUED: { stage: "Property Passport issued", next: "View your Property Passport", explanation: "Your property has been added to your Property Passport and is verified in this prototype." },
  };
  return map[stage];
}

export const propertyService = {
  getDemoState: () => copy(activeState()),
  resetDemo: () => saveState(initialState()),
  getUserProperties: () => properties,
  getPassport: () => demoCitizen,
  getProperty: (id: string) => properties.find((property) => property.id === id),
  getApplication: () => copy(activeState().application),
  getApplicationStatus: () => statusFor(activeState().stage),
  createPropertyApplication: (confirmedDetails: ConfirmedPropertyDetails) => { const state = activeState(); const next = { ...state, stage: "NEW_APPLICATION" as const, application: { id: demoData.applicationId, status: "created" as const, confirmedDetails } }; return saveState(next).application; },
  scheduleVerification: (appointment: string) => { const state = activeState(); const next = { ...state, stage: "AWAITING_FIELD_VERIFICATION" as const, application: { ...state.application, status: "visit_scheduled" as const, appointment } }; return saveState(next).application; },
  getVerification: () => copy(activeState().verification),
  completeFieldVerification: () => { const state = activeState(); const next = { ...state, stage: "AWAITING_APPROVAL" as const, verification: { ...state.verification, fieldStatus: "complete" as const, location: "12.9716, 77.5946", timestamp: "29 Aug 2026, 10:42 AM", propertyPhotoCaptured: true, ownerPhotoCaptured: true, documentsReviewed: true } }; return saveState(next).verification; },
  approveProperty: () => { const state = activeState(); const next = { ...state, stage: "PASSPORT_ISSUED" as const, verification: { ...state.verification, approvalStatus: "approved" as const } }; return saveState(next).verification; },
};
