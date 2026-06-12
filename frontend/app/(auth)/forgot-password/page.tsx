"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, MailCheck } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // After they click the email link, land on the callback route, which
      // exchanges the token and forwards to /reset-password.
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSentTo(email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C15F3C]/12 text-[#C15F3C]">
          <MailCheck size={24} strokeWidth={2} />
        </div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Check your email</h2>
        <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          If an account exists for <span className="font-semibold text-[#3A332D] dark:text-[#CFC6BB]">{sentTo}</span>,
          a password reset link is on its way. It may take a minute (check spam too).
        </p>
        <Link href="/login" className="mt-5 text-[13px] font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]">Back to sign in </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Reset your password</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Enter your work email and we&apos;ll send you a reset link.
        </p>
      </header>

      {/* method="post" — see login: avoid leaking fields into the URL if the
          form is submitted before hydration. */}
      <form onSubmit={onSubmit} method="post" className="flex flex-col gap-3.5">
        {error && (<p className="rounded-lg bg-[#C0492B]/10 px-3 py-2 text-[13px] font-medium text-[#C0492B] dark:text-[#E08A6E]">{error}</p>)}
        <TextField
          label="Work email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@ziv.health.gov.il"
          autoComplete="email"
          required
        />
        <Button type="submit" fullWidth loading={loading} className="mt-1">
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[#8A7E72] dark:text-[#9A8F82]">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]">Sign in</Link>
      </p>
    </div>
  );
}
