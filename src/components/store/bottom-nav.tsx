"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LibraryBig,
  Search,
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(100%-1.5rem,56rem)] rounded-[30px] border border-white/55 bg-[rgba(255,255,255,0.86)] p-2 shadow-[0_22px_50px_rgba(17,28,55,0.18)] backdrop-blur">
      <ul className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/today" && pathname.startsWith(item.href));
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
