"use client";

export type CitizenProperty = { id: string; address: string; locality: string; area: string; type: string; verificationStatus: "Verified" | "In review"; documentCount: number; surveyNumber: string; registrationNumber: string; purchaseDate: string };
export type CitizenApplication = { id: string; propertyId: string; status: "simulated_complete" | "created"; createdAt: string };
export type Citizen = { id: string; name: string; mobile: string; email: string; passportId: string; signal: string; issueDate: string; credentialVersion: string; properties: CitizenProperty[]; applications: CitizenApplication[] };
type Store = { citizens: Citizen[]; activeCitizenId?: string };

const key = "property-passport-citizens-v1";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const now = () => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const code = (prefix: string, chars: number) => `${prefix}-${Array.from({ length: chars }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;
export const passportSignal = (passportId: string) => passportId.replace(/[^A-Z0-9]/g, "").split("").map((value) => value.charCodeAt(0).toString(2).padStart(6, "0").replace(/0/g, "•").replace(/1/g, "━")).join("\n");

const demoCitizen = (): Citizen => ({ id: "citizen-demo", name: "Daiveek Kumar", mobile: "9000000042", email: "daiveek@example.test", passportId: "PP-8F4K-2M9X", signal: passportSignal("PP-8F4K-2M9X"), issueDate: "29 Aug 2026", credentialVersion: "CRED. 01", properties: [{ id: "PROP-001", address: "Site 42, Ward 174", locality: "Bengaluru, Karnataka", area: "2,400 sq.ft", type: "Residential", verificationStatus: "Verified", documentCount: 6, surveyNumber: "84/2", registrationNumber: "REG-2026-847291", purchaseDate: "14 August 2026" }], applications: [{ id: "APP-2026-001", propertyId: "PROP-001", status: "simulated_complete", createdAt: "29 Aug 2026" }] });

function read(): Store { if (typeof window === "undefined") return { citizens: [demoCitizen()] }; try { const saved = window.localStorage.getItem(key); return saved ? JSON.parse(saved) as Store : { citizens: [demoCitizen()] }; } catch { return { citizens: [demoCitizen()] }; } }
function write(store: Store) { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(store)); return store; }

export const citizenService = {
  getActive: () => { const store = read(); return store.citizens.find((citizen) => citizen.id === store.activeCitizenId); },
  getByPassport: (passportId: string) => read().citizens.find((citizen) => citizen.passportId === passportId),
  create: ({ name, mobile, email }: { name: string; mobile: string; email: string }) => { const store = read(); let passportId = code("PP", 8).replace(/(.{4})$/, "-$1"); while (store.citizens.some((citizen) => citizen.passportId === passportId)) passportId = code("PP", 8).replace(/(.{4})$/, "-$1"); const citizen: Citizen = { id: `citizen-${Date.now()}`, name: name.trim(), mobile: mobile.trim(), email: email.trim(), passportId, signal: passportSignal(passportId), issueDate: now(), credentialVersion: "CRED. 01", properties: [], applications: [] }; store.citizens.push(citizen); store.activeCitizenId = citizen.id; write(store); return citizen; },
  useDemo: () => { const store = read(); const demo = store.citizens.find((citizen) => citizen.id === "citizen-demo") ?? demoCitizen(); if (!store.citizens.some((citizen) => citizen.id === demo.id)) store.citizens.push(demo); store.activeCitizenId = demo.id; write(store); return demo; },
  signIn: (passportId: string) => { const store = read(); const citizen = store.citizens.find((item) => item.passportId === passportId); if (citizen) { store.activeCitizenId = citizen.id; write(store); } return citizen; },
  signOut: () => { const store = read(); delete store.activeCitizenId; write(store); },
  addProperty: (details: { address: string; area: string; surveyNumber: string; registrationNumber: string; purchaseDate: string }) => { const store = read(); const citizen = store.citizens.find((item) => item.id === store.activeCitizenId); if (!citizen) throw new Error("Sign in required"); const propertyId = `PROP-${String(citizen.properties.length + 1).padStart(3, "0")}`; const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`; const property: CitizenProperty = { id: propertyId, address: details.address.split(",")[0], locality: details.address.includes(",") ? details.address.split(",").slice(1).join(",").trim() : "Bengaluru, Karnataka", area: details.area, type: "Residential", verificationStatus: "In review", documentCount: 4, surveyNumber: details.surveyNumber, registrationNumber: details.registrationNumber, purchaseDate: details.purchaseDate }; citizen.properties.push(property); citizen.applications.unshift({ id: applicationId, propertyId, status: "created", createdAt: now() }); write(store); return { property, application: citizen.applications[0] }; },
  completeLatestVerification: () => { const store = read(); const citizen = store.citizens.find((item) => item.id === store.activeCitizenId); if (!citizen) return; const application = citizen.applications[0]; const property = application && citizen.properties.find((item) => item.id === application.propertyId); if (application) application.status = "simulated_complete"; if (property) property.verificationStatus = "Verified"; write(store); return citizen; },
};
