import { type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

/** Brand checkbox with a custom terracotta box (peer-driven, no JS). */
export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  const fieldId = id || props.name || "checkbox";
  return (
    <label htmlFor={fieldId} className={`group flex cursor-pointer items-start gap-2.5 ${className}`}>
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          id={fieldId}
          type="checkbox"
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-[5px] border border-[#D5CABB] bg-white transition-colors checked:border-[#C15F3C] checked:bg-[#C15F3C] dark:border-[#4A4339] dark:bg-[#1A1714] dark:checked:border-[#C15F3C] dark:checked:bg-[#C15F3C]"
          {...props}
        />
        <Check
          size={12}
          strokeWidth={3.2}
          className="pointer-events-none relative text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span className="text-[13.5px] leading-snug text-[#6B6056] dark:text-[#A89D90]">{label}</span>
    </label>
  );
}

export default Checkbox;
