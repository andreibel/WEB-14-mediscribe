import type { LucideIcon } from "lucide-react";

type ToggleSize = "sm" | "md";

interface ToggleProps {
  icon: LucideIcon;
  label: string;
  on: boolean;
  onClick: () => void;
  /** "sm" (default) matches the cramped in-session popover; "md" suits a full page. */
  size?: ToggleSize;
}

const SIZES: Record<
  ToggleSize,
  { pad: string; gap: string; label: string; icon: number; track: string; knob: string; knobOn: string }
> = {
  sm: {
    pad: "px-2 py-1.5",
    gap: "gap-2",
    label: "text-[11.5px]",
    icon: 13,
    track: "h-4 w-7",
    knob: "h-3 w-3",
    knobOn: "translate-x-[0.875rem]",
  },
  md: {
    pad: "px-3 py-2.5",
    gap: "gap-2.5",
    label: "text-[13.5px]",
    icon: 15,
    track: "h-5 w-9",
    knob: "h-4 w-4",
    knobOn: "translate-x-[1.125rem]",
  },
};

/** Labelled on/off switch with a leading icon, used for settings rows. */
export function Toggle({ icon: Icon, label, on, onClick, size = "sm" }: ToggleProps) {
  const s = SIZES[size];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between ${s.gap} rounded-lg ${s.pad} text-right hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724]`}
    >
      <span className={`flex items-center gap-2 ${s.label} font-medium text-[#4a4640] dark:text-[#C0BDB8]`}>
        <Icon size={s.icon} className="text-[#8A7E72]" /> {label}
      </span>
      <span
        dir="ltr"
        className={[
          `relative inline-flex shrink-0 items-center rounded-full transition-colors ${s.track}`,
          on ? "bg-[#c15f3c]" : "bg-[#cfc8bd] dark:bg-[#3a3835]",
        ].join(" ")}
      >
        <span
          className={[
            `inline-block rounded-full bg-white shadow-sm transition-transform ${s.knob}`,
            on ? s.knobOn : "translate-x-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export default Toggle;
