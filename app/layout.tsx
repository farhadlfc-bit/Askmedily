import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskMedily — Understand Your Medication",
  description: "Plain English medication information for patients, carers, and students. No jargon, just clear answers.",
  keywords: "medication information, drug information, side effects, plain english medicine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
