const STEPS = [
  {
    phase: "On arrival",
    title: "Start the session",
    body: "One tap when the patient comes in. mediscribe starts listening immediately.",
  },
  {
    phase: "As the team works",
    title: "Speak — don't stop to write",
    body: "Every voice in the room is transcribed and attributed to the right clinician, live.",
  },
  {
    phase: "While it unfolds",
    title: "The timeline builds itself",
    body: "Interventions, vitals, and events land on the protocol panel as they happen, not after.",
  },
  {
    phase: "After the case",
    title: "Review, then sign",
    body: "נספח ז is already filled in from the transcript and timeline. Check it and submit.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-[#8A7E72] dark:text-[#9A8F82]">
          How it works
        </h2>

        <ol className="relative mt-10 flex flex-col gap-10 border-l border-[#E8E2D9] pl-7 dark:border-[#2E2A27]">
          {STEPS.map((step) => (
            <li key={step.phase} className="relative">
              <span className="absolute top-1 -left-[33px] h-2.5 w-2.5 rounded-full bg-[#C15F3C] ring-4 ring-[#FAF7F4] dark:ring-[#141210]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C15F3C]">
                {step.phase}
              </span>
              <h3 className="mt-1 text-[16px] font-bold tracking-[-0.01em] text-[#1A1A18] dark:text-[#F3EEE6]">
                {step.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
