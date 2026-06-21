import Link from "next/link";
import { Logo } from "@/components/app/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E2D9] px-4 py-8 dark:border-[#2E2A27]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo size={18} showWordmark={false} />
        <p className="text-[12px] text-[#A89D90] dark:text-[#6E665D]">
          © {new Date().getFullYear()} mediscribe · Ziv Medical Center
        </p>
        <Link
          href="/about"
          className="text-[12px] font-semibold text-[#8A7E72] hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]"
        >
          About
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
