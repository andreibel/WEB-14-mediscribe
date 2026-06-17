"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FuzzyText from "@/components/ui/FuzzyText";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

// FuzzyText draws on a <canvas>, whose ctx.font does NOT support CSS clamp()/rem
// function values — only a numeric px size renders reliably. So compute a
// responsive number ourselves instead of passing a clamp() string.
function useResponsiveFontSize(min: number, vw: number, max: number) {
  const [size, setSize] = useState(max);
  useEffect(() => {
    const update = () => setSize(Math.max(min, Math.min(max, window.innerWidth * (vw / 100))));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [min, vw, max]);
  return size;
}

export default function NotFound() {
  const fontSize = useResponsiveFontSize(96, 24, 260);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 pt-14 text-center bg-[#FAF7F4] dark:bg-[#141210]">
      <FuzzyText
        fontSize={fontSize}
        fontWeight={900}
        color="#C15F3C"
        fps={20}
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover
      >
        404
      </FuzzyText>

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#1A1A18] dark:text-[#F3EEE6] sm:text-3xl">
          Page Not Found
        </h1>
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82] sm:text-base">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-[#4A3F35]/80 ring-1 ring-black/8 transition-colors hover:bg-black/5 hover:text-[#4A3F35] dark:text-[#9A8F82] dark:ring-white/10 dark:hover:bg-white/8 dark:hover:text-[#D4C9BE]"
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
