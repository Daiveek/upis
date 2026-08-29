"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CitizenHeader } from "@/components/citizen-header";

type PassportData = {
  citizen: { name: string };
  passport?: { passportId: string; signal: string; issueDate: string | null; version: string };
};

function isReplacementVersion(version: string) {
  return Number(version.match(/\d+/)?.[0] ?? "1") >= 2;
}

function friendlyError(status: number) {
  if (status === 401) return "Please sign in to request a replacement Passport.";
  if (status === 404) return "We couldn’t find a Property Passport for this account.";
  return "We couldn’t process the replacement right now. Please try again.";
}

export default function LostPassportPage() {
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPassport = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/upis/me", { cache: "no-store" });
      if (!response.ok) { setPassportData(null); setError(friendlyError(response.status)); return; }
      const data = (await response.json()) as PassportData;
      if (!data.passport) { setPassportData(null); setError("We couldn’t find a Property Passport for this account."); return; }
      setPassportData(data);
    } catch { setPassportData(null); setError("Your Passport details are temporarily unavailable. Please try again."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadPassport(); }, [loadPassport]);

  async function requestReplacement() {
    setProcessing(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/upis/passports/replacement", { method: "POST" });
      const result = (await response.json()) as { alreadyReplaced?: boolean; error?: string };
      if (!response.ok) { setError(result.error ?? friendlyError(response.status)); return; }
      setConfirming(false);
      await loadPassport();
      setNotice(result.alreadyReplaced ? "Your replacement Passport is already ready." : "Your replacement Passport is ready.");
    } catch { setError("We couldn’t process the replacement right now. Please try again."); }
    finally { setProcessing(false); }
  }

  const passport = passportData?.passport;
  const replacementReady = passport ? isReplacementVersion(passport.version) : false;

  return <main className="min-h-screen bg-cream"><CitizenHeader/><section className="mx-auto max-w-2xl px-5 pb-16 pt-12 text-center sm:px-8"><span className="grid mx-auto h-16 w-16 place-items-center rounded-full bg-[#fff0dd] text-3xl text-saffron">P</span><p className="mt-7 text-xs font-bold tracking-[.16em] text-saffron">PASSPORT REPLACEMENT</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Your records are safe.</h1><p className="mt-5 text-lg leading-8 text-[#5c6b60]">A lost physical Property Passport does not mean your property records are lost. Your credential can be replaced, while your Passport ID and property records remain unchanged.</p>
    {loading && <div className="mt-8 rounded-[1.75rem] bg-white p-6 text-left text-[#657267] shadow-card">Loading your secure Property Passport…</div>}
    {error && <div className="mt-8 rounded-[1.75rem] border border-[#efd0c3] bg-[#fff7f3] p-6 text-left" role="alert"><p className="text-lg font-semibold text-[#743d2b]">We need your Passport to continue</p><p className="mt-2 text-sm leading-6 text-[#743d2b]">{error}</p><button onClick={() => void loadPassport()} className="mt-5 rounded-2xl bg-moss px-5 py-3 font-semibold text-white">Try again</button></div>}
    {!loading && passport && <><div className="mt-8 rounded-[1.75rem] bg-white p-6 text-left shadow-card"><p className="text-xs font-bold tracking-[.14em] text-saffron">YOUR PROPERTY PASSPORT</p><p className="mt-2 text-lg font-semibold">{passport.passportId}</p><p className="mt-1 text-sm text-[#657267]">Owner: {passportData?.citizen.name} · Credential version: {passport.version}</p><p className="mt-5 rounded-xl bg-[#eef5ed] px-4 py-3 text-sm font-semibold text-moss">Passport signal and Property Passport ID remain connected to this same secure identity.</p></div>
      {replacementReady ? <div className="mt-8 rounded-[1.75rem] bg-white p-6 text-left shadow-card"><p className="text-xs font-bold tracking-[.14em] text-saffron">REPLACEMENT READY</p><p className="mt-2 text-lg font-semibold">Your replacement Passport is ready.</p><p className="mt-2 text-sm leading-6 text-[#657267]">The previous physical credential is no longer the active version. Your Passport ID, Passport Signal and verified property records remain unchanged.</p><p className="mt-5 rounded-xl bg-[#eef5ed] px-4 py-3 text-sm font-semibold text-moss">Active credential: {passport.version}</p></div> : <div className="mt-8 rounded-[1.75rem] bg-white p-6 text-left shadow-card"><p className="text-xs font-bold tracking-[.14em] text-saffron">REPLACEMENT PROCESS</p><p className="mt-2 text-lg font-semibold">Request a replacement physical Passport</p><p className="mt-2 text-sm leading-6 text-[#657267]">In a live service, an authorised support representative would confirm your identity before replacing the physical credential. This competition prototype keeps your existing secure identity and records unchanged.</p><button onClick={() => setConfirming(true)} className="mt-5 rounded-2xl bg-moss px-5 py-4 font-semibold text-white">Request replacement Passport</button></div>}
    </>}
    {notice && <p className="mt-6 rounded-xl bg-[#eef5ed] px-4 py-3 text-sm font-semibold text-moss" role="status">{notice}</p>}
    <Link href="/passport" className="mt-7 inline-flex rounded-2xl bg-moss px-5 py-4 font-semibold text-white">Return to Property Passport</Link></section>
    {confirming && passport && <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1813]/60 p-5"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[1.75rem] bg-white p-7 text-left shadow-2xl"><p className="text-xs font-bold tracking-[.15em] text-saffron">CONFIRM REPLACEMENT</p><h2 className="mt-2 text-2xl font-semibold">Replace this physical Passport?</h2><p className="mt-3 text-sm leading-6 text-[#617066]">Your Property Passport ID ({passport.passportId}), Passport Signal and verified records will stay with the same citizen identity.</p><div className="mt-6 flex gap-3"><button onClick={() => setConfirming(false)} disabled={processing} className="flex-1 rounded-2xl border border-[#bccabb] px-4 py-3 font-semibold text-moss">Cancel</button><button onClick={() => void requestReplacement()} disabled={processing} className="flex-1 rounded-2xl bg-moss px-4 py-3 font-semibold text-white disabled:opacity-60">{processing ? "Processing…" : "Confirm request"}</button></div></div></div>}</main>;
}
