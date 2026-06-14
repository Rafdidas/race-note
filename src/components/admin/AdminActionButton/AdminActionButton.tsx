"use client";

import { useFormStatus } from "react-dom";

type AdminActionButtonProps = {
  children: string;
  className?: string;
  disabled?: boolean;
  pendingLabel: string;
};

export function AdminActionButton({
  children,
  className = "admin-button",
  disabled = false,
  pendingLabel,
}: AdminActionButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={disabled || pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}
