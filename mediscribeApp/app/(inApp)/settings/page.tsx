import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readProtocolSettings } from "@/lib/preferences";
import { ProtocolDefaults } from "./ProtocolDefaults";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Local JWT verification (asymmetric keys) — avoids a round-trip to the Auth
  // server in Singapore that getUser() would incur.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/login");

  const { data } = await supabase
    .from("users")
    .select("preferences")
    .eq("id", claims.sub)
    .maybeSingle();

  const initial = readProtocolSettings(data?.preferences);

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 pt-20 pb-12 bg-[#FAF7F4] dark:bg-[#141210]">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
        Settings
      </span>

      <section className="flex w-full max-w-md flex-col gap-2">
        <h2 className="text-[13px] font-bold text-[#1A1A18] dark:text-[#F3EEE6]">
          Protocol defaults
        </h2>
        <p className="text-[12.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          Applies to every session unless changed during one.
        </p>
        <ProtocolDefaults initial={initial} />
      </section>
    </main>
  );
}
