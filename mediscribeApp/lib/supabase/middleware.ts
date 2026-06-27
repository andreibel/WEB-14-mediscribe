import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";

// Pages that require a logged-in user.
const PROTECTED_PREFIXES = ["/dashboard", "/session", "/settings", "/profile", "/notifications"];

// Auth pages a logged-in user shouldn't see. NOTE: /reset-password and
// /api/auth/* are deliberately excluded — reset runs on a temporary recovery
// session, and /api/auth/callback must always be reachable to complete email links.
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password"];

/**
 * Runs on every request (via middleware.ts):
 *  1. Refreshes the auth token and writes the updated cookies onto the response.
 *  2. Gates routes — bounces logged-out users away from app pages, and
 *     logged-in users away from auth pages.
 *
 * Real data security is RLS in the database; this is the UX layer on top.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({request});

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({request});
          cookiesToSet.forEach(({name, value, options}) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run other code between createServerClient and the claims read.
  // getClaims() verifies the JWT signature locally against the project's published
  // ES256 public key (JWKS) — no network call to the Auth server in Singapore, which
  // is what made getUser() cost ~500-700ms on every request. Real security is RLS in
  // the DB; this is just the route-gating UX layer, so local verification is enough.
  const {
    data: claimsData,
  } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  const {pathname} = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some(p => pathname.startsWith(p));

  // Logged out → block app pages.
  if (!user && isProtected) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  // Logged in → keep them out of the auth pages.
  if (user && isAuthPage) {
    return redirectTo(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}

/** Redirect while preserving any auth cookies the session refresh just set. */
function redirectTo(request: NextRequest, base: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const response = NextResponse.redirect(url);
  base.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
  return response;
}
