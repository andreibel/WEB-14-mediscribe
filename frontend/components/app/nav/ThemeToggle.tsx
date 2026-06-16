"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
  "text-[#6B5E52] ring-1 ring-black/10 hover:bg-black/5 " +
  "dark:text-[#9A8F82] dark:ring-white/10 dark:hover:bg-white/8";

export function ThemeToggle() {
  // The no-flash script in the root layout sets the initial `dark` class before
  // paint; we read that on mount so this toggle is the single source of truth.
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
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
