// Local date/time formatting for the MoH form and protocol timeline.
// Output is fixed-format (24h, DD/MM/YYYY) rather than locale-driven, so the
// values written into forms and sent to the AI are stable regardless of host.

const pad = (n: number) => String(n).padStart(2, '0')

/** DD/MM/YYYY for the given date (defaults to now). */
export function formatDate(d: Date = new Date()): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** HH:MM, 24-hour, for the given date (defaults to now). */
export function formatTime(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Current moment as { date, time } — injected into the form at session start. */
export function nowDateTime(): { date: string; time: string } {
  const d = new Date()
  return { date: formatDate(d), time: formatTime(d) }
}
