import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Bookt", template: "%s | Bookt" }, description: "AI-first booking workflow for musicians." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
