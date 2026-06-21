import { Logo } from "@/components/app/Logo";
import { createClient } from "@/lib/supabase/server";
import { NewSessionButton } from "./NewSessionButton";
import { SessionsExplorer } from "./SessionsExplorer";
import type { SessionRow } from "./SessionsTable";

export default async function DashboardPage() {
  const supabase = await createClient();

  // RLS scopes this to the signed-in user's own sessions.
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, status, started_at, segment_count")
    .order("started_at", { ascending: false })
    .limit(100);

  const rows = (sessions ?? []) as SessionRow[];

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 pt-20 pb-12 bg-[#FAF7F4] dark:bg-[#141210]">
      <div className="flex flex-col items-center gap-3">
        <Logo size={36} />
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
          Dashboard
        </span>
        <NewSessionButton />
      </div>

      <section className="w-full max-w-3xl">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8A7E72]">
          מפגשים אחרונים
        </h2>

        <SessionsExplorer rows={rows} />
      </section>
    </main>
  );
}
