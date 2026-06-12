"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Session cookie is now set — go to the app. refresh() re-runs Server Components.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Welcome back</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">Sign in to your mediscribe workspace.</p>
      </header>

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
        <TextField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox name="remember" label="Remember me" />
          <Link href="/forgot-password" className="text-[12.5px] font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} className="mt-1">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-[#A89D90] dark:text-[#6E665D]">
        <span className="h-px flex-1 bg-[#E8E2D9] dark:bg-[#2E2A27]" />
        or
        <span className="h-px flex-1 bg-[#E8E2D9] dark:bg-[#2E2A27]" />
      </div>



      <p className="mt-5 text-center text-[13px] text-[#8A7E72] dark:text-[#9A8F82]">
        New to mediscribe?{" "}
        <Link href="/register" className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]">Create an account</Link>
      </p>
    </div>
  );
}
