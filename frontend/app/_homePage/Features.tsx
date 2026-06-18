import { AudioWaveform, Activity, ClipboardCheck, type LucideIcon } from "lucide-react";

const FEATURES: { tag: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    tag: "Transcript",
    icon: AudioWaveform,
    title: "Live transcription, speaker by speaker",
    body: "Every word spoken in the room is captured and attributed to the right clinician in real time — no one stops to write.",
  },
  {
    tag: "Timeline",
    icon: Activity,
    title: "A structured timeline of the case",
    body: "Vitals, interventions, and events land on the protocol panel as the case unfolds, not reconstructed afterward.",
  },
  {
    tag: "נספח ז",
    icon: ClipboardCheck,
    title: "The trauma form, filled as you go",
    body: "The Ministry of Health trauma form auto-fills from the transcript and timeline — review and sign off in minutes.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-[#8A7E72] dark:text-[#9A8F82]">
          What happens in the room
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {FEATURES.map(({ tag, icon: Icon, title, body }) => (
            <div
              key={tag}
              className="overflow-hidden rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] dark:border-[#2E2A27] dark:bg-[#1C1917]"
            >
              <div className="h-[3px] bg-[#C15F3C]" />
              <div className="flex flex-col gap-3 p-5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C15F3C]">
                  {tag}
                </span>
                <Icon size={22} strokeWidth={1.75} className="text-[#1A1A18] dark:text-[#F3EEE6]" />
                <h3 className="text-[16px] font-bold tracking-[-0.01em] text-[#1A1A18] dark:text-[#F3EEE6]">
                  {title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
