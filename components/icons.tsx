import type { ReactNode } from "react";

export function Icon({ children }: { children: ReactNode }) {
  return <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e5eee7] text-[#315e4c]">{children}</span>;
}

export const HomeIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-7h6v7"/></svg>;
export const KeyIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="15" r="3"/><path d="m10.1 12.9 8.5-8.5a2.12 2.12 0 0 1 3 3l-8.5 8.5"/><path d="m17 6 2 2"/></svg>;
export const ClockIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
export const FolderIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></svg>;
export const HelpIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-1.4.8-1.4 1.4-1.4 2.4"/><path d="M12 17h.01"/></svg>;
