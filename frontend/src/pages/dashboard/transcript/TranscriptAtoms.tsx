import { Wifi, WifiOff, Loader2, AlertCircle, Pause, Mic } from 'lucide-react'
import type { ConnectionState } from './types'

export function LiveDot({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

export function AudioLevel({ level = 0 }: { level?: number }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0.2, 0.4, 0.6, 0.8, 1].map((thresh, i) => (
        <div key={i} className="w-0.75 rounded-sm transition-all duration-75"
          style={{
            height: `${40 + i * 14}%`,
            background: level >= thresh ? '#10b981' : '#d1d5db',
            opacity: level >= thresh ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  const cfg = {
    idle:       { Icon: WifiOff,     label: 'מנותק',  color: '#9ca3af' },
    connecting: { Icon: Loader2,     label: 'מתחבר…', color: '#f59e0b' },
    live:       { Icon: Wifi,        label: 'חי',     color: '#10b981' },
    paused:     { Icon: Pause,       label: 'מושהה',  color: '#6366f1' },
    error:      { Icon: AlertCircle, label: 'שגיאה',  color: '#ef4444' },
  }[state]
  const { Icon } = cfg
  return (
    <div className="flex items-center gap-1.5" style={{ color: cfg.color }}>
      <Icon size={13} className={state === 'connecting' ? 'animate-spin' : undefined} />
      <span className="text-[10px] font-medium">{cfg.label}</span>
    </div>
  )
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mx-4 my-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <AlertCircle size={14} className="text-red-500 shrink-0" />
      <p className="text-[11px] text-red-600 dark:text-red-400 flex-1" dir="rtl">{message}</p>
      <button onClick={onRetry} className="text-[10px] text-red-500 underline shrink-0">נסה שוב</button>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 select-none">
      <Mic size={32} className="text-[#c15f3c]" />
      <p className="text-[12px] text-[#7a7670]" dir="rtl">ממתין לתחילת שיחה…</p>
    </div>
  )
}
