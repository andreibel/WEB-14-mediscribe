"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, Building2 } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to your auth endpoint
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Welcome back</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Sign in to your mediscribe workspace.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
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
          <Link
            href="/forgot-password"
            className="text-[12.5px] font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
          >
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

      <Button variant="outline" fullWidth type="button">
        <Building2 size={16} strokeWidth={2} />
        Continue with Ziv SSO
      </Button>

      <p className="mt-5 text-center text-[13px] text-[#8A7E72] dark:text-[#9A8F82]">
        New to mediscribe?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
