import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-14 text-center bg-[#FAF7F4] dark:bg-[#141210]">
      <Logo size={42} animate />
      <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#1A1A18] dark:text-[#F3EEE6]">
        Coming soon
      </h1>
      <p className="max-w-sm text-[14px] text-[#8A7E72] dark:text-[#9A8F82]">
        Real-time voice transcription and smart summaries for the trauma team at Ziv Medical Center.
      </p>
      <Link
        href="/login"
        className="mt-2 rounded-lg bg-[#C15F3C] px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#AD512F]"
      >
        Sign in
      </Link>
    </main>
  );
}
