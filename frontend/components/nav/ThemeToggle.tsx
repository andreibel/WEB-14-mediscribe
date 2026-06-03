"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
  "text-[#6B5E52] ring-1 ring-black/10 hover:bg-black/5 " +
  "dark:text-[#9A8F82] dark:ring-white/10 dark:hover:bg-white/8";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("ms-theme");
    return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync with external changes (e.g. public pages force dark mode)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ms-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={iconBtn}
    >
      {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
    </button>
  );
}
