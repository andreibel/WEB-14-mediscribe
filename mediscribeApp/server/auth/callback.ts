import {type EmailOtpType} from "@supabase/supabase-js";
import {createClient} from "@/lib/supabase/server";

/**
 * Backend logic for the email-link auth callback. No HTTP here — the route
 * handler (`app/api/auth/callback/route.ts`) reads the query params and redirects.
 */

/**
 * Exchange an email-link `code` (PKCE) or `tokenHash` + `type` (custom template)
 * for a session. Returns `true` if a session was established.
 *
 * With the DEFAULT Supabase email template + @supabase/ssr (PKCE) the link
 * returns a `?code=`. If the template is customized to use `{{ .TokenHash }}`,
 * it returns `token_hash` + `type` instead — both are handled here.
 */
export async function exchangeAuthLink(params: {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType | null;
}): Promise<boolean> {
  const supabase = await createClient();

  if (params.code) {
    const {error} = await supabase.auth.exchangeCodeForSession(params.code);
    return !error;
  }

  if (params.tokenHash && params.type) {
    const {error} = await supabase.auth.verifyOtp({
      type: params.type,
      token_hash: params.tokenHash,
    });
    return !error;
  }

  return false;
}