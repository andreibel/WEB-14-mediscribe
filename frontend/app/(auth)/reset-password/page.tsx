"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { createClient } from "@/lib/supabase/client";
import { updateUserPassword } from "@/lib/auth/updateUserPassword";

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The callback route already exchanged the email token for a recovery
  // session (cookies). Confirm it's there before showing the form.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setChecking(false);
    });
  }, []);

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const message = await updateUserPassword(password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-[#8A7E72] dark:text-[#9A8F82]">
        <Loader2 size={22} className="animate-spin" />
        <p className="text-[13.5px]">Verifying your reset link…</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C0492B]/12 text-[#C0492B]">
          <AlertTriangle size={24} strokeWidth={2} />
        </div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Link invalid or expired</h2>
        <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          This password reset link is no longer valid. Request a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 text-[13px] font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#10b981]/12 text-[#0e7a5f] dark:text-[#34d399]">
          <CheckCircle2 size={24} strokeWidth={2} />
        </div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Password updated</h2>
        <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-[#8A7E72] dark:text-[#9A8F82]">
          Your password has been changed. You can now sign in with it.
        </p>
        <Link href="/login" className="mt-5 w-full">
          <Button fullWidth>Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Set a new password</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Choose a strong password for your mediscribe account.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        {error && (
          <p className="rounded-lg bg-[#C0492B]/10 px-3 py-2 text-[13px] font-medium text-[#C0492B] dark:text-[#E08A6E]">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <TextField
            label="New password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrength value={password} />
        </div>
        <Button type="submit" fullWidth loading={loading} className="mt-1">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
