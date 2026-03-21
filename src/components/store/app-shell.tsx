import Link from "next/link";
import { Monitor, Smartphone, Sparkles, TabletSmartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BottomNav, DesktopNav } from "@/components/store/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-28 lg:pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(95,177,255,0.28),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(255,162,115,0.22),_transparent_35%)]" />
      <div className="relative mx-auto flex w-full max-w-[96rem] gap-6 px-4 pb-12 pt-5 sm:px-6 xl:px-8">
        <DesktopNav />
        <div className="min-w-0 flex-1">
          <header className="mb-8 rounded-[30px] border border-white/45 bg-white/70 px-5 py-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)] backdrop-blur md:px-6 md:py-5 lg:px-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <Link
                  href="/today"
                  className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink-strong)] md:text-3xl"
                >
                  OpenStore
                </Link>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                  An open source alternative app marketplace built to scale from
                  iPhone browsing to iPad and Mac storefront operations.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="muted" className="gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    iPhone
                  </Badge>
                  <Badge variant="muted" className="gap-1.5">
                    <TabletSmartphone className="h-3.5 w-3.5" />
                    iPad
                  </Badge>
                  <Badge variant="muted" className="gap-1.5">
                    <Monitor className="h-3.5 w-3.5" />
                    Mac
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/developer-console"
                  className="rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-[var(--ink-strong)] shadow-[inset_0_0_0_1px_rgba(19,38,65,0.08)]"
                >
                  Developer Console
                </Link>
                <Link
                  href="/ops-console"
                  className="rounded-full bg-[var(--ink-strong)] px-4 py-2 text-sm font-medium text-white"
                >
                  Ops Console
                </Link>
                <Badge>Prototype</Badge>
                <Badge variant="muted">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Adaptive Shell
                  </span>
                </Badge>
              </div>
            </div>
          </header>
          <main className="space-y-8">{children}</main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
