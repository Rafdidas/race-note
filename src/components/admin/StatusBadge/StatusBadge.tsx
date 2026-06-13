import type { AdminStatus } from "@/types/admin-data";

type StatusBadgeProps = {
  status: AdminStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{status.replace("-", " ")}</span>;
}
