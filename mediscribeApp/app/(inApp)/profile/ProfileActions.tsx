"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogOut } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { updateUserPassword } from "@/lib/auth/updateUserPassword";

export function ProfileActions() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setLoading(true);

    const message = await updateUserPassword(password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
    setPassword("");
    setDone(true);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] p-5 dark:border-[#2E2A27] dark:bg-[#1C1917]">
        <h2 className="mb-3 text-[13px] font-bold text-[#1A1A18] dark:text-[#F3EEE6]">
          Change password
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error && (
            <p className="rounded-lg bg-[#C0492B]/10 px-3 py-2 text-[13px] font-medium text-[#C0492B] dark:text-[#E08A6E]">
              {error}
            </p>
          )}
          {done && (
            <p className="rounded-lg bg-[#10b981]/10 px-3 py-2 text-[13px] font-medium text-[#0e7a5f] dark:text-[#34d399]">
              Password updated.
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
          <Button type="submit" loading={loading} className="self-start">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center justify-center gap-2 self-center text-[13px] font-semibold text-[#8A7E72] transition-colors hover:text-[#C0492B] disabled:opacity-60 dark:text-[#9A8F82] dark:hover:text-[#E08A6E]"
      >
        <LogOut size={15} strokeWidth={2} />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

export default ProfileActions;
