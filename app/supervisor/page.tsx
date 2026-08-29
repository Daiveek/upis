"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PortalHeader } from "@/components/portal-header";

type StaffApplication = { applicationId: string; propertyId: string; ownerDisplayName: string; propertyAddress: string; scheduledVisit: string; status: string; verificationStatus: string };
type VerificationEvent = { id: string; action: string; status: string; timestamp: string; message: string };
type ApplicationDetail = StaffApplication & { verificationEvents: VerificationEvent[] };

const officerChecks = [
  ["PROPERTY_LOCATION_CHECKED", "Property existence and boundary checked"],
  ["OWNER_PRESENCE_CONFIRMED", "Applicant presence recorded"],
  ["DOCUMENTS_REVIEWED", "Submitted documents reviewed"],
  ["FIELD_VERIFICATION_COMPLETED", "Property photograph captured"],
] as const;

function friendlyError(status: number) {
  if (status === 401) return "A demo Supervisor session is required to continue.";
  if (status === 403) return "You do not have permission to approve property applications.";
  if (status === 404) return "This application could not be found.";
  return "The Supervisor portal is temporarily unavailable. Please try again.";
}

export default function SupervisorPage() {
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [sessionRequired, setSessionRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [clarification, setClarification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/upis/staff/applications", { cache: "no-store" });
      if (!response.ok) { setApplications([]); setApplication(null); setSessionRequired(response.status === 401); setError(friendlyError(response.status)); return; }
      const data = (await response.json()) as { applications?: StaffApplication[] };
      const records = data.applications ?? [];
      setApplications(records); setSessionRequired(false);
      setSelectedId((current) => current && records.some((item) => item.applicationId === current) ? current : (records[0]?.applicationId ?? ""));
    } catch { setError("The Supervisor portal is temporarily unavailable. Please try again."); }
    finally { setLoading(false); }
  }, []);

  const loadDetail = useCallback(async (applicationId: string) => {
    if (!applicationId) { setApplication(null); return; }
    setDetailLoading(true); setError("");
    try {
      const response = await fetch(`/api/upis/staff/applications/${encodeURIComponent(applicationId)}`, { cache: "no-store" });
      if (!response.ok) { setApplication(null); setSessionRequired(response.status === 401); setError(friendlyError(response.status)); return; }
      const data = (await response.json()) as { application?: ApplicationDetail };
      if (!data.application) { setApplication(null); setError("This application could not be found."); return; }
      setApplication(data.application); setSessionRequired(false);
    } catch { setApplication(null); setError("The Supervisor portal is temporarily unavailable. Please try again."); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => { void loadApplications(); }, [loadApplications]);
  useEffect(() => { void loadDetail(selectedId); }, [loadDetail, selectedId]);

  const completedChecks = useMemo(() => new Set(application?.verificationEvents.filter((event) => event.status === "complete").map((event) => event.action) ?? []), [application]);
  const officerComplete = officerChecks.every(([action]) => completedChecks.has(action));
  const approved = completedChecks.has("GOVERNMENT_APPROVAL_COMPLETED");
  const passportIssued = completedChecks.has("PASSPORT_ISSUED");
  const missingChecks = officerChecks.filter(([action]) => !completedChecks.has(action)).map(([, label]) => label);

  async function establishSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      const response = await fetch("/api/upis/staff/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessCode }) });
      if (!response.ok) { setError("That demo Supervisor access code was not recognised."); return; }
      setAccessCode(""); setSessionRequired(false); await loadApplications();
    } catch { setError("We couldn’t start the Supervisor session. Please try again."); }
  }

  async function approve() {
    if (!application || submitting) return;
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/upis/staff/applications/${encodeURIComponent(application.applicationId)}/approve`, { method: "POST" });
      const data = (await response.json()) as { code?: string; error?: string; missingActions?: string[] };
      if (!response.ok) {
        if (response.status === 409 && data.code === "OFFICER_VERIFICATION_INCOMPLETE") {
          const remaining = data.missingActions?.map((action) => action.replaceAll("_", " ").toLowerCase()).join(", ");
          setError(`Officer verification is not complete yet.${remaining ? ` Remaining checks: ${remaining}.` : ""}`);
        } else setError(data.error ?? friendlyError(response.status));
        return;
      }
      setConfirming(false); await Promise.all([loadDetail(application.applicationId), loadApplications()]);
      setSuccess("Approval completed. The Property Passport has been issued.");
    } catch { setError("We couldn’t complete approval right now. Please try again."); }
    finally { setSubmitting(false); }
  }

  return <main className="min-h-screen bg-[#edf1ed]"><PortalHeader role="SUPERVISOR PORTAL"/><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><p className="text-xs font-bold tracking-[.16em] text-saffron">SUPERVISORY REVIEW</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.04em] text-ink">Verification approvals</h1><p className="mt-2 text-[#607066]">Review field evidence and approve complete property-verification reports.</p>
    {sessionRequired && <section className="mt-8 max-w-md rounded-[1.75rem] bg-white p-6 shadow-card"><p className="text-xs font-bold tracking-[.14em] text-saffron">DEMO STAFF SIGN-IN</p><h2 className="mt-2 text-2xl font-semibold text-ink">Supervisor access required</h2><p className="mt-2 text-sm leading-6 text-[#617066]">Enter the configured demo access code to review persistent UPIS applications.</p><form onSubmit={establishSession} className="mt-5"><label className="text-sm font-semibold text-moss" htmlFor="supervisor-access-code">Demo Supervisor access code</label><input id="supervisor-access-code" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#bccabb] px-4 text-ink" required/><button className="mt-4 min-h-12 w-full rounded-2xl bg-moss px-4 font-semibold text-white">Start Supervisor session</button></form></section>}
    {!sessionRequired && !loading && <section className="mt-7 rounded-2xl bg-white p-4 shadow-card"><label className="text-xs font-bold tracking-[.14em] text-[#718075]" htmlFor="application-select">APPLICATION TO REVIEW</label><select id="application-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 font-semibold text-ink" disabled={!applications.length}>{applications.length ? applications.map((item) => <option key={item.applicationId} value={item.applicationId}>{item.applicationId} · {item.ownerDisplayName} · {item.propertyId}</option>) : <option>No applications available</option>}</select></section>}
    {loading && <section className="mt-8 rounded-[1.75rem] bg-white p-6 text-[#617066] shadow-card">Loading persistent applications…</section>}
    {error && <section className="mt-6 rounded-2xl border border-[#eed1c6] bg-[#fff6f2] p-5 text-sm text-[#743d2b]" role="alert">{error}</section>}
    {success && <p className="mt-6 rounded-2xl bg-[#eaf4e8] px-5 py-4 text-sm font-semibold text-moss" role="status">{success}</p>}
    {!sessionRequired && !loading && !applications.length && <section className="mt-8 rounded-[1.75rem] bg-white p-6 text-[#617066] shadow-card">There are no persistent applications ready for review.</section>}
    {!sessionRequired && application && !detailLoading && <>{approved ? <Success application={application} passportIssued={passportIssued}/> : <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-[1.75rem] bg-white p-6 shadow-card"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e1e7e0] pb-5"><div><p className="text-xs font-bold tracking-[.14em] text-[#718075]">APPLICATION</p><h2 className="mt-1 text-2xl font-semibold">{application.applicationId}</h2><p className="mt-1 text-[#617066]">{application.ownerDisplayName} · {application.propertyAddress}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${officerComplete ? "bg-[#eaf4e8] text-moss" : "bg-[#fff1df] text-[#9b6326]"}`}>{officerComplete ? "Field report complete" : "Awaiting field report"}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Summary label="Applicant" value={application.ownerDisplayName}/><Summary label="Property" value={application.propertyAddress}/><Summary label="Property ID" value={application.propertyId}/><Summary label="Scheduled visit" value={application.scheduledVisit}/><Summary label="Current status" value={application.status.replaceAll("_", " ")}/><Summary label="Verification" value={application.verificationStatus.replaceAll("_", " ")}/></div><div className="mt-6 rounded-2xl bg-[#f5f8f3] p-5"><p className="text-xs font-bold tracking-[.14em] text-saffron">VERIFICATION CHECKLIST</p><div className="mt-3 grid gap-2 text-sm font-medium text-[#34473a]">{officerChecks.map(([action, label]) => <p key={action}>{completedChecks.has(action) ? "✓" : "○"} {label}{action === "OWNER_PRESENCE_CONFIRMED" && <span className="font-normal text-[#68776d]"> (prototype simulation)</span>}</p>)}</div></div><div className="mt-6 border-t border-[#e1e7e0] pt-5"><p className="text-xs font-bold tracking-[.14em] text-saffron">VERIFICATION EVENTS</p><div className="mt-3 grid gap-3">{application.verificationEvents.map((event) => <div key={event.id} className="rounded-xl border border-[#dce4dc] p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{event.action.replaceAll("_", " ")}</strong><span className="text-[#68776d]">{new Date(event.timestamp).toLocaleString()}</span></div><p className="mt-1 text-[#617066]">{event.message}</p></div>)}</div></div></section><aside className="rounded-[1.75rem] bg-[#18261f] p-6 text-white"><p className="text-xs font-bold tracking-[.14em] text-[#bdcfbe]">DECISION</p><h2 className="mt-2 text-2xl font-semibold">Awaiting approval</h2><p className="mt-3 text-sm leading-6 text-[#d4e0d5]">Approve only after reviewing the complete officer verification report and evidence.</p><button disabled={!officerComplete} onClick={() => setConfirming(true)} className="mt-7 w-full rounded-2xl bg-[#d5b46b] px-4 py-4 font-bold text-[#18261f] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40">Approve property</button><button onClick={() => setClarification(true)} className="mt-3 w-full rounded-2xl border border-white/30 px-4 py-4 text-sm font-semibold">Request clarification</button>{!officerComplete && <p className="mt-3 text-xs leading-5 text-[#bdcfbe]">Officer field verification must be complete before approval.{missingChecks.length ? ` Remaining: ${missingChecks.join(", ")}.` : ""}</p>}</aside></div>}</>}
    {confirming && application && <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1813]/60 p-5"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[1.75rem] bg-white p-7 shadow-2xl"><p className="text-xs font-bold tracking-[.15em] text-saffron">FINAL CONFIRMATION</p><h2 className="mt-2 text-2xl font-semibold">Approve this property?</h2><div className="mt-5 rounded-2xl bg-[#f4f8f2] p-4 text-sm leading-6"><p><span className="text-[#6b796e]">Applicant</span><br/><strong>{application.ownerDisplayName}</strong></p><p className="mt-3"><span className="text-[#6b796e]">Property</span><br/><strong>{application.propertyAddress}</strong></p><p className="mt-3"><span className="text-[#6b796e]">Verification status</span><br/><strong className="text-moss">Field verification complete</strong></p></div><div className="mt-6 flex gap-3"><button onClick={() => setConfirming(false)} className="flex-1 rounded-2xl border border-[#bccabb] px-4 py-3 font-semibold text-moss">Cancel</button><button disabled={submitting} onClick={() => void approve()} className="flex-1 rounded-2xl bg-moss px-4 py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Approving…" : "Confirm approval"}</button></div></div></div>}
    {clarification && <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1813]/60 p-5"><div className="w-full max-w-md rounded-[1.75rem] bg-white p-7"><h2 className="text-2xl font-semibold">Clarification requested</h2><p className="mt-3 text-sm leading-6 text-[#617066]">This demo records the request without changing the application. In production, this would notify the officer with a structured question.</p><button onClick={() => setClarification(false)} className="mt-6 w-full rounded-2xl bg-moss px-4 py-3 font-semibold text-white">Close</button></div></div>}</div></main>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[#dce4dc] p-4"><p className="text-xs font-bold tracking-[.12em] text-[#718075]">{label.toUpperCase()}</p><p className="mt-2 font-medium leading-5 capitalize text-ink">{value}</p></div>; }
function Success({ application, passportIssued }: { application: ApplicationDetail; passportIssued: boolean }) { return <section className="mx-auto mt-12 max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-card"><span className="grid mx-auto h-16 w-16 place-items-center rounded-full bg-moss text-3xl text-white">✓</span><p className="mt-6 text-xs font-bold tracking-[.16em] text-saffron">PROPERTY VERIFIED</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Property approved</h2><p className="mt-4 text-[#617066]">{application.applicationId} is approved. {application.propertyId} is now verified{passportIssued ? " and the citizen’s Property Passport has been issued." : "."}</p><Link href="/register" className="mt-7 inline-flex rounded-2xl bg-moss px-5 py-3 font-semibold text-white">View citizen status</Link></section>; }
