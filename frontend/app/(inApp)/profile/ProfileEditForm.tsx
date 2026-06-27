"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Languages, Stethoscope, Check } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { ROLE_OPTIONS } from "./roles";
import { updateProfile, type ProfileInput } from "./actions";

export function ProfileEditForm({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDone(false);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    startTransition(async () => {
      const res = await updateProfile(form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      router.refresh(); // re-render the server card above with saved values
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] p-5 dark:border-[#2E2A27] dark:bg-[#1C1917]"
    >
      <h2 className="text-[13px] font-bold text-[#1A1A18] dark:text-[#F3EEE6]">
        Edit profile
      </h2>

      {error && (
        <p className="rounded-lg bg-[#C0492B]/10 px-3 py-2 text-[13px] font-medium text-[#C0492B] dark:text-[#E08A6E]">
          {error}
        </p>
      )}
      {done && (
        <p className="flex items-center gap-1.5 rounded-lg bg-[#10b981]/10 px-3 py-2 text-[13px] font-medium text-[#0e7a5f] dark:text-[#34d399]">
          <Check size={14} strokeWidth={2.5} /> Profile saved.
        </p>
      )}

      <TextField
        label="Display name"
        icon={User}
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder='ד"ר כהן'
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Hebrew name"
          icon={Languages}
          value={form.name_he}
          onChange={(e) => set("name_he", e.target.value)}
          placeholder="כהן"
          hint="Used to match you in transcripts"
        />
        <TextField
          label="Latin name"
          value={form.name_en}
          onChange={(e) => set("name_en", e.target.value)}
          placeholder="cohen"
          hint="Optional — also aids matching"
        />
      </div>

      <SelectField
        label="Role"
        icon={Stethoscope}
        options={ROLE_OPTIONS}
        value={form.role}
        onChange={(e) => set("role", e.target.value)}
      />

      <TextField
        label="Role label (optional)"
        value={form.role_display}
        onChange={(e) => set("role_display", e.target.value)}
        placeholder="רופא מוביל"
        hint="Overrides the role shown in the transcript"
      />

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <TextField
          label="Initials"
          value={form.initials}
          onChange={(e) => set("initials", e.target.value)}
          placeholder="כה"
          maxLength={4}
          hint="Shown in your avatar"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-[#3A332D] dark:text-[#CFC6BB]">
            Avatar color
          </span>
          <div className="flex h-10 items-center gap-2">
            <input
              type="color"
              aria-label="Avatar color"
              value={/^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : "#8A7E72"}
              onChange={(e) => set("color", e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-[#E3DBD0] bg-white p-1 dark:border-[#39332D] dark:bg-[#1A1714]"
            />
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-sm"
              style={{ background: /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : "#8A7E72" }}
            >
              {form.initials.slice(0, 2) || "—"}
            </span>
          </div>
        </div>
      </div>

      <Button type="submit" loading={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

export default ProfileEditForm;