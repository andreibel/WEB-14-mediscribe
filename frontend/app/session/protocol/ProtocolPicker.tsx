import { Radio, ChevronLeft } from 'lucide-react'
import type { Protocol } from './types'

// Manual self-load: when no protocol has been auto-detected, the team can pick
// one by hand. Shown in the empty state of the panel.
export function ProtocolPicker({
  protocols,
  autoDetect,
  onLoad,
}: {
  protocols: Protocol[]
  autoDetect: boolean
  onLoad: (id: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C15F3C]/12 text-[#C15F3C]">
        <Radio size={22} className={autoDetect ? 'animate-pulse' : undefined} />
      </div>
      <div>
        <h3 className="text-[14px] font-extrabold text-[#3A332D] dark:text-[#E8E2D9]">
          {autoDetect ? 'מאזין לזיהוי פרוטוקול…' : 'בחר פרוטוקול'}
        </h3>
        <p className="mt-1 text-[11.5px] text-[#8A7E72] dark:text-[#9A8F82]">
          {autoDetect
            ? 'הפרוטוקול ייטען אוטומטית כשייאמר, או טען ידנית:'
            : 'זיהוי אוטומטי כבוי — טען פרוטוקול ידנית:'}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {protocols.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onLoad(p.id)}
            className="group flex items-center justify-between gap-2 rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] px-3 py-2.5 text-right shadow-sm transition-colors hover:border-[#C15F3C]/50 hover:bg-[#C15F3C]/[0.04] dark:border-[#2E2A27] dark:bg-[#211D1A]"
          >
            <ChevronLeft size={16} className="shrink-0 text-[#C15F3C] opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[#3A332D] dark:text-[#E8E2D9]">{p.name}</div>
              {p.description && <div className="truncate text-[10.5px] text-[#8A7E72] dark:text-[#9A8F82]">{p.description}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
