"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CitizenHeader } from "@/components/citizen-header";
import { PassportBooklet, type PassportBookletCitizen } from "@/components/passport-booklet";

type Property = { id: string; address: string; locality: string | null; area: string | null; status: string };
type CitizenPassport = Omit<PassportBookletCitizen, "properties"> & { properties: Property[] };

function downloadPassport(citizen: CitizenPassport) {
  const canvas = document.createElement("canvas"); canvas.width = 1600; canvas.height = 1000;
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  ctx.fillStyle = "#183e31"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  [["#ea8a33", 0], ["#f7f2e5", 28], ["#4b9568", 56]].forEach(([colour, y]) => { ctx.fillStyle = colour as string; ctx.fillRect(0, y as number, canvas.width, 28); });
  ctx.strokeStyle = "rgba(213,229,209,.45)"; ctx.lineWidth = 2; ctx.strokeRect(68, 112, 1464, 812);
  ctx.fillStyle = "#d5e5d1"; ctx.font = "bold 21px Arial"; ctx.fillText("UNIFIED PROPERTY IDENTITY SYSTEM", 115, 175);
  ctx.font = "bold 25px Arial"; ctx.fillText("PROPERTY PASSPORT", 115, 218);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 76px Arial"; ctx.fillText(citizen.passportId, 115, 318);
  ctx.fillStyle = "#d5e5d1"; ctx.font = "bold 20px Arial"; ctx.fillText("PASSPORT HOLDER", 115, 378);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 38px Arial"; ctx.fillText(citizen.name, 115, 426);
  ctx.fillStyle = "#d5e5d1"; ctx.font = "bold 18px Arial";
  ["PAN-LINKED IDENTITY", `ISSUED  ${citizen.issueDate.toUpperCase()}`, `VERSION  ${citizen.credentialVersion}`, `PROPERTIES  ${citizen.properties.length}`].forEach((line, index) => ctx.fillText(line, 115, 480 + index * 42));
  ctx.fillStyle = "#113127"; ctx.fillRect(820, 165, 595, 510); ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.strokeRect(820, 165, 595, 510);
  ctx.fillStyle = "#d5e5d1"; ctx.font = "bold 18px Arial"; ctx.fillText("PASSPORT SIGNAL", 860, 215);
  ctx.fillStyle = "#e5c97d"; ctx.font = "bold 25px monospace"; citizen.signal.match(/.{1,24}/g)?.slice(0, 10).forEach((line, index) => ctx.fillText(line, 860, 270 + index * 34));
  ctx.fillStyle = "#d5e5d1"; ctx.font = "20px Arial"; ctx.fillText("Use this Signal to securely sign back in.", 820, 730);
  ctx.fillStyle = "#e5c97d"; ctx.font = "bold 22px Arial"; ctx.fillText("SCAN → VERIFY → ACCESS", 115, 862);
  ctx.fillStyle = "#d5e5d1"; ctx.font = "18px Arial"; ctx.fillText("UPIS competition prototype credential", 115, 900);
  canvas.toBlob(async (blob) => { if (!blob) return; const asset = new Blob([await blob.arrayBuffer(), `\nPPASSPORT:${citizen.passportId}\n`], { type: "image/png" }); const link = document.createElement("a"); link.href = URL.createObjectURL(asset); link.download = `${citizen.passportId}-property-passport.png`; link.click(); URL.revokeObjectURL(link.href); }, "image/png");
}

export default function PassportPage() {
  const router = useRouter(); const [citizen, setCitizen] = useState<CitizenPassport>();
  useEffect(() => { fetch("/api/upis/me").then(async (response) => { if (!response.ok) { router.replace("/signin"); return; } const data = await response.json() as { citizen: { name: string }; passport?: { passportId: string; signal: string; issueDate: string | null; version: string }; properties: Property[] }; if (!data.passport) { router.replace("/register"); return; } setCitizen({ passportId: data.passport.passportId, name: data.citizen.name, signal: data.passport.signal, issueDate: data.passport.issueDate ?? "Current issue", credentialVersion: data.passport.version, properties: data.properties }); }).catch(() => router.replace("/signin")); }, [router]);
  useEffect(() => { if (!citizen || new URLSearchParams(window.location.search).get("download") !== "1") return; downloadPassport(citizen); router.replace("/passport"); }, [citizen, router]);
  if (!citizen) return <main className="min-h-screen bg-cream" />;
  const verifiedCount = citizen.properties.filter((property) => property.status === "verified").length;
  return <main className="min-h-screen bg-cream"><CitizenHeader/><section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-10"><div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="text-xs font-bold tracking-[.17em] text-saffron">UNIFIED PROPERTY IDENTITY SYSTEM</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.06em] text-ink sm:text-6xl">Your Property Passport.</h1><p className="mt-3 text-xl font-medium text-moss">One identity. Every property.</p><p className="mt-5 max-w-lg text-lg leading-8 text-[#59685e]">Your verified properties, documents and applications, all in one protected place.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => downloadPassport(citizen)} className="rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-white">Download Property Passport</button><Link href="/scan" className="rounded-2xl border border-[#b9c8ba] px-5 py-3 text-sm font-semibold text-moss">Sign in with a Passport</Link></div></div><PassportBooklet citizen={citizen}/></div><section className="mt-16 border-t border-[#dce4da] pt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-saffron">MY PROPERTIES</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{verifiedCount} verified {verifiedCount === 1 ? "property" : "properties"}</h2><p className="mt-2 text-sm text-[#657267]">Every property is linked to this same Property Passport — never a new account.</p></div><Link href="/register" className="rounded-full border border-[#b9c8ba] px-5 py-3 text-sm font-semibold text-moss">+ Add property</Link></div>{citizen.properties.length === 0 ? <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#bfd0bf] bg-white p-8 text-center sm:p-12"><h3 className="text-2xl font-semibold">Your Property Passport is ready.</h3><p className="mt-3 text-[#657267]">Add your first property to begin.</p><Link href="/register" className="mt-6 inline-flex rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-white">Add your first property</Link></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{citizen.properties.map((property) => <Link key={property.id} href={`/passport/property/${property.id}`} className="rounded-[1.75rem] border border-[#d8e2d8] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-card"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-2xl font-semibold text-moss">{property.id}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${property.status === "verified" ? "bg-[#e9f3e8] text-moss" : "bg-[#fff5e9] text-[#875d21]"}`}>{property.status === "verified" ? "Verified" : "In review"}</span></div><h3 className="mt-7 text-xl font-semibold">{property.address}</h3><p className="mt-1 text-[#647268]">{property.locality}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e5ebe4] pt-4 text-sm text-[#526158]"><span>{property.area || "Area recorded with application"}</span><span>Application linked</span></div></Link>)}</div>}</section></section></main>;
}
