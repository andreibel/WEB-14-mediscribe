import Link from "next/link";
import { AudioWaveform, Activity, ClipboardCheck, ArrowRight, type LucideIcon } from "lucide-react";
import { BackgroundSlot } from "./BackgroundSlot";

const FEATURES: { tag: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    tag: "Transcript",
    icon: AudioWaveform,
    title: "Live transcription",
    body: "Every word captured and attributed to the right clinician — no one stops to write.",
  },
  {
    tag: "Timeline",
    icon: Activity,
    title: "A structured timeline",
    body: "Vitals, interventions and events land on the panel as the case unfolds.",
  },
  {
    tag: "נספח ז",
    icon: ClipboardCheck,
    title: "The form, filled as you go",
    body: "The MoH trauma form auto-fills from the transcript — review and sign in minutes.",
  },
];

const cardBase =
  "rounded-2xl border border-[#E8E2D9] bg-[#FFFEF9] dark:border-[#2E2A27] dark:bg-[#1C1917]";

/**
 * Bento-grid hero for the homepage. Two large tiles on top — the pitch (left)
 * and a reserved visual slot (right) — then a row of feature tiles and a wide
 * call-to-action band. Folds to a single column on mobile.
 */
export function BentoGrid() {
  return (
    <section className="px-4 pt-24 pb-12 sm:pt-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Pitch tile (large) ───────────────────────────────────────── */}
          <div className={`${cardBase} flex flex-col justify-between gap-8 p-7 sm:col-span-2 sm:row-span-2`}>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
                Live in the trauma room
              </span>
              <h1 className="mt-5 text-[30px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#1A1A18] sm:text-[38px] dark:text-[#F3EEE6]">
                Real-time documentation for the{" "}
                <span className="text-[#C15F3C]">trauma room</span>.
              </h1>
              <p className="mt-4 max-w-[44ch] text-[14.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
                Built for the trauma team at Ziv Medical Center — captures the room,
                structures the case, fills the form.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#C15F3C] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(193,95,60,0.55)] outline-none transition-all duration-150 hover:bg-[#AD512F] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-[#D06B47] dark:focus-visible:ring-offset-[#141210]"
                >
                  Sign in
                </Link>
                {/* #how-it-works resolves to the sibling <HowItWorks> section,
                    rendered alongside this grid on the homepage (app/page.tsx).
                    The IDE can't see the cross-component target, so it flags a
                    false "unresolved anchor" here — the link works at runtime. */}
                <Link
                  href="#how-it-works"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E3DBD0] bg-white px-5 text-[14px] font-semibold text-[#3A332D] outline-none transition-all duration-150 hover:border-[#D5CABB] hover:bg-[#F6F1EA] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-[#39332D] dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:hover:bg-[#2A251F] dark:focus-visible:ring-offset-[#141210]"
                >
                  See how it works
                </Link>
              </div>
            </div>

            
          </div>

          {/* ── Reserved visual slot (large) ─────────────────────────────── */}
          <BackgroundSlot className="sm:col-span-2 sm:row-span-2" />

          {/* ── Feature tiles ────────────────────────────────────────────── */}
          {FEATURES.map(({ tag, icon: Icon, title, body }) => (
            <div key={tag} className={`${cardBase} flex flex-col gap-3 p-5`}>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C15F3C]">
                {tag}
              </span>
              <Icon size={22} strokeWidth={1.75} className="text-[#1A1A18] dark:text-[#F3EEE6]" />
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#1A1A18] dark:text-[#F3EEE6]">
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
                {body}
              </p>
            </div>
          ))}

          {/* ── CTA tile (accent) ────────────────────────────────────────── */}
          <Link
            href="/register"
            className="group flex flex-col justify-between gap-6 rounded-2xl bg-[#C15F3C] p-5 text-white shadow-[0_12px_28px_-12px_rgba(193,95,60,0.7)] outline-none transition-transform duration-150 hover:bg-[#AD512F] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#141210]"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
              Get started
            </span>
            <span className="text-[16px] font-bold leading-snug tracking-[-0.01em]">
              Create your Ziv workspace account
              <ArrowRight
                size={18}
                strokeWidth={2.25}
                className="ml-1 inline-block transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
