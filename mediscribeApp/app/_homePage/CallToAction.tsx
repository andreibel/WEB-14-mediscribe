import Link from "next/link";

export function CallToAction() {
  return (
    <section className="border-t border-[#E8E2D9] px-4 py-16 text-center sm:py-20 dark:border-[#2E2A27]">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#1A1A18] dark:text-[#F3EEE6]">
          Ready to see it in the room?
        </h2>
        <p className="mt-2 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Sign in with your Ziv Medical Center workspace to get started.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#C15F3C] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(193,95,60,0.55)] outline-none transition-all duration-150 hover:bg-[#AD512F] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#C15F3C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-[#D06B47] dark:focus-visible:ring-offset-[#141210]"
        >
          Sign in
        </Link>
        <p className="mt-5 text-[13px] text-[#8A7E72] dark:text-[#9A8F82]">
          New to mediscribe?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default CallToAction;
