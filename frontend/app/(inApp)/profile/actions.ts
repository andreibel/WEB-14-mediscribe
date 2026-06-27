"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isRole } from "./roles";

export type ProfileInput = {
  name: string;
  name_he: string;
  name_en: string;
  role: string;
  role_display: string;
  initials: string;
  color: string;
};

type ActionResult = { ok: true } | { ok: false; error: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Update the signed-in user's own row in public.users. These fields also drive
 * the live transcript speaker UI (avatar initials/color, name-based fuzzy
 * matching via useStaff), so they're validated rather than trusted. RLS
 * ("own row") scopes the write to auth.uid(); we never accept an id from the
 * client.
 */
export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };

  if (!isRole(input.role)) return { ok: false, error: "Invalid role." };

  const initials = input.initials.trim();
  if (initials.length < 1 || initials.length > 4) {
    return { ok: false, error: "Initials must be 1–4 characters." };
  }

  const color = input.color.trim();
  if (!HEX_COLOR.test(color)) {
    return { ok: false, error: "Color must be a hex value like #C15F3C." };
  }

  // Empty optional text fields are stored as NULL (name_he is NOT NULL → "").
  const name_en = input.name_en.trim();
  const role_display = input.role_display.trim();

  const { error } = await supabase
    .from("users")
    .update({
      name,
      name_he: input.name_he.trim(),
      name_en: name_en || null,
      role: input.role,
      role_display: role_display || null,
      initials,
      color,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}