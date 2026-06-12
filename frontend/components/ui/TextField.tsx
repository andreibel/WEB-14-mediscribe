"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: React.ReactNode;
}

/** Labelled text input with optional leading icon, password reveal, error + hint. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon: Icon, error, hint, type = "text", id, className = "", ...props },
  ref
) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal ? "text" : type;
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
        <input
          ref={ref}
          id={fieldId}
          type={inputType}
          className={[
            "h-10 w-full rounded-lg border bg-white text-[14px] text-[#1A1A18] placeholder:text-[#B3A99C]",
            "transition-colors outline-none",
            "border-[#E3DBD0] hover:border-[#D5CABB]",
            "focus:border-[#C15F3C] focus:ring-2 focus:ring-[#C15F3C]/25",
            "dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:placeholder:text-[#6E665D]",
            "dark:border-[#39332D] dark:hover:border-[#4A4339]",
            "dark:focus:border-[#D4775A] dark:focus:ring-[#D4775A]/25",
            Icon ? "pl-9" : "pl-3",
            isPassword ? "pr-9" : "pr-3",
            error ? "!border-[#C0492B] focus:!ring-[#C0492B]/25" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#A89D90] transition-colors hover:text-[#1A1A18] dark:text-[#7C746B] dark:hover:text-[#E8E2D9]"
          >
            {reveal ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          </button>
        )}
      </div>
      {error ? (<p className="text-[12px] font-medium text-[#C0492B] dark:text-[#E08A6E]">{error}</p>) : hint ? (<p className="text-[12px] text-[#8A7E72] dark:text-[#9A8F82]">{hint}</p>) : null}
    </div>
  );
});

export default TextField;
