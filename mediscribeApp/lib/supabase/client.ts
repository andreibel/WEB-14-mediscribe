import {createBrowserClient} from "@supabase/ssr";

/**
 * Supabase client for **browser / Client Components** ("use client").
 * Safe to use the publishable key here — it's meant to be public, and RLS
 * is what actually protects your data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
