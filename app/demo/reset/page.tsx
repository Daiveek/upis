"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { propertyService } from "@/lib/property-service";

export default function DemoResetPage() { const [complete, setComplete] = useState(false); useEffect(() => { propertyService.resetDemo(); setComplete(true); }, []); return <main className="grid min-h-screen place-items-center bg-cream px-5"><section className="max-w-md rounded-[1.75rem] bg-white p-8 text-center shadow-card"><p className="text-xs font-bold tracking-[.16em] text-saffron">DEMO CONTROL</p><h1 className="mt-3 text-3xl font-semibold">{complete ? "Demo reset" : "Resetting demo…"}</h1><p className="mt-4 leading-6 text-[#617066]">APP-2026-001 is ready for field verification. The Property Passport has not been issued in this reset state.</p><Link href="/" className="mt-7 inline-flex rounded-2xl bg-moss px-5 py-3 font-semibold text-white">Return to demo home</Link></section></main>; }
