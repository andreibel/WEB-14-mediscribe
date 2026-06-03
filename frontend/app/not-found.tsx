"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/Logo";

const spring = { type: "spring", stiffness: 500, damping: 32, mass: 0.8 };

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pt-14 text-center bg-[#FAF7F4] dark:bg-[#141210]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
      >
        <Logo size={36} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
          404
        </span>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#1A1A18] dark:text-[#F3EEE6]">
          Page not found
        </h1>
        <p className="max-w-[28ch] text-[14px] text-[#8A7E72] dark:text-[#9A8F82]">
          This page doesn't exist or was moved.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.1 }}
        className="flex rounded-full bg-black/5 p-1 text-[13px] font-semibold ring-1 ring-black/8 dark:bg-white/8 dark:ring-white/10"
      >
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className="relative rounded-full px-4 py-1.5">
            <motion.span
              layoutId="nav-bubble"
              className="absolute inset-0 rounded-full opacity-0"
              transition={spring}
            />
            <span className="relative z-10 text-[#4A3F35]/75 transition-colors hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]">
              {label}
            </span>
          </Link>
        ))}
      </motion.div>
    </main>
  );
}
