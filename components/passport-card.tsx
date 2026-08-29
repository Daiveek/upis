import { demoCitizen, properties } from "@/lib/mock-data";

export function PassportCard() {
  return <article className="float relative overflow-hidden rounded-[2rem] bg-[#315e4c] p-6 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 grain opacity-40" />
    <div className="relative">
      <div className="flex items-center justify-between text-[10px] font-bold tracking-[.2em] text-[#d2e2c9]"><span>PROPERTY PASSPORT</span><span>INDIA</span></div>
      <div className="mt-12 border-y border-white/20 py-4"><p className="text-[10px] tracking-[.18em] text-[#d2e2c9]">PASSPORT ID</p><p className="mt-1 text-2xl font-semibold tracking-[.08em]">{demoCitizen.passportId}</p></div>
      <div className="mt-5 flex justify-between gap-4"><div><p className="text-[10px] tracking-[.18em] text-[#d2e2c9]">HOLDER</p><p className="mt-1 font-medium">{demoCitizen.owner}</p></div><div><p className="text-[10px] tracking-[.18em] text-[#d2e2c9]">PROPERTIES</p><p className="mt-1 font-medium">{properties.length} on record</p></div></div>
      <div className="morse mt-8 h-12 rounded-xl border border-white/20 bg-[#e6eddc]" aria-label="Passport Signal visual" />
    </div>
  </article>;
}
