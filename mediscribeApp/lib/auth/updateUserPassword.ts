import { createClient } from "@/lib/supabase/client";

/** Minimum length enforced on new passwords across the app. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate and apply a new password for the signed-in user. Shared by the
 * reset-password page and the profile "change password" form so the length
 * rule, message and Supabase call live in one place.
 *
 * Returns an error message to display, or `null` on success.
 */
export async function updateUserPassword(password: string): Promise<string | null> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error?.message ?? null;
}
