import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel/SectionLabel";

type EmptyStateProps = {
  index?: string;
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  index = "N/00",
  eyebrow = "No data",
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <section className="empty-state">
      <SectionLabel index={index}>{eyebrow}</SectionLabel>
      <h1>{title}</h1>
      <p className="type-korean">{description}</p>
      {actionHref && actionLabel && (
        <Link className="empty-state__action" href={actionHref}>
          {actionLabel} ↗
        </Link>
      )}
    </section>
  );
}
