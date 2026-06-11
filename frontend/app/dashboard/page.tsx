import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { NewSessionButton } from "./NewSessionButton";

type SessionRow = {
  id: string;
  status: string;
  started_at: string;
  segment_count: number;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // RLS scopes this to the signed-in user's own sessions.
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, status, started_at, segment_count")
    .order("started_at", { ascending: false })
    .limit(10);

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

      <section className="w-full max-w-md">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8A7E72]">
          מפגשים אחרונים
        </h2>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#E8E2D9] dark:border-[#2E2A27] px-4 py-6 text-center text-[13px] text-[#8A7E72]">
            עדיין אין מפגשים — צור מפגש חדש כדי להתחיל.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rows.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/session/${s.id}`}
                  className="flex items-center justify-between rounded-lg border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FFFEF9] dark:bg-[#1C1917] px-3 py-2.5 hover:border-[#C15F3C] transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[12px] text-[#1A1A18] dark:text-[#F3EEE6]">
                      {s.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] text-[#8A7E72]">
                      {new Date(s.started_at).toLocaleString("he-IL")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8A7E72]">
                      {s.segment_count} segments
                    </span>
                    <StatusPill status={s.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "active" ? "bg-emerald-100 text-emerald-700"
    : status === "ended" ? "bg-gray-100 text-gray-600"
    : status === "error" ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {status}
    </span>
  );
}
