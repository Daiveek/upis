"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PortalHeader } from "@/components/portal-header";

type StaffApplication = {
  applicationId: string;
  propertyId: string;
  ownerDisplayName: string;
  propertyAddress: string;
  scheduledVisit: string;
  status: string;
  verificationStatus: string;
  verificationEvents: Array<{
    id: string;
    action: string;
    status: string;
    timestamp: string;
    message: string;
  }>;
};

const verificationActions = [
  ["PROPERTY_LOCATION_CHECKED", "Confirm property location", "Confirm that the property location has been checked."],
  ["OWNER_PRESENCE_CONFIRMED", "Confirm owner presence", "Record that the owner was present for verification."],
  ["DOCUMENTS_REVIEWED", "Confirm documents reviewed", "Record that the submitted documents have been reviewed."],
  ["FIELD_VERIFICATION_COMPLETED", "Complete field verification", "Mark the field verification as complete."],
] as const;

type VerificationAction = (typeof verificationActions)[number][0];

function isVerificationAction(action: string): action is VerificationAction {
  return verificationActions.some(([allowedAction]) => allowedAction === action);
}

function messageForStatus(status: number) {
  if (status === 401) return "A demo staff session is required to continue.";
  if (status === 403) return "You do not have permission to record officer verification.";
  if (status === 404) return "This application could not be found.";
  if (status === 409) return "This step is already complete or is not available yet.";
  return "We couldn’t save this verification action. Please try again.";
}

export default function OfficerVerificationPage() {
  const params = useParams<{ applicationId: string | string[] }>();
  const applicationId = Array.isArray(params.applicationId) ? params.applicationId[0] : params.applicationId;
  const [application, setApplication] = useState<StaffApplication | null>(null);
  const [completedActions, setCompletedActions] = useState<VerificationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<VerificationAction | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplication = useCallback(async () => {
    if (!applicationId) {
      setLoading(false);
      setError("This application could not be found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/upis/staff/applications/${encodeURIComponent(applicationId)}`, { cache: "no-store" });
      if (!response.ok) {
        setApplication(null);
        setError(messageForStatus(response.status));
        return;
      }

      const data = (await response.json()) as { application?: StaffApplication };
      if (!data.application) {
        setApplication(null);
        setError("This application could not be found.");
        return;
      }
      setApplication(data.application);
      setCompletedActions(data.application.verificationEvents.reduce<VerificationAction[]>((actions, event) => {
        if (event.status === "complete" && isVerificationAction(event.action)) actions.push(event.action);
        return actions;
      }, []));
    } catch {
      setApplication(null);
      setError("The verification portal is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const nextAction = useMemo(
    () => verificationActions.find(([action]) => !completedActions.includes(action))?.[0],
    [completedActions],
  );

  async function recordAction(action: VerificationAction) {
    if (!application || submitting || completedActions.includes(action)) return;

    setSubmitting(action);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/upis/staff/applications/${encodeURIComponent(application.applicationId)}/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        if (response.status === 409) await loadApplication();
        setError(messageForStatus(response.status));
        return;
      }

      await loadApplication();
      setSuccess("Verification step recorded. The citizen journey will now use this persistent update.");
    } catch {
      setError("We couldn’t save this verification action. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#173a34]">
      <PortalHeader role="UPIS INTERNAL DEMO PORTAL" />
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link href="/officer" className="text-sm font-semibold text-[#315f55] underline-offset-4 hover:underline">
          ← Back to applications
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#a64e2c]">FIELD VERIFICATION</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[#173a34]">Verify this property visit</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#56706a]">Record each visit step. The UPIS service checks the permitted order and saves every completed action.</p>
          </div>
          {application && <span className="rounded-full border border-[#b8c6bd] bg-white px-4 py-2 text-sm font-semibold text-[#315f55]">{application.verificationStatus.replaceAll("_", " ")}</span>}
        </div>

        {loading && <section className="mt-8 rounded-2xl border border-[#d8ded8] bg-white p-7 text-[#56706a]">Loading application details…</section>}

        {!loading && error && (
          <section className="mt-8 rounded-2xl border border-[#e2c2b7] bg-[#fff7f3] p-7" role="alert">
            <h2 className="font-serif text-2xl text-[#71371f]">Unable to open verification</h2>
            <p className="mt-2 text-[#71371f]">{error}</p>
            <button type="button" onClick={() => void loadApplication()} className="mt-5 min-h-11 rounded-lg bg-[#173a34] px-5 text-sm font-bold text-white hover:bg-[#0e2e29]">Try again</button>
          </section>
        )}

        {!loading && application && (
          <>
            {success && <p className="mt-7 rounded-xl border border-[#bdd4c0] bg-[#eff8ef] px-4 py-3 text-sm font-semibold text-[#255b36]" role="status">{success}</p>}

            <section className="mt-8 rounded-2xl border border-[#d8ded8] bg-white p-6 shadow-sm sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Application ID" value={application.applicationId} />
                <Detail label="Applicant" value={application.ownerDisplayName} />
                <Detail label="Property ID" value={application.propertyId} />
                <Detail label="Property" value={application.propertyAddress} />
                <Detail label="Scheduled visit" value={application.scheduledVisit} />
                <Detail label="Current status" value={application.status.replaceAll("_", " ")} />
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#a64e2c]">VERIFICATION PROGRESS</p>
                  <h2 className="mt-1 font-serif text-2xl">Complete each step in order</h2>
                </div>
                <span className="text-sm font-semibold text-[#56706a]">{completedActions.length} of {verificationActions.length} recorded</span>
              </div>
              <div className="grid gap-4">
                {verificationActions.map(([action, title, description], index) => {
                  const complete = completedActions.includes(action);
                  const available = action === nextAction;
                  return (
                    <article key={action} className="flex flex-col gap-4 rounded-2xl border border-[#d8ded8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${complete ? "bg-[#2b6940] text-white" : "bg-[#edf0ec] text-[#315f55]"}`}>{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                        <div><h3 className="font-semibold text-[#173a34]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#56706a]">{description}</p></div>
                      </div>
                      <button type="button" disabled={!available || Boolean(submitting)} onClick={() => void recordAction(action)} className="min-h-11 shrink-0 rounded-lg bg-[#173a34] px-5 text-sm font-bold text-white hover:bg-[#0e2e29] disabled:cursor-not-allowed disabled:bg-[#c7d0ca]">
                        {complete ? "Completed" : submitting === action ? "Saving…" : available ? "Record step" : "Complete previous step"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#71847a]">{label}</p><p className="mt-2 break-words text-sm font-semibold capitalize text-[#173a34]">{value}</p></div>;
}
