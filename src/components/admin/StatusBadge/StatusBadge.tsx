import type { AdminStatus } from "@/data/mock-admin";

type StatusBadgeProps = {
  status: AdminStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{status.replace("-", " ")}</span>;
}
