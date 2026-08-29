"use client";

import Link from "next/link";

const judgeSteps = [
  ["01", "Create a fictional UPIS identity", "Start with Create your UPIS Passport. Use only fictional details for the competition prototype.", "/create-account", "Create identity"],
  ["02", "Add one property", "Choose I bought a property, use the sample sale deed, review the details, and confirm them.", "/register", "Add property"],
  ["03", "Watch the verification journey", "Choose a property-visit time. UPIS will explain each verification stage as it progresses.", "/register", "View journey"],
  ["04", "Open the Property Passport", "After verification, download the Passport or open it to see the property portfolio and protected records.", "/passport", "Open Passport"],
  ["05", "Try return sign-in", "Use Scan a Passport to see how Passport Signal recognition leads back to the same portfolio.", "/scan", "Try scanner"],
] as const;

export function JudgeGuide({ close }: { close: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e1813]/65 p-4 sm:grid sm:place-items-center sm:p-8"><section role="dialog" aria-modal="true" aria-labelledby="judge-guide-title" className="mx-auto w-full max-w-4xl rounded-[2rem] bg-cream p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold tracking-[.16em] text-saffron">JUDGE WALKTHROUGH</p><h2 id="judge-guide-title" className="mt-2 text-3xl font-semibold tracking-[-.05em] text-ink">See the complete citizen journey.</h2><p className="mt-3 max-w-2xl leading-6 text-[#5e6d62]">This prototype takes about two minutes to explore. Every identity, property, document and verification step is fictional.</p></div><button onClick={close} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#bfccbf] text-xl text-moss" aria-label="Close judge guide">×</button></div><ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{judgeSteps.map(([number, title, description, href, label]) => <li key={number} className="flex min-h-56 flex-col rounded-3xl border border-[#dbe4da] bg-white p-5"><p className="text-xs font-bold tracking-[.15em] text-saffron">{number}</p><h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-[#66746a]">{description}</p><Link href={href} onClick={close} className="mt-auto pt-5 text-sm font-bold text-moss underline underline-offset-4">{label} →</Link></li>)}</ol><div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#315e4c] px-5 py-4 text-sm text-white"><p>Start from the citizen journey. Internal staff views are not needed for this walkthrough.</p><Link href="/create-account" onClick={close} className="rounded-xl bg-white px-4 py-2.5 font-semibold text-moss">Start the journey</Link></div></section></div>;
}
