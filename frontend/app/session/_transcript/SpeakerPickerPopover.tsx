import { useRef, useEffect } from 'react'
import { Check, UserX } from 'lucide-react'
import { STAFF_DB } from './staffDb'
import type { StaffMember } from './types'

type Props = {
  token: string
  currentStaffId: string | null
  onAssign: (staffId: string) => void
  onUnassign: () => void
  onClose: () => void
  anchorRect: DOMRect
}

export function SpeakerPickerPopover({
  token, currentStaffId, onAssign, onUnassign, onClose, anchorRect,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Position: below the anchor, right-aligned (RTL)
  const top  = anchorRect.bottom + 6
  const left = Math.max(8, anchorRect.right - 200)

  return (
    <div
      ref={ref}
      className="fixed z-50 w-48 rounded-xl bg-white dark:bg-[#252420] border border-[#ddd8d0] dark:border-[#3a3835] shadow-xl overflow-hidden"
      style={{ top, left }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#ede9e3] dark:border-[#2e2c29]">
        <p className="text-[10px] text-[#b1ada1]" dir="rtl">מיהו דובר {token}?</p>
      </div>

      {/* Staff list */}
      <ul className="max-h-48 overflow-y-auto py-1">
        {STAFF_DB.map(s => (
          <StaffRow
            key={s.id}
            staff={s}
            selected={s.id === currentStaffId}
            onSelect={() => { onAssign(s.id); onClose() }}
          />
        ))}
      </ul>

      {/* Unassign */}
      {currentStaffId && (
        <div className="border-t border-[#ede9e3] dark:border-[#2e2c29] py-1">
          <button
            onClick={() => { onUnassign(); onClose() }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            dir="rtl"
          >
            <UserX size={12} className="text-red-400 shrink-0" />
            <span className="text-[11px] text-red-500">הסר שיוך</span>
          </button>
        </div>
      )}
    </div>
  )
}

function StaffRow({
  staff, selected, onSelect,
}: { staff: StaffMember; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#f7f5f0] dark:hover:bg-[#2e2c29] transition-colors"
        dir="rtl"
      >
        {/* Avatar dot */}
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
          style={{ background: staff.color }}
        >
          {staff.initials}
        </span>
        <span className="flex-1 text-right">
          <span className="block text-[11px] font-medium text-[#1e1e1c] dark:text-[#e8e5e0]">{staff.name}</span>
          <span className="block text-[9px] text-[#b1ada1]">{staff.role}</span>
        </span>
        {selected && <Check size={11} className="text-[#10b981] shrink-0" />}
      </button>
    </li>
  )
}