import { demoCitizen, demoData } from "@/lib/mock-data";

const lines = ["• ━━━ • • ━", "━ • ━━━ •", "• • ━━━ ━", "━━━ • ━ •", "• ━ • • ━━━", "━ • • ━━━ •", "• ━━━ ━ •", "━━ • ━━━ •"];

export type PassportBookletCitizen = {
  passportId: string;
  name: string;
  signal: string;
  issueDate: string;
  credentialVersion: string;
  properties: Array<unknown>;
};

export function PassportBooklet({ compact = false, citizen }: { compact?: boolean; citizen?: PassportBookletCitizen }) {
  const identity = citizen ? { passportId: citizen.passportId, owner: citizen.name, credentialStatus: "Active" } : demoCitizen;
  const issueDate = citizen?.issueDate ?? demoData.issueDate;
  const version = citizen?.credentialVersion ?? demoData.credentialVersion;
  const count = citizen?.properties.length ?? 1;
  const signalLines = citizen ? citizen.signal.match(/.{1,18}/g) ?? lines : lines;
  return <article className={`relative overflow-hidden rounded-[2rem] bg-[#183e31] text-white shadow-2xl ${compact ? "p-6" : "p-7 sm:p-10"}`}>
    <div className="absolute inset-0 opacity-20" style={{backgroundImage:"repeating-linear-gradient(115deg,transparent 0,transparent 9px,rgba(255,255,255,.12) 10px,transparent 11px)"}}/>
    <div className="absolute inset-x-0 top-0 flex h-1"><span className="flex-1 bg-[#ea8a33]"/><span className="flex-1 bg-[#f7f2e5]"/><span className="flex-1 bg-[#4b9568]"/></div>
    <div className="relative"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold tracking-[.22em] text-[#d4e7cf]">UNIFIED PROPERTY IDENTITY SYSTEM</p><p className="mt-2 text-[10px] font-bold tracking-[.24em] text-[#d4e7cf]">PROPERTY PASSPORT</p><p className="mt-2 text-2xl font-semibold tracking-[.12em]">{identity.passportId}</p></div><span className="shrink-0 rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold tracking-[.15em] text-[#d4e7cf]">ACTIVE</span></div><div className="mt-7 grid grid-cols-3 gap-2 border-y border-white/20 py-4 text-[10px] text-[#d4e7cf]"><div><p className="tracking-[.12em]">ISSUED</p><p className="mt-1 font-medium text-white">{issueDate.toUpperCase()}</p></div><div><p className="tracking-[.12em]">VERSION</p><p className="mt-1 font-medium text-white">{version}</p></div><div><p className="tracking-[.12em]">PROPERTIES</p><p className="mt-1 font-medium text-white">{String(count).padStart(2, "0")} INDEXED</p></div></div><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#d4e7cf]">PASSPORT HOLDER</p><p className="mt-1 text-lg font-medium">{identity.owner}</p></div><span className="rounded-full border border-[#d5e5d1]/40 px-3 py-1.5 text-[9px] font-bold tracking-[.12em] text-[#d5e5d1]">PAN-LINKED IDENTITY</span></div><div className="mt-7"><p className="text-[10px] font-bold tracking-[.18em] text-[#d4e7cf]">PASSPORT SIGNAL</p><div className="mt-3 rounded-2xl border border-white/20 bg-[#113127] p-4 font-mono text-lg leading-7 tracking-[.13em] text-[#e5d1a2] sm:text-xl">{signalLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div></div><p className="mt-5 text-sm leading-5 text-[#d4e7cf]">Use this Signal to securely sign back in to your digital Property Passport.</p><p className="mt-4 text-[10px] font-bold tracking-[.2em] text-[#e5d1a2]">SCAN → VERIFY → ACCESS</p></div>
  </article>;
}
