import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-strong)]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      {href && action ? (
        <Link
          href={href}
          className="text-sm font-medium text-[var(--accent-strong)] transition hover:opacity-80"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}
