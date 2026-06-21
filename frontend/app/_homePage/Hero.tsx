import Link from "next/link";
import { WaveformTimeline } from "./WaveformTimeline";

export function Hero() {
  return (
    <section className="px-4 pt-28 pb-20 text-center sm:pt-36 sm:pb-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
          Live in the trauma room
        </span>

        <WaveformTimeline className="mt-7 w-full max-w-xs" />

        <h1 className="mt-8 text-[34px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#1A1A18] sm:text-[44px] dark:text-[#F3EEE6]">
          Real-time documentation for the{" "}
          <span className="text-[#C15F3C]">trauma room</span>.
        </h1>

        <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          Built for the trauma team at Ziv Medical Center — captures the room,
          structures the case, fills the form.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#C15F3C] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(193,95,60,0.55)] outline-none transition-all duration-150 hover:bg-[#AD512F] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-[#D06B47] dark:focus-visible:ring-offset-[#141210]"
          >
            Sign in
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E3DBD0] bg-white px-5 text-[14px] font-semibold text-[#3A332D] outline-none transition-all duration-150 hover:border-[#D5CABB] hover:bg-[#F6F1EA] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-[#39332D] dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:hover:bg-[#2A251F] dark:focus-visible:ring-offset-[#141210]"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
