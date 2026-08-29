import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Passport | Your home, in one place",
  description: "A citizen-first prototype for understanding and managing property records.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
