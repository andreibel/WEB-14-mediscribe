import type { TimerStatus } from '../types'

const COLORS: Record<TimerStatus, string> = {
  idle: '#B1ADA1',
  counting: '#3FA37A',
  due: '#E0892E',
  overdue: '#C0492B',
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.round(Math.abs(ms) / 1000))
  const mm = Math.floor(total / 60)
  const ss = total % 60
  const body = `${mm}:${String(ss).padStart(2, '0')}`
  return ms < 0 ? `-${body}` : body
}

// Reusable circular countdown — any node with a timer renders one.
export function CountdownRing({
  remainingMs,
  totalMs,
  status,
  size = 40,
}: {
  remainingMs: number | null
  totalMs: number | null
  status: TimerStatus
  size?: number
}) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = totalMs && totalMs > 0 && remainingMs != null ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0
  const offset = c * (1 - pct)
  const color = COLORS[status]

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-black/10 dark:text-white/10" />
        {remainingMs != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-linear"
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums" style={{ color }}>
        {remainingMs != null ? fmt(remainingMs) : '—'}
      </span>
    </div>
  )
}
