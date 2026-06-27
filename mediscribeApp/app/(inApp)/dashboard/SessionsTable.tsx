import Link from "next/link";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

export type SessionRow = {
  id: string;
  status: string;
  started_at: string;
  segment_count: number;
};

export type SortKey = "started_at" | "status" | "segment_count";
export type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; sortable: true }[] = [
  { key: "started_at", label: "Date", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "segment_count", label: "Segments", sortable: true },
];

export function formatStartedAt(iso: string) {
  return new Date(iso).toLocaleString("he-IL");
}

export function SessionsTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  hasAnySessions,
  onClearFilters,
}: {
  rows: SessionRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  hasAnySessions: boolean;
  onClearFilters: () => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[#E8E2D9] px-4 py-6 text-center text-[13px] text-[#8A7E72] dark:border-[#2E2A27]">
        {hasAnySessions ? (
          <>
            No sessions match your filters.{" "}
            <button
              type="button"
              onClick={onClearFilters}
              className="font-semibold text-[#C15F3C] hover:text-[#AD512F] dark:hover:text-[#D97A5B]"
            >
              Clear filters
            </button>
          </>
        ) : (
          "עדיין אין מפגשים — צור מפגש חדש כדי להתחיל."
        )}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E8E2D9] dark:border-[#2E2A27]">
      <table className="w-full min-w-[480px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#E8E2D9] dark:border-[#2E2A27]">
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#8A7E72] dark:text-[#9A8F82]">
              ID
            </th>
            {COLUMNS.map((col) => (
              <th key={col.key} className="p-0">
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="flex w-full items-center gap-1 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8A7E72] transition-colors hover:text-[#4A3F35] dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]"
                >
                  {col.label}
                  {sortKey === col.key ? (
                    sortDir === "asc" ? (
                      <ChevronUp size={13} strokeWidth={2.5} />
                    ) : (
                      <ChevronDown size={13} strokeWidth={2.5} />
                    )
                  ) : (
                    <ArrowUpDown size={12} strokeWidth={2} className="opacity-40" />
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              className="border-b border-[#E8E2D9] last:border-0 hover:bg-[#F6F1EA] dark:border-[#2E2A27] dark:hover:bg-[#1F1B17]"
            >
              <td className="px-3 py-2.5">
                <Link
                  href={`/session/${s.id}`}
                  className="font-mono text-[12px] text-[#1A1A18] hover:text-[#C15F3C] dark:text-[#F3EEE6] dark:hover:text-[#D97A5B]"
                >
                  {s.id.slice(0, 8)}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-[12px] text-[#8A7E72] dark:text-[#9A8F82]">
                {formatStartedAt(s.started_at)}
              </td>
              <td className="px-3 py-2.5">
                <StatusPill status={s.status} />
              </td>
              <td className="px-3 py-2.5 text-[12px] text-[#8A7E72] dark:text-[#9A8F82]">
                {s.segment_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
      : status === "ended"
        ? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
        : status === "error"
          ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{status}</span>
  );
}

export default SessionsTable;
