import type { ReactNode } from "react";
import { AnimatedLogo } from "@/components/AnimatedLogo";

/**
 * Auth shell: full terracotta background, top navbar (static logo + Login/
 * Register toggle + theme toggle), a big *animated* brand logo with the
 * tagline beneath it, and a compact card that holds the active page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F2EDE8] pt-14 text-[#1A1A18] dark:bg-[#241712] dark:text-white">
      {/* soft glow accents */}
      <div className="pointer-events-none fixed -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#C15F3C]/10 blur-3xl dark:bg-[#C15F3C]/20" />
      <div className="pointer-events-none fixed -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#D4956A]/12 blur-3xl dark:bg-[#C15F3C]/10" />

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-8">
        <div className="grid w-full max-w-[920px] items-center gap-12 lg:grid-cols-2">
          {/* Brand column: big ANIMATED logo + tagline beneath */}
          <div className="hidden flex-col items-center text-center lg:flex lg:items-start lg:text-left">
            <AnimatedLogo size={350} animate className="text-[#C15F3C] dark:text-white" />
            <h1 className="mt-7 max-w-[14ch] text-[32px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#1A1A18] dark:text-white">
              Documentation that keeps pace with the room.
            </h1>
            <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-[#8A7E72] dark:text-white/80">
              Real-time voice transcription and smart summaries for the trauma team at Ziv Medical
              Center.
            </p>
          </div>

          {/* Card column */}
          <div className="mx-auto w-full max-w-[380px]">
            <div className="rounded-2xl border border-black/5 bg-white p-6 text-[#1A1A18] shadow-[0_24px_60px_-20px_rgba(60,20,8,0.45)] dark:border-white/5 dark:bg-[#211C18] dark:text-[#ECE5DB] sm:p-7">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
