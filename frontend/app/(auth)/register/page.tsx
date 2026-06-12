"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Stethoscope } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "physician", label: "Physician" },
  { value: "nurse", label: "Nurse" },
  { value: "charge-nurse", label: "Charge nurse" },
  { value: "paramedic", label: "Paramedic" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const name = String(form.get("name") ?? "");
    const role = String(form.get("role") ?? "nurse");
    const pwd = String(form.get("password") ?? "");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      // These land in raw_user_meta_data → read by the handle_new_user() trigger
      // to populate the public.users profile row.
      options: { data: { name, role } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation is ON — no session yet. User must confirm via email.
      setNotice("Account created. Check your email to confirm, then sign in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Create your account</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Join your trauma team on mediscribe.
        </p>
      </header>

      {/* method="post" — see login: avoid leaking fields into the URL if the
          form is submitted before hydration. */}
      <form onSubmit={onSubmit} method="post" className="flex flex-col gap-3.5">
        {error && (
          <p className="rounded-lg bg-[#C0492B]/10 px-3 py-2 text-[13px] font-medium text-[#C0492B] dark:text-[#E08A6E]">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-[#10b981]/10 px-3 py-2 text-[13px] font-medium text-[#0e7a5f] dark:text-[#34d399]">
            {notice}
          </p>
        )}
        <TextField
          label="Full name"
          name="name"
          icon={User}
          placeholder="Dr. Dana Cohen"
          autoComplete="name"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Role" name="role" icon={Stethoscope} options={ROLES} defaultValue="physician" />
          <TextField
            label="Work email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@ziv…"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <TextField
            label="Password"
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

        <Checkbox
          name="terms"
          required
          className="mt-0.5"
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-[#C15F3C] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#C15F3C] hover:underline">
                Privacy Policy
              </Link>
              .
            </>
          }
        />

        <Button type="submit" fullWidth loading={loading} className="mt-1">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[#8A7E72] dark:text-[#9A8F82]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
