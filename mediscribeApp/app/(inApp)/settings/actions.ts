"use server";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeProtocolSettings,
  type ProtocolSettings,
} from "@/lib/preferences";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Persist the user's protocol-panel defaults into `users.preferences.protocol`.
 *
 * Read-modify-write so any other preference keys are preserved, and the input
 * is normalized server-side — the client can't write arbitrary jsonb. RLS
 * ("own row") is the real guard; the explicit user check just yields a clean
 * error instead of a silent zero-row update.
 */
export async function saveProtocolDefaults(
  input: ProtocolSettings,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const settings = normalizeProtocolSettings(input);

  const { data: current } = await supabase
    .from("users")
    .select("preferences")
    .eq("id", user.id)
    .maybeSingle();

  const preferences = {
    ...((current?.preferences as Record<string, unknown> | null) ?? {}),
    protocol: settings,
  };

  const { error } = await supabase
    .from("users")
    .update({ preferences })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}