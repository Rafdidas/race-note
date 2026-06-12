"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("racenote-theme-change", callback);

  return () => {
    window.removeEventListener("racenote-theme-change", callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const nextTheme = theme === "light" ? "dark" : "light";

  function handleToggle() {
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem("racenote-theme", nextTheme);
    } catch {
      // The active theme still applies when browser storage is unavailable.
    }

    window.dispatchEvent(new Event("racenote-theme-change"));
  }

  return (
    <button
      aria-label={`${nextTheme === "dark" ? "다크" : "라이트"} 모드로 전환`}
      className="theme-toggle"
      onClick={handleToggle}
      suppressHydrationWarning
      type="button"
    >
      <span className="theme-toggle__marker" aria-hidden="true" />
      {theme.toUpperCase()}
    </button>
  );
}
