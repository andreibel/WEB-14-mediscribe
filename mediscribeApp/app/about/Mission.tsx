import { Logo } from "@/components/app/Logo";

export function Mission() {
  return (
    <section className="flex flex-col items-center gap-7 px-4 pt-20 pb-16 text-center sm:pt-28">
      <Logo size={36} />

      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
          About
        </span>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#1A1A18] dark:text-[#F3EEE6]">
          Built for the trauma room
        </h1>
        <p className="max-w-[38ch] text-[14px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          mediscribe captures, structures, and charts a resuscitation as it
          happens — built for the trauma team at Ziv Medical Center.
        </p>
      </div>

      <p className="max-w-[34ch] text-[13px] leading-relaxed text-[#A89D90] dark:text-[#6E665D]">
        During a resuscitation, every second spent writing is a second not
        spent on the patient.
      </p>

      <p className="max-w-[30ch] text-[26px] font-extrabold leading-[1.25] tracking-[-0.02em] text-[#1A1A18] sm:text-[30px] dark:text-[#F3EEE6]">
        Reducing the documentation burden so clinicians can focus on what
        matters — <span className="text-[#C15F3C]">the patient</span>.
      </p>
    </section>
  );
}

export default Mission;
