"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/actions";

const initialState = { message: "" };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="admin-login__form">
      <label htmlFor="admin-password">Password</label>
      <input
        autoComplete="current-password"
        autoFocus
        disabled={pending}
        id="admin-password"
        name="password"
        required
        type="password"
      />
      <p aria-live="polite" className="admin-login__error">
        {state.message}
      </p>
      <button
        className="admin-button admin-button--primary"
        disabled={pending}
        type="submit"
      >
        {pending ? "Authenticating..." : "Login"}
      </button>
    </form>
  );
}
