"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiNavigator } from "@/components/ai-navigator";

type SessionState = "checking" | "signed-out" | "signed-in";

const howItWorks = [
  ["01", "Create your identity", "Your PAN-linked identity creates your unique UPIS Passport."],
  ["02", "Add your property", "Upload your Sale Deed and confirm the extracted details."],
  ["03", "Verify ownership", "A property visit, document checks and approval establish the verified record."],
  ["04", "Get your Property Passport", "Your verified property is added to your Passport."],
  ["05", "Add properties over time", "Every future property stays under the same identity."],
] as const;

const judgeSteps = [
  ["01", "Create a fictional UPIS identity", "Start with Create your UPIS Passport. Use only fictional details for the competition prototype.", "/create-account", "Create identity"],
  ["02", "Add one property", "Choose I bought a property, use the sample sale deed, review the details, and confirm them.", "/register", "Add property"],
  ["03", "Watch the verification journey", "Choose a property-visit time. UPIS will explain each verification stage as it progresses.", "/register", "View journey"],
  ["04", "Open the Property Passport", "After verification, download the Passport or open it to see the property portfolio and protected records.", "/passport", "Open Passport"],
  ["05", "Try return sign-in", "Use Scan a Passport to see how Passport Signal recognition leads back to the same portfolio.", "/scan", "Try scanner"],
] as const;

