"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

/**
 * Navbar controls for the auth shell: the Login/Register segmented toggle
 * (route-aware) and the theme toggle — styled for the terracotta background.
 */
export function AuthNav() {
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/register");

  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("ms-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ms-theme", next ? "dark" : "light");
  }

  const seg = "rounded-full px-4 py-1.5 transition-colors";
  const active = "bg-white text-[#C15F3C] shadow-sm";
  const idle = "text-white/85 hover:text-white";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex rounded-full bg-white/12 p-1 text-[13px] font-semibold ring-1 ring-white/15 backdrop-blur">
        <Link href="/login" className={`${seg} ${!isRegister ? active : idle}`}>
          Login
        </Link>
        <Link href="/register" className={`${seg} ${isRegister ? active : idle}`}>
          Register
        </Link>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
      >
        {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
      </button>
    </div>
  );
}

export default AuthNav;
