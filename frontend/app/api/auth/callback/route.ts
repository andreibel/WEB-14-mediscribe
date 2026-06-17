import {type EmailOtpType} from "@supabase/supabase-js";
import {NextResponse, type NextRequest} from "next/server";
import {exchangeAuthLink} from "@/server/auth/callback";

/**
 * Auth redirect target for email links (password recovery, email confirm, etc.).
 * Lives under /api/auth/* alongside the other backend endpoints.
 * Transport layer only: read query params, run the exchange, redirect.
 * Business logic lives in `server/auth/callback.ts`.
 */
export async function GET(request: NextRequest) {
  const {searchParams, origin} = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const ok = await exchangeAuthLink({
    code: searchParams.get("code"),
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type") as EmailOtpType | null,
  });

  if (ok) return NextResponse.redirect(`${origin}${next}`);

  // Link missing/expired/invalid — send them back to ask for a new one.
  return NextResponse.redirect(`${origin}/forgot-password?error=link_invalid`);
}