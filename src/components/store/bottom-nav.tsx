"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  DownloadCloud,
  LibraryBig,
  Monitor,
  Search,
  ShieldCheck,
  Smartphone,
  TabletSmartphone,
  Trophy,
  UserRound,
  Newspaper,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today", icon: Newspaper },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/charts", label: "Charts", icon: Trophy },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: LibraryBig },
  { href: "/account", label: "Account", icon: UserRound },
];

function isItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/today" && pathname.startsWith(href));
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-5 hidden w-72 shrink-0 self-start lg:flex lg:flex-col lg:gap-4">
      <div className="rounded-[34px] border border-white/45 bg-white/78 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
          Store Surfaces
        </p>
        <nav className="mt-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink-strong)]",
                  active &&
                    "bg-[var(--ink-strong)] text-white shadow-[0_14px_30px_rgba(17,28,55,0.18)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-[34px] border border-white/20 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.16)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/62">
          Form Factors
        </p>
        <div className="mt-4 grid gap-3">
          {[
            {
              label: "iPhone",
              detail: "Focused, thumb-first browsing and install flows.",
              icon: Smartphone,
            },
            {
              label: "iPad",
              detail: "Split attention, broader grids, and editorial context.",
              icon: TabletSmartphone,
            },
            {
              label: "Mac",
              detail: "Desktop-scale navigation, scanning, and operations.",
              icon: Monitor,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-[24px] bg-white/8 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-[#ffc47a]" />
                  <span>{item.label}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/74">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[34px] border border-white/45 bg-white/72 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
          Marketplace Work
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
          <li className="flex gap-3">
            <DownloadCloud className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
            <span>Installation and update flows cannot stay phone-only.</span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
            <span>Trust, moderation, and device controls need room on larger screens.</span>
          </li>
          <li className="flex gap-3">
            <Monitor className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
            <span>The desktop shell should feel like a product console, not a stretched phone app.</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(100%-1.5rem,56rem)] rounded-[30px] border border-white/55 bg-[rgba(255,255,255,0.86)] p-2 shadow-[0_22px_50px_rgba(17,28,55,0.18)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-3 text-[11px] font-medium text-[var(--ink-soft)] transition",
                  active && "bg-[var(--ink-strong)] text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
