import { AnimatedLogo } from "./AnimatedLogo";

/**
 * Full mediscribe lockup: terracotta tile + two-tone wordmark.
 * Works on light and dark surfaces.
 */
export function Logo({
  size = 34,
  animate = false,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  animate?: boolean;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex items-center justify-center rounded-[24%] bg-[#C15F3C] text-white shadow-[0_6px_16px_-6px_rgba(193,95,60,0.5)]"
        style={{ width: size * 1.62, height: size * 1.62 }}
      >
        <AnimatedLogo size={size} animate={animate} />
      </span>
      {showWordmark && (
        <span
          className="font-bold tracking-[-0.035em] leading-none text-[#1A1A18] dark:text-[#F3EEE6]"
          style={{ fontSize: size * 0.74 }}
        >
          medi<span className="text-[#C15F3C]">scribe</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
