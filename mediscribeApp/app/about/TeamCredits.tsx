const TEAM: { name: string; initials: string; color: string }[] = [
  { name: "Linoy Cohen", initials: "LC", color: "#C15F3C" },
  { name: "Asaf Eliyahu", initials: "AE", color: "#4A7C82" },
  { name: "Tehila Ben Dahan", initials: "TB", color: "#8A6FA0" },
  { name: "Etay Ofir", initials: "EO", color: "#B08D3E" },
  { name: "Andrei Bel", initials: "AB", color: "#5B7B4F" },
];

/** Credits, styled like a trauma-room shift board — the same colored
 * initials-avatar language used for real staff in the transcript and
 * profile views, just for the people who built the tool. */
export function TeamCredits() {
  return (
    <section className="flex flex-col items-center gap-6 border-t border-[#E8E2D9] px-4 py-14 text-center dark:border-[#2E2A27]">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8A7E72] dark:text-[#9A8F82]">
        The team
      </span>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {TEAM.map(({ name, initials, color }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-sm"
              style={{ background: color }}
            >
              {initials}
            </div>
            <span className="text-[12.5px] font-semibold text-[#3A332D] dark:text-[#ECE5DB]">
              {name}
            </span>
          </div>
        ))}
      </div>

      <p className="max-w-[40ch] text-[12.5px] leading-relaxed text-[#A89D90] dark:text-[#6E665D]">
        Built by five Information Systems & Software Engineering students for
        the Advanced Web Technologies course.
      </p>
    </section>
  );
}

export default TeamCredits;
