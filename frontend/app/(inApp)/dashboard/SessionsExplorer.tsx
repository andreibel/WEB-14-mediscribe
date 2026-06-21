"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  SessionsTable,
  formatStartedAt,
  type SessionRow,
  type SortDir,
  type SortKey,
} from "./SessionsTable";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
  { value: "error", label: "Error" },
];

// Numeric/date columns read better newest-first; status reads better A→Z.
const DEFAULT_SORT_DIR: Record<SortKey, SortDir> = {
  started_at: "desc",
  status: "asc",
  segment_count: "desc",
};

export function SessionsExplorer({ rows }: { rows: SessionRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("started_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(DEFAULT_SORT_DIR[key]);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        formatStartedAt(r.started_at).toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "started_at") cmp = a.started_at.localeCompare(b.started_at);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = a.segment_count - b.segment_count;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, query, status, sortKey, sortDir]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#A89D90] dark:text-[#7C746B]"
          />
          <label htmlFor="session-search" className="sr-only">
            Search sessions
          </label>
          <input
            id="session-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, date, or status"
            className="h-9 w-full rounded-lg border border-[#E3DBD0] bg-white pl-9 pr-8 text-[13px] text-[#1A1A18] placeholder:text-[#B3A99C] outline-none transition-colors hover:border-[#D5CABB] focus:border-[#C15F3C] focus:ring-2 focus:ring-[#C15F3C]/25 dark:border-[#39332D] dark:bg-[#1A1714] dark:text-[#ECE5DB] dark:placeholder:text-[#6E665D] dark:hover:border-[#4A4339] dark:focus:border-[#D4775A] dark:focus:ring-[#D4775A]/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[#A89D90] transition-colors hover:text-[#1A1A18] dark:text-[#7C746B] dark:hover:text-[#E8E2D9]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={[
                "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                status === f.value
                  ? "bg-[#C15F3C] text-white"
                  : "bg-black/5 text-[#4A3F35]/75 hover:bg-black/8 hover:text-[#4A3F35] dark:bg-white/8 dark:text-[#9A8F82] dark:hover:text-[#D4C9BE]",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <SessionsTable
        rows={visibleRows}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        hasAnySessions={rows.length > 0}
        onClearFilters={clearFilters}
      />
    </div>
  );
}

export default SessionsExplorer;
