import { Fragment, useEffect, useRef } from 'react'
import { Activity, Syringe, Bell, AlertTriangle } from 'lucide-react'
import type { ProtocolNotification, NotifKind } from '../types'

const STYLE: Record<NotifKind, { dot: string; ring: string; icon: typeof Activity }> = {
  protocol: { dot: 'bg-[#C15F3C]', ring: 'border-[#C15F3C]', icon: Activity },
  info: { dot: 'bg-[#2E7D58]', ring: 'border-[#2E7D58]', icon: Syringe },
  due: { dot: 'bg-[#E0892E]', ring: 'border-[#E0892E]', icon: Bell },
  overdue: { dot: 'bg-[#C0392B]', ring: 'border-[#C0392B]', icon: AlertTriangle },
}

function hhmm(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Strip the "נרשם: " prefix the engine adds, for a cleaner timeline label.
function clean(title: string): string {
  return title.replace(/^נרשם:\s*/, '')
}

// A fixed timeline strip (not a hovering toast): every protocol event plotted
// left→right by time, each with its clock, an icon, and a description.
// Forced LTR so time reads left→right even inside the RTL panel.
export function Timeline({ items }: { items: ProtocolNotification[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = el.scrollWidth // latest on the right
  }, [items.length])

  return (
    <div className="shrink-0 border-b border-[#E8E2D9] bg-[#FBF8F3] dark:border-[#2E2A27] dark:bg-[#1A1714]">
      <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#A89D90] dark:text-[#7A7167]">
        <Activity size={12} /> ציר זמן
      </div>
      <div ref={ref} dir="ltr" className="flex items-stretch overflow-x-auto px-3 pb-3 pt-2">
        {items.length === 0 ? (
          <span className="py-3 text-[11px] italic text-[#B1ADA1] dark:text-[#6E665D]">אין אירועים עדיין…</span>
        ) : (
          items.map((n, i) => {
            const s = STYLE[n.kind]
            const Icon = s.icon
            return (
              <Fragment key={n.id}>
                {i > 0 && <span className="mt-7 h-px w-6 shrink-0 self-start bg-[#D8D2C8] dark:bg-[#3a3835]" />}
                <div className="flex w-[112px] shrink-0 flex-col items-center gap-1 text-center">
                  <span className="text-[12px] font-extrabold tabular-nums text-[#3A332D] dark:text-[#E8E2D9]">{hhmm(n.ts)}</span>
                  <span className={['flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white shadow-sm dark:bg-[#221E1B]', s.ring].join(' ')}>
                    <span className={['flex h-full w-full items-center justify-center rounded-full text-white', s.dot].join(' ')}>
                      <Icon size={13} strokeWidth={2.4} />
                    </span>
                  </span>
                  <span className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-[#4a4640] dark:text-[#C0BDB8]" title={n.title}>
                    {clean(n.title)}
                  </span>
                  {n.body && <span className="truncate text-[9px] text-[#A89D90] dark:text-[#7A7167]">{n.body}</span>}
                </div>
              </Fragment>
            )
          })
        )}
      </div>
    </div>
  )
}
