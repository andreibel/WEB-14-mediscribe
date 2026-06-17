"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Settings, User} from "lucide-react";
import {AnimatePresence, motion} from "motion/react";
import {Logo} from "@/components/app/Logo";
import {ThemeToggle} from "@/components/app/nav/ThemeToggle";
import {createClient} from "@/lib/supabase/client";
import type {NavAction, NavCircle, NavLink} from "./navTypes";

// ─── Context configs ──────────────────────────────────────────────────────────
// Each context defines which links appear on the left and which buttons on the right.
// Set hidden: true on any item to suppress it without deleting it.

const PUBLIC_LEFT_LINKS: NavLink[] = [
  {href: "/", label: "Home"},
  {href: "/about", label: "About"},
];

const PUBLIC_RIGHT_LINKS: NavAction[] = [
  {id: "login", label: "Login", href: "/login"},
  {id: "register", label: "Register", href: "/register"},
];


const PUBLIC_CIRCLES: NavCircle[] = [];

const APP_LEFT_LINKS: NavLink[] = [
  {href: "/dashboard", label: "Dashboard"},
];

// No href → rendered as a button; the onClick is injected in the component.
const APP_RIGHT_LINKS: NavAction[] = [
  {id: "logout", label: "Logout"},
];

const APP_CIRCLES: NavCircle[] = [
  {id: "settings", icon: Settings, href: "/settings", label: "Settings"},
  {id: "user", icon: User, href: "/profile", label: "Profile"},
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

const spring = {type: "spring" as const, stiffness: 500, damping: 32, mass: 0.8};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Global top nav. Which variant shows — public (Login/Register) vs app
 * (Dashboard/Logout) — is driven by AUTH STATE, never by the URL path.
 *
 * `initialAuthed` comes from the server layout so the correct nav renders on
 * first paint (no flash); `onAuthStateChange` then keeps it live across
 * login/logout without a full reload.
 */
export function AppNav({initialAuthed}: {initialAuthed: boolean}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(initialAuthed);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut(); // fires onAuthStateChange → setAuthed(false)
    router.push("/login");
    router.refresh(); // re-run Server Components so they see the cleared session
  }

  const left_links = authed ? APP_LEFT_LINKS : PUBLIC_LEFT_LINKS;
  const right_links = authed
    ? APP_RIGHT_LINKS.map(a => (a.id === "logout" ? {...a, onClick: handleLogout} : a))
    : PUBLIC_RIGHT_LINKS;
  const circles = authed ? APP_CIRCLES : PUBLIC_CIRCLES;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 px-4 sm:px-8">
      {/* Logo */}
      <Link href={authed ? "/dashboard" : "/"} className="mr-1 shrink-0"> <Logo size={22}/></Link>

      {/* Left: page left_links — shown in every section that has links */}
      <AnimatePresence initial={false}>
        {left_links.some(l => !l.hidden) && (
          <motion.nav key="nav-links" initial={{opacity: 0, scale: 0.88}} animate={{opacity: 1, scale: 1}}
                      exit={{opacity: 0, scale: 0.88}} transition={spring} className={`${pill} hidden sm:flex`}
          >
            {left_links.filter(l => !l.hidden).map(({href, label}) => {
              const active = pathname === href;
              return (
                <Link key={`${href}:${label}`} href={href} className="relative rounded-full px-4 py-1.5">
                  {active && (<motion.span layoutId="nav-bubble" className="absolute inset-0 rounded-full bg-[#C15F3C] shadow-sm" transition={spring}/>)}
                  <span className={`relative z-10 text-[13px] font-semibold transition-colors ${
                    active
                      ? "text-white" :
                      "text-[#4A3F35]/75 hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]"
                  }`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="flex-1"/>

      {/* Right: logged-out users get the animated segmented Login/Register pill */}
      {!authed ? (
        <div className={`${pill} text-[13px] font-semibold`}>
          {right_links.filter(a => !a.hidden && a.href).map(({id, label, href}) => {
            const active = pathname === href;
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
        /* Logged-in: action buttons (Logout) in the same pill */
        <div className={pill}>
          {right_links.filter(a => !a.hidden).map(({id, label, icon: Icon, href, onClick}, i) => {
            const isPrimary = i === right_links.filter(a => !a.hidden).length - 1;
            const classes = Icon && !label ? iconBtn : isPrimary ? btnPrimary : btn;
            return href ? (
              <Link key={id} href={href} className={classes}>
                {Icon && <Icon size={16} strokeWidth={2}/>}
                {label}
              </Link>
            ) : (
              <button key={id} type="button" onClick={onClick} className={classes}>
                {Icon && <Icon size={16} strokeWidth={2}/>}
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Circle icon buttons (user, settings, etc.) */}
      {circles.filter(c => !c.hidden).map(({id, icon: Icon, href, onClick, label}) =>
        href ? (
          <Link key={id} href={href} aria-label={label} className={iconBtn}>
            <Icon size={17} strokeWidth={2}/>
          </Link>
        ) : (
          <button key={id} type="button" onClick={onClick} aria-label={label} className={iconBtn}>
            <Icon size={17} strokeWidth={2}/>
          </button>
        )
      )}

      {/* Theme toggle — always available, on every page */}
      <ThemeToggle/>

    </header>
  );
}

export default AppNav;