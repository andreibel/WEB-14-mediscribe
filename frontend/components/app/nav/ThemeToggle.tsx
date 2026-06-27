"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
  "text-[#6B5E52] ring-1 ring-black/10 hover:bg-black/5 " +
  "dark:text-[#9A8F82] dark:ring-white/10 dark:hover:bg-white/8";

// The `dark` class on <html> is the single source of truth (set pre-paint by the
// no-flash script in the root layout). Read it via useSyncExternalStore so the
// toggle stays in sync without a setState-in-effect, and re-renders if the class
// changes from anywhere.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => true; // matches SSR default; corrected pre-paint

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !dark;
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
