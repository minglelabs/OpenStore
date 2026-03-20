import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import { AppShell } from "@/components/store/app-shell";
import "./globals.css";

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenStore",
  description: "An open source alternative to the Apple App Store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--bg-main)] text-[var(--ink-strong)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
