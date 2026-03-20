import { notFound } from "next/navigation";
import { Globe2, ShieldCheck, Verified } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

type DeveloperDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DeveloperDetailPage({
  params,
}: DeveloperDetailPageProps) {
  const { slug } = await params;
  const caller = getCaller();
  const developer = await caller.store.developerBySlug({ slug }).catch(() => null);

  if (!developer) {
    notFound();
  }

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{developer.region}</Badge>
              {developer.verified ? <Badge variant="success">Verified developer</Badge> : null}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
              {developer.name}
            </h1>
            <p className="mt-2 text-lg text-[var(--ink-strong)]">{developer.headline}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
              {developer.description}
            </p>
          </div>
          <div className="rounded-[26px] bg-[var(--accent-soft)]/55 p-4 text-right">
            <p className="text-sm text-[var(--ink-soft)]">Founded</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              {developer.founded}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Portfolio"
            title="Published apps"
            description="Developer pages should make trust, focus, and catalog quality legible."
          />
          <div className="grid gap-4">
            {developer.apps.map((app) => (
              <AppRow key={app.slug} app={app} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="Focus areas" />
            <div className="mt-4 flex flex-wrap gap-2">
              {developer.focus.map((focus) => (
                <Badge key={focus} variant="muted">
                  {focus}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
            <SectionHeading title="Trust signals" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/82">
              <li className="flex gap-3">
                <Verified className="mt-1 h-4 w-4 shrink-0 text-[#ffcb83]" />
                <span>Identity and region are clearly visible before install time.</span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#ffcb83]" />
                <span>Catalog pages help users assess whether this team ships consistently.</span>
              </li>
              <li className="flex gap-3">
                <Globe2 className="mt-1 h-4 w-4 shrink-0 text-[#ffcb83]" />
                <span>Future versions should surface website, support, and policy links.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
