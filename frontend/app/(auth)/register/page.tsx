"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, User, Stethoscope } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { PasswordStrength } from "@/components/ui/PasswordStrength";

const ROLES = [
  { value: "physician", label: "Physician" },
  { value: "nurse", label: "Nurse" },
  { value: "charge-nurse", label: "Charge nurse" },
  { value: "paramedic", label: "Paramedic" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to your registration endpoint
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5">
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">Create your account</h2>
        <p className="mt-1 text-[13.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Join your trauma team on mediscribe.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
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
