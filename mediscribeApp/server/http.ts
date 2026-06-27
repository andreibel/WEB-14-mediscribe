import {NextResponse} from "next/server";
import type {User} from "@supabase/supabase-js";
import {createClient} from "@/lib/supabase/server";

/**
 * Shared helpers for the transport layer (`app/**\/route.ts`).
 *
 * These bridge the backend (`server/`) and HTTP: resolving the caller and
 * producing standard responses. Keep route handlers thin by using them.
 */

/** Resolve the signed-in user from the request cookies, or `null`. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  return user;
}

/** Standard 401 response for unauthenticated requests. */
export function unauthorized() {
  return NextResponse.json({error: "Unauthorized"}, {status: 401});
}