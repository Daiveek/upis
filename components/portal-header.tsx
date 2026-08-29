import Link from "next/link";

export function PortalHeader({ role }: { role: "VERIFICATION PORTAL" | "SUPERVISOR PORTAL" | "UPIS INTERNAL DEMO PORTAL" }) {
  return <header className="border-b border-[#253a30] bg-[#18261f] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#d5b46b] font-bold text-[#18261f]">P</span><span className="text-xs font-bold tracking-[.13em]">PROPERTY PASSPORT<br/><span className="text-[#afc4b2]">{role}</span></span></Link><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#d3dfd4]">Fictional internal workspace</span></div></header>;
}
