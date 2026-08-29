"use client";

import Link from "next/link";
import { useState } from "react";
import { demoData } from "@/lib/mock-data";
import { propertyService } from "@/lib/property-service";

const routes = [
  ["Citizen", "/register", "Add a property with the guided assistant"],
  ["Officer", "/officer", "Complete the fictional field visit"],
  ["Supervisor", "/supervisor", "Review and approve the evidence"],
  ["Passport", "/passport", "See the unified property index"],
  ["Scanner", "/scan", "Try secure access with the demo OTP"],
  ["Vault", "/passport/property/PROP-001/vault", "Open verified property documents"],
] as const;

export default function DemoPage() {
  const [reset, setReset] = useState(false);
  const resetDemo = () => { propertyService.resetDemo(); setReset(true); };
  return <main className="min-h-screen bg-cream text-ink">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-moss font-bold text-white">P</span><span className="text-sm font-bold tracking-[.11em]">PROPERTY<br/>PASSPORT</span></Link><span className="rounded-full bg-[#e5eee7] px-3 py-1.5 text-xs font-bold tracking-[.12em] text-moss">COMPETITION DEMO</span></header>
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8"><div className="rounded-[2rem] bg-[#183e31] px-6 py-10 text-white shadow-2xl sm:p-12"><p className="text-xs font-bold tracking-[.18em] text-[#d5e5d1]">PROPERTY PASSPORT DEMO</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl">ONE PERSON. ONE PROPERTY PASSPORT. EVERY PROPERTY.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#d5e5d1]">A calm, guided way for citizens to add, verify and access every property under one secure identity.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="rounded-2xl bg-[#e5c97d] px-5 py-4 font-semibold text-[#183e31]">Start Citizen Demo</Link><Link href="/demo/passport" className="rounded-2xl border border-white/30 px-5 py-4 font-semibold">Explore Passport</Link><Link href="/scan" className="rounded-2xl border border-white/30 px-5 py-4 font-semibold">Try Scanner</Link></div></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-[1.75rem] bg-white p-6 shadow-card sm:p-8"><p className="text-xs font-bold tracking-[.16em] text-saffron">DEMO CREDENTIALS</p><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Fact label="Citizen" value={demoData.owner}/><Fact label="Property Passport" value={demoData.passportId}/><Fact label="Application" value={demoData.applicationId}/><Fact label="Property" value={demoData.propertyAddress}/><Fact label="Property ID" value={demoData.propertyId}/><Fact label="Demo scanner OTP" value="123456"/></dl></section><section className="rounded-[1.75rem] border border-[#dce4da] bg-[#f5f8f3] p-6 sm:p-8"><p className="text-xs font-bold tracking-[.16em] text-saffron">RESET DEMO</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Start every walkthrough from the same state.</h2><p className="mt-3 text-sm leading-6 text-[#617066]">Reset returns the fictional application to a scheduled field-verification state. Nothing is sent to government systems.</p><button onClick={resetDemo} className="mt-6 min-h-12 rounded-2xl bg-moss px-5 py-3 font-semibold text-white">Reset Demo</button>{reset && <p role="status" className="mt-4 rounded-xl bg-[#e7f2e6] p-3 text-sm font-medium text-moss">Demo reset. The field visit is ready to be completed.</p>}</section></div>
      <section className="mt-10"><p className="text-xs font-bold tracking-[.16em] text-saffron">JUDGE’S GUIDE</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em]">A short, reliable walkthrough.</h2><ol className="mt-6 grid gap-3 md:grid-cols-4">{["Citizen begins with a guided property registration.", "Officer verifies the fictional property and documents.", "Supervisor approves the completed report.", "Citizen sees the verified property under one passport."].map((step, index) => <li key={step} className="rounded-2xl border border-[#dce4da] bg-white p-5"><span className="text-sm font-bold text-saffron">0{index + 1}</span><p className="mt-3 text-sm leading-6 text-[#47564c]">{step}</p></li>)}</ol></section>
      <section className="mt-10"><p className="text-xs font-bold tracking-[.16em] text-saffron">EXPLORE THE PROTOTYPE</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{routes.map(([name, href, description]) => <Link key={name} href={href} className="rounded-2xl border border-[#d8e2d8] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-card"><p className="font-semibold text-moss">{name} <span aria-hidden>→</span></p><p className="mt-2 text-sm leading-5 text-[#647168]">{description}</p></Link>)}</div></section>
      <aside className="mt-10 rounded-[1.75rem] bg-[#fff9eb] p-6 text-[#62491f]"><p className="text-xs font-bold tracking-[.16em]">PROTOTYPE SECURITY</p><p className="mt-2 max-w-3xl text-sm leading-6">This is a fictional competition prototype. It uses simulated verification, secure-access patterns and fictional documents only. No government record, real citizen identity or live property data is accessed.</p></aside>
    </section>
  </main>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f5f8f3] p-4"><dt className="text-[10px] font-bold tracking-[.14em] text-[#748177]">{label.toUpperCase()}</dt><dd className="mt-2 font-semibold text-ink">{value}</dd></div>; }
