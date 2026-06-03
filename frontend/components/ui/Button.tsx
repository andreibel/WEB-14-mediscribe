import { Loader2 } from "lucide-react";

type Variant = "primary" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-semibold h-10 px-5 " +
  "transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#211C18] " +
  "active:scale-[0.985] disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#C15F3C] text-white shadow-[0_8px_20px_-8px_rgba(193,95,60,0.55)] " +
    "hover:bg-[#AD512F] dark:hover:bg-[#D06B47]",
  outline:
    "bg-white text-[#3A332D] border border-[#E3DBD0] hover:bg-[#F6F1EA] hover:border-[#D5CABB] " +
    "dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:border-[#39332D] dark:hover:bg-[#2A251F]",
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[base, variants[variant], fullWidth ? "w-full" : "", className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