export default function Home() {
  const [session, setSession] = useState<SessionState>("checking");
  const [judgeGuideOpen, setJudgeGuideOpen] = useState(false);

  useEffect(() => {
    fetch("/api/upis/me", { cache: "no-store" })
      .then((response) => setSession(response.ok ? "signed-in" : "signed-out"))
      .catch(() => setSession("signed-out"));
  }, []);

  async function signOut() {
    await fetch("/api/upis/session", { method: "DELETE" });
    setSession("signed-out");
  }

  return <main className="min-h-screen overflow-x-hidden bg-cream">
    <header className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <Link className="flex items-center gap-3" href="#top" aria-label="UPIS home"><span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-lg font-bold text-white">U</span><span className="text-sm font-bold tracking-[.11em] text-ink">UPIS<br/><span className="text-[10px] tracking-[.08em] text-[#627067]">PROPERTY IDENTITY</span></span></Link>
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-[#526158]" aria-label="Primary navigation"><Link href="#top">Home</Link><Link href="#how-it-works">How it works</Link><button onClick={() => setJudgeGuideOpen(true)} className="rounded-full border border-[#d2b56c] bg-[#fff9eb] px-4 py-2 font-semibold text-[#765420]">Judge guide</button><Link href="/help">Help Center</Link>{session === "signed-in" ? <><Link href="/passport" className="text-moss">My Passport</Link><Link href="/register" className="text-moss">Add Property</Link><button onClick={() => void signOut()} className="rounded-full border border-[#b9c6b8] px-4 py-2 text-moss">Sign out</button></> : <Link href="/scan" className="rounded-full border border-[#b9c6b8] px-4 py-2 text-moss">Sign in</Link>}</nav>
    </header>

    <section id="top" className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-24 lg:pt-16">
      <div className="absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-[#e8d9b0]/40 blur-3xl" />
      <div><p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e5eee7] px-3 py-1.5 text-xs font-semibold text-moss"><Tricolour/>UNIFIED PROPERTY IDENTITY SYSTEM</p><h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.06em] text-ink sm:text-6xl lg:text-7xl">UNIFIED PROPERTY<br/>IDENTITY SYSTEM</h1><p className="mt-6 max-w-xl text-2xl font-medium leading-8 text-moss">One identity. Every property. One secure record.</p><p className="mt-4 max-w-xl text-lg leading-8 text-[#526158]">UPIS brings your property records, verification history and Property Passports together under one identity.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/create-account" className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-moss px-5 py-4 text-center text-sm font-bold tracking-[.06em] text-white">CREATE YOUR UPIS PASSPORT</Link><Link href="/scan" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[#a7b9a8] bg-white px-5 py-4 text-center text-sm font-bold tracking-[.06em] text-moss">SIGN IN WITH YOUR PASSPORT</Link></div><div id="assistant" className="mt-10"><AiNavigator/></div></div>
      <UpisConceptVisual />
    </section>

    <section id="how-it-works" className="border-y border-[#e2e5dd] bg-white/60"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[.16em] text-saffron">HOW UPIS WORKS</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">One clear path, from identity to verified property.</h2><p className="mt-3 text-[#526158]">UPIS keeps the journey simple while showing exactly where your record stands.</p></div><ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{howItWorks.map(([number, title, description]) => <li key={number} className="min-h-52 rounded-3xl border border-[#dde4dc] bg-white p-5"><p className="text-xs font-bold tracking-[.15em] text-saffron">{number}</p><h3 className="mt-6 text-lg font-semibold text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-[#69766d]">{description}</p></li>)}</ol></div></section>

    <section className="border-t border-[#e2e5dd] bg-[#f4f7f2]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[220px_1fr] md:items-center lg:px-10"><div className="relative mx-auto h-48 w-48 overflow-hidden rounded-[2rem] bg-[#315e4c] shadow-card"><Image src="/daiveekram-j.jpg" alt="Daiveekram J" fill sizes="192px" className="object-cover object-center" priority/><div className="absolute inset-x-0 top-0 flex h-1"><span className="flex-1 bg-[#ef8c3a]"/><span className="flex-1 bg-[#f7f2e5]"/><span className="flex-1 bg-[#3d8b4e]"/></div><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#183e31]/75 to-transparent px-4 pb-3 text-center text-[10px] font-bold tracking-[.18em] text-white">BENGALURU, INDIA</span></div><div className="max-w-2xl"><p className="text-xs font-bold tracking-[.16em] text-saffron">BUILT BY</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-ink sm:text-4xl">Daiveekram J</h2><p className="mt-3 text-lg font-medium text-moss">Entrepreneur based in Bengaluru.</p><p className="mt-4 leading-7 text-[#59685e]">I&apos;m interested in making important public-service journeys clearer, more human, and easier to complete. UPIS began with a simple question: what if every citizen could carry one understandable record for every property they own?</p></div></div></section>

    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-[#6c786f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><p>UPIS is a competition prototype, not an official government service.</p><div className="flex gap-4"><button onClick={() => setJudgeGuideOpen(true)}>Judge guide</button><Link href="/help">Help Center</Link><Link href="/scan">Sign in</Link></div></footer>
    {judgeGuideOpen && <JudgeGuide close={() => setJudgeGuideOpen(false)}/>} 
  </main>;
}

function JudgeGuide({ close }: { close: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e1813]/65 p-4 sm:grid sm:place-items-center sm:p-8"><section role="dialog" aria-modal="true" aria-labelledby="judge-guide-title" className="mx-auto w-full max-w-4xl rounded-[2rem] bg-cream p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold tracking-[.16em] text-saffron">JUDGE WALKTHROUGH</p><h2 id="judge-guide-title" className="mt-2 text-3xl font-semibold tracking-[-.05em] text-ink">See the complete citizen journey.</h2><p className="mt-3 max-w-2xl leading-6 text-[#5e6d62]">This prototype takes about two minutes to explore. Every identity, property, document and verification step is fictional.</p></div><button onClick={close} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#bfccbf] text-xl text-moss" aria-label="Close judge guide">×</button></div><ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{judgeSteps.map(([number, title, description, href, label]) => <li key={number} className="flex min-h-56 flex-col rounded-3xl border border-[#dbe4da] bg-white p-5"><p className="text-xs font-bold tracking-[.15em] text-saffron">{number}</p><h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-[#66746a]">{description}</p><Link href={href} onClick={close} className="mt-auto pt-5 text-sm font-bold text-moss underline underline-offset-4">{label} →</Link></li>)}</ol><div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#315e4c] px-5 py-4 text-sm text-white"><p>Start from the citizen journey. Internal staff views are not needed for this walkthrough.</p><Link href="/create-account" onClick={close} className="rounded-xl bg-white px-4 py-2.5 font-semibold text-moss">Start the journey</Link></div></section></div>;
}

function Tricolour() { return <span className="flex gap-px" aria-label="India"><i className="h-2 w-1 rounded-l bg-[#ef8c3a]"/><i className="h-2 w-1 bg-white"/><i className="h-2 w-1 rounded-r bg-[#3d8b4e]"/></span>; }

function UpisConceptVisual() {
  return <div className="relative mx-auto flex w-full max-w-lg items-center justify-center self-center py-8 lg:py-0"><div className="absolute h-80 w-80 rounded-full border border-[#d9e4d7] bg-[#edf3eb]/70"/><div className="relative w-full max-w-md rounded-[2rem] border border-[#d7e2d6] bg-white/90 p-6 shadow-card backdrop-blur"><div className="flex items-center justify-between"><p className="text-xs font-bold tracking-[.16em] text-moss">UPIS IDENTITY</p><Tricolour/></div><div className="mt-6 flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-moss text-xl font-bold text-white">U</span><div><p className="text-lg font-semibold text-ink">ONE IDENTITY</p><p className="text-sm text-[#657267]">Your secure UPIS record</p></div></div><div className="mx-7 my-5 h-8 border-l-2 border-dashed border-[#b4c8b4]"/><div className="grid gap-3 sm:grid-cols-2"><ConceptProperty label="Property 001" place="Verified property"/><ConceptProperty label="Property 002" place="Add when ready"/></div><div className="mx-7 my-5 h-8 border-l-2 border-dashed border-[#b4c8b4]"/><div className="rounded-2xl bg-[#315e4c] p-5 text-white"><p className="text-[10px] font-bold tracking-[.18em] text-[#d2e2c9]">ONE PROPERTY PASSPORT</p><p className="mt-2 text-sm leading-6 text-[#e9f1e5]">A single credential connects every verified property under your UPIS identity.</p><div className="morse mt-4 h-8 rounded-lg bg-[#e6eddc]" aria-label="Passport Signal visual"/></div></div></div>;
}

function ConceptProperty({ label, place }: { label: string; place: string }) { return <div className="rounded-2xl border border-[#dce6db] bg-[#f7faf6] p-4"><p className="text-xs font-bold tracking-[.12em] text-saffron">{label}</p><p className="mt-2 text-sm font-semibold text-ink">{place}</p></div>; }
