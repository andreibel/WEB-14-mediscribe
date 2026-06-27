import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

/**
 * Supabase client for **Server Components, Route Handlers, Server Actions**.
 * Reads the auth session from cookies so RLS knows who the user is.
 * Note: `cookies()` is async in Next 16, so this function is async too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({name, value, options}) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, which can't set cookies.
            // Safe to ignore — the middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
