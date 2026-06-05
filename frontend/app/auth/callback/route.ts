import {type EmailOtpType} from "@supabase/supabase-js";
import {NextResponse, type NextRequest} from "next/server";
import {createClient} from "@/lib/supabase/server";

/**
 * Auth redirect target for email links (password recovery, email confirm, etc.).
 *
 * With the DEFAULT Supabase email template + @supabase/ssr (PKCE), the link
 * returns a `?code=` we exchange for a session. If you later customize the
 * template to use `{{ .TokenHash }}`, it returns `token_hash` + `type` instead —
 * both are handled here. On success we forward to `next` (e.g. /reset-password).
 */
export async function GET(request: NextRequest) {
  const {searchParams, origin} = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (code) {
    const {error} = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (token_hash && type) {
    const {error} = await supabase.auth.verifyOtp({type, token_hash});
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Link missing/expired/invalid — send them back to ask for a new one.
  return NextResponse.redirect(`${origin}/forgot-password?error=link_invalid`);
}
