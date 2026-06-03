"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {Moon, Sun, User, Settings, Bell} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/Logo";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  href: string;
  label: string;
  hidden?: boolean;
}

interface NavAction {
  id: string;
  label?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  hidden?: boolean;
}

// Circle buttons — standalone rounded icon buttons like the theme toggle.
// Add user avatar, settings, notifications, etc. here.
interface NavCircle {
  id: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  label: string; // aria-label
  hidden?: boolean;
}

// ─── Context configs ──────────────────────────────────────────────────────────
// Each context defines which links appear on the left and which buttons on the right.
// Set hidden: true on any item to suppress it without deleting it.

const PUBLIC_LINKS: NavLink[] = [
  { href: "/",      label: "Home"  },
  { href: "/about", label: "About" },
  { href: "/docs",  label: "Docs"  },
];

const PUBLIC_ACTIONS: NavAction[] = [
  { id: "login",    label: "Login",    href: "/login"    },
  { id: "register", label: "Register", href: "/register" },
];

// Shown when the user is inside the app (dashboard, etc.)
const APP_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  // { href: "/patients", label: "Patients" },
  // { href: "/settings",  label: "Settings"  },
];

const APP_ACTIONS: NavAction[] = [
  // { id: "notifications", icon: Bell, href: "/notifications" },
  { id: "logout", label: "Logout", href: "/login" },
];

// Circle icon buttons per context.
const PUBLIC_CIRCLES: NavCircle[] = [
  // not logged in — no circle buttons
];

const APP_CIRCLES: NavCircle[] = [
  { id: "bell",     icon: Bell,     href: "/notifications", label: "Notifications" },
  { id: "settings", icon: Settings, href: "/settings",      label: "Settings"      },
  { id: "user",     icon: User,     href: "/profile",       label: "Profile"       },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────

// Shared pill container — used for both left nav links and right action buttons
const pill = "flex rounded-full bg-black/5 p-1 ring-1 ring-black/8 dark:bg-white/8 dark:ring-white/10";

const btn =
  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors " +
  "text-[#4A3F35]/75 hover:text-[#4A3F35] hover:bg-black/5 " +
  "dark:text-[#9A8F82] dark:hover:text-[#D4C9BE] dark:hover:bg-white/8";

const btnPrimary = "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors " +
  "bg-[#C15F3C] text-white hover:bg-[#AD512F]";

const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
  "text-[#6B5E52] ring-1 ring-black/10 hover:bg-black/5 " +
  "dark:text-[#9A8F82] dark:ring-white/10 dark:hover:bg-white/8";

const spring = { type: "spring" as const, stiffness: 500, damping: 32, mass: 0.8 };

// ─── Component ────────────────────────────────────────────────────────────────

export function AppNav() {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const isApp  = pathname?.startsWith("/dashboard"); // extend as needed

  const isPublic = !isAuth && !isApp;

  const links   = isApp ? APP_LINKS   : PUBLIC_LINKS;
  const actions = isApp ? APP_ACTIONS : PUBLIC_ACTIONS;
  const circles = isApp ? APP_CIRCLES : PUBLIC_CIRCLES;

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("ms-theme");
    return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Public pages are always dark — reset whenever the user lands on one.
  useEffect(() => {
    if (isPublic) {
      setDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("ms-theme", "dark");
    }
  }, [isPublic]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ms-theme", next ? "dark" : "light");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 px-4 sm:px-8">
      {/* Logo */}
      <Link href="/" className="mr-1 shrink-0"> <Logo size={22} /></Link>

      {/* Left: page links — hidden on auth pages */}
      <AnimatePresence initial={false}>
        {!isAuth && (
          <motion.nav
            key="nav-links"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={spring}
            className={`${pill} hidden sm:flex`}
          >
            {links.filter(l => !l.hidden).map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className="relative rounded-full px-4 py-1.5">
                  {active && (
                    <motion.span
                      layoutId="nav-bubble"
                      className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-[#2A2520]"
                      transition={spring}
                    />
                  )}
                  <span className={`relative z-10 text-[13px] font-semibold transition-colors ${
                    active
                      ? "text-[#C15F3C]"
                      : "text-[#4A3F35]/75 hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]"
                  }`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {/* Right: auth pages get the animated segmented pill */}
      {isAuth ? (
        <div className={`${pill} text-[13px] font-semibold`}>
          {actions.filter(a => !a.hidden).map(({ id, label, href }) => {
            const active = href ? pathname?.startsWith(href) : false;
            return (
              <Link key={id} href={href!} className="relative rounded-full px-4 py-1.5">
                {active && (
                  <motion.span
                    layoutId="auth-bubble"
                    className="absolute inset-0 rounded-full bg-[#C15F3C] shadow-sm"
                    transition={spring}
                  />
                )}
                <span className={`relative z-10 transition-colors ${
                  active
                    ? "text-white"
                    : "text-[#4A3F35]/75 hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]"
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        /* All other pages: action buttons in the same pill */
        <div className={pill}>
          {actions.filter(a => !a.hidden).map(({ id, label, icon: Icon, href, onClick }, i) => {
            const isPrimary = i === actions.filter(a => !a.hidden).length - 1;
            const classes = Icon && !label ? iconBtn : isPrimary ? btnPrimary : btn;
            return href ? (
              <Link key={id} href={href} className={classes}>
                {Icon && <Icon size={16} strokeWidth={2} />}
                {label}
              </Link>
            ) : (
              <button key={id} type="button" onClick={onClick} className={classes}>
                {Icon && <Icon size={16} strokeWidth={2} />}
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Circle icon buttons (user, settings, etc.) */}
      {circles.filter(c => !c.hidden).map(({ id, icon: Icon, href, onClick, label }) =>
        href ? (
          <Link key={id} href={href} aria-label={label} className={iconBtn}>
            <Icon size={17} strokeWidth={2} />
          </Link>
        ) : (
          <button key={id} type="button" onClick={onClick} aria-label={label} className={iconBtn}>
            <Icon size={17} strokeWidth={2} />
          </button>
        )
      )}

      {/* Theme toggle — hidden on public pages (always dark there) */}
      {!isPublic && (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className={iconBtn}
        >
          {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
        </button>
      )}

    </header>
  );
}

export default AppNav;
