import { type SelectHTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: LucideIcon;
  options: { value: string; label: string }[];
}

/** Labelled native <select> styled to match TextField. */
export function SelectField({
  label,
  icon: Icon,
  options,
  id,
  className = "",
  ...props
}: SelectFieldProps) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-[12.5px] font-semibold text-[#3A332D] dark:text-[#CFC6BB]"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A89D90] dark:text-[#7C746B]"
          />
        )}
        <select
          id={fieldId}
          className={[
            "h-10 w-full appearance-none rounded-lg border bg-white text-[14px] text-[#1A1A18]",
            "transition-colors outline-none cursor-pointer",
            "border-[#E3DBD0] hover:border-[#D5CABB]",
            "focus:border-[#C15F3C] focus:ring-2 focus:ring-[#C15F3C]/25",
            "dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:border-[#39332D] dark:hover:border-[#4A4339]",
            "dark:focus:border-[#D4775A] dark:focus:ring-[#D4775A]/25",
            Icon ? "pl-9" : "pl-3",
            "pr-8",
            className,
          ].join(" ")}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A89D90] dark:text-[#7C746B]"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

export default SelectField;
