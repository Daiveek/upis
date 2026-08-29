"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CitizenHeader } from "@/components/citizen-header";

type StatusData = { application?: { application_id: string; status: string }; property: { id: string }; documents: Array<{ status: string }>; events: Array<{ event_type: string; status: string; message: string; created_at: string }> };
type Stage = { title: string; description: string; complete: (events: StatusData["events"], data: StatusData) => boolean };
const includes = (events: StatusData["events"], types: string[]) => events.some((event) => types.includes(event.event_type) && event.status === "complete");
const eventMessage = (event?: StatusData["events"][number]) => {
  if (!event) return "Your property application has been received.";
  const messages: Record<string, string> = { APPLICATION_SUBMITTED: "Your property application has been received.", PROPERTY_VISIT_SCHEDULED: "Your property visit has been scheduled.", DOCUMENTS_CHECKED: "Your ownership documents have been reviewed.", DOCUMENTS_REVIEWED: "Your submitted documents have been reviewed.", OWNERSHIP_VERIFIED: "Your ownership details have been confirmed.", FIELD_VERIFICATION_COMPLETED: "Field verification has been completed.", GOVERNMENT_REVIEW: "Your verification record has been reviewed.", GOVERNMENT_APPROVED: "Government approval has been completed.", GOVERNMENT_APPROVAL_COMPLETED: "Government approval has been completed.", PASSPORT_ISSUED: "Your Property Passport has been issued." };
  return messages[event.event_type] ?? "A verification update has been recorded.";
};
const stages: Stage[] = [
  { title: "Application submitted", description: "Your property details have been recorded.", complete: (events) => includes(events, ["APPLICATION_SUBMITTED"]) },
  { title: "Documents received", description: "Your property documents are available for review.", complete: (_, data) => data.documents.length > 0 },
  { title: "Document verification", description: "Ownership documents and property records are checked.", complete: (events) => includes(events, ["DOCUMENTS_CHECKED", "DOCUMENTS_REVIEWED"]) },
  { title: "Property visit scheduled", description: "An authorised officer is scheduled to verify the property.", complete: (events) => includes(events, ["PROPERTY_VISIT_SCHEDULED"]) },
  { title: "Officer verification", description: "The property location and owner presence are checked.", complete: (events) => includes(events, ["FIELD_VERIFICATION_COMPLETED"]) },
  { title: "Internal verification", description: "The verification record is reviewed.", complete: (events) => includes(events, ["GOVERNMENT_REVIEW", "GOVERNMENT_APPROVAL_COMPLETED"]) },
  { title: "Government verification", description: "Approval is being completed for this prototype journey.", complete: (events) => includes(events, ["GOVERNMENT_APPROVED", "GOVERNMENT_APPROVAL_COMPLETED"]) },
  { title: "Ownership confirmation", description: "Your ownership details have been confirmed.", complete: (events) => includes(events, ["OWNERSHIP_VERIFIED", "GOVERNMENT_APPROVED", "GOVERNMENT_APPROVAL_COMPLETED"]) },
  { title: "Property Passport creation", description: "Your verified property is being linked to your Passport.", complete: (events) => includes(events, ["PASSPORT_ISSUED"]) },
  { title: "Passport ready", description: "Your Property Passport is ready to use.", complete: (events) => includes(events, ["PASSPORT_ISSUED"]) },
];

export default function StatusPage() {
  const [data, setData] = useState<StatusData>(); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/upis/me").then(async (me) => { if (!me.ok) throw new Error(); const identity = await me.json() as { properties: Array<{ id: string }> }; const propertyId = identity.properties[0]?.id; if (!propertyId) { setError("You don’t have a property application yet."); return; } const response = await fetch(`/api/upis/properties/${propertyId}`); if (!response.ok) throw new Error(); setData(await response.json() as StatusData); }).catch(() => setError("Please sign in to view your application status.")); }, []);
  const timeline = useMemo(() => {
    if (!data) return [];
    const passportIssued = includes(data.events, ["PASSPORT_ISSUED"]);
    return stages.map((stage) => ({ ...stage, completed: passportIssued || stage.complete(data.events, data) }));
  }, [data]);
  const currentIndex = timeline.findIndex((stage) => !stage.completed); const issued = currentIndex === -1; const latest = data?.events.at(-1);
  return <main className="min-h-screen bg-cream"><CitizenHeader/><section className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8"><p className="text-xs font-bold tracking-[.16em] text-saffron">PROPERTY VERIFICATION</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">{issued ? "Your Property Passport is ready." : "Here’s exactly where things stand."}</h1>{error ? <p className="mt-6 rounded-2xl bg-white p-5">{error}</p> : !data ? <p className="mt-6 text-sm text-[#647168]">Loading your UPIS application…</p> : <><div className="mt-5 rounded-2xl bg-[#eef5ed] p-5 text-sm leading-6 text-[#315e4c]"><strong>Latest update:</strong> {eventMessage(latest)}</div><div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-card sm:p-8"><div className="flex flex-wrap justify-between gap-4 border-b border-[#e3e9e2] pb-6"><div><p className="text-xs font-bold tracking-[.12em] text-[#728075]">APPLICATION</p><p className="mt-1 text-xl font-semibold">{data.application?.application_id}</p><p className="mt-1 text-sm text-[#647168]">Property {data.property.id}</p></div><span className={`h-fit rounded-full px-3 py-2 text-xs font-bold ${issued ? "bg-[#e9f3e8] text-moss" : "bg-[#fff5e9] text-[#875d21]"}`}>{issued ? "PASSPORT READY" : "VERIFICATION IN PROGRESS"}</span></div><div className="mt-8"><p className="text-xs font-bold tracking-[.14em] text-saffron">YOUR TIMELINE</p>{timeline.map((stage, index) => { const state = stage.completed ? "Completed" : index === currentIndex ? "In progress" : "Upcoming"; return <div className="flex gap-4 pt-6" key={stage.title}><div className="flex flex-col items-center"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${state === "Completed" ? "bg-moss text-white" : state === "In progress" ? "border-2 border-saffron bg-[#fff8f1] text-saffron" : "border border-[#c8d2c8] text-[#809083]"}`}>{state === "Completed" ? "✓" : state === "In progress" ? "→" : "○"}</span>{index < timeline.length - 1 && <span className={`mt-1 min-h-10 flex-1 w-px ${state === "Completed" ? "bg-moss" : "bg-[#dbe3da]"}`} />}</div><div className="pb-2"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{String(index + 1).padStart(2, "0")} {stage.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${state === "Completed" ? "bg-[#e9f3e8] text-moss" : state === "In progress" ? "bg-[#fff5e9] text-[#875d21]" : "bg-[#f1f4f0] text-[#728075]"}`}>{state}</span></div><p className="mt-1 text-sm leading-5 text-[#657267]">{stage.description}</p></div></div>; })}</div><Link href="/passport" className="mt-8 inline-flex w-full justify-center rounded-2xl bg-moss px-5 py-4 font-semibold text-white">View my Property Passport</Link></div></>}</section></main>;
}
