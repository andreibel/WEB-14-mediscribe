import { Logo } from "@/components/Logo";

export default function DocsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pt-14 text-center bg-[#FAF7F4] dark:bg-[#141210]">
      <Logo size={36} />

      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
          Docs
        </span>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#1A1A18] dark:text-[#F3EEE6]">
          Documentation
        </h1>
        <p className="max-w-[38ch] text-[14px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          Full developer and user documentation is on its way. Check back soon.
        </p>
      </div>
    </main>
  );
}
