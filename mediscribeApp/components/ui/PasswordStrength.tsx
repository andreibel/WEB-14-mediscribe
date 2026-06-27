"use client";

export function scorePassword(v: string): number {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 4);
}

const COLORS = ["", "#C0492B", "#D98A3D", "#7E8A4F", "#2F8A5B"];
const WORDS = ["—", "Weak", "Fair", "Good", "Strong"];

/** Four-segment strength meter + label. Pass the live password `value`. */
export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full bg-[#E8E2D9] transition-colors dark:bg-[#332D27]"
            style={i < score ? { background: COLORS[score] } : undefined}
          />
        ))}
      </div>
      <span
        className="w-[52px] text-right text-[11px] font-semibold text-[#A89D90] dark:text-[#7C746B]"
        style={score ? { color: COLORS[score] } : undefined}
      >
        {WORDS[score]}
      </span>
    </div>
  );
}

export default PasswordStrength;
