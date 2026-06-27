import { useRef, useEffect, useState, useMemo } from 'react'
import { Check, UserX, Search } from 'lucide-react'
import type { StaffMember } from './types'

type Scope = 'token' | 'segment'

type Props = {
  token: string
  seq?: number                    // present once the segment is persisted
  staff: StaffMember[]
  currentTokenUserId: string | null
  currentSegmentUserId: string | null
  onAssignToken: (userId: string) => void
  onAssignSegment: (userId: string) => void
  onClearToken: () => void
  onClearSegment: () => void
  onClose: () => void
  anchorRect: DOMRect
}

export function SpeakerPickerPopover({
  token, seq, staff,
  currentTokenUserId, currentSegmentUserId,
  onAssignToken, onAssignSegment, onClearToken, onClearSegment,
  onClose, anchorRect,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  // Per-segment override only makes sense once the segment has a DB row (seq).
  const canOverrideSegment = seq != null
  const [scope, setScope] = useState<Scope>('token')

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return staff
    return staff.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.nameHe.toLowerCase().includes(q) ||
      (s.nameEn?.toLowerCase().includes(q) ?? false) ||
      s.role.toLowerCase().includes(q),
    )
  }, [staff, query])

  const currentId = scope === 'segment' ? currentSegmentUserId : currentTokenUserId

  // Position: below the anchor, right-aligned (RTL)
  const top  = anchorRect.bottom + 6
  const left = Math.max(8, anchorRect.right - 224)

  const handleSelect = (userId: string) => {
    if (scope === 'segment') onAssignSegment(userId)
    else onAssignToken(userId)
    onClose()
  }

  const handleClear = () => {
    if (scope === 'segment') onClearSegment()
    else onClearToken()
    onClose()
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 w-56 rounded-xl bg-white dark:bg-[#252420] border border-[#ddd8d0] dark:border-[#3a3835] shadow-xl overflow-hidden"
      style={{ top, left }}
    >
      {/* Scope toggle: whole speaker vs just this line */}
      <div className="flex gap-1 p-1.5 border-b border-[#ede9e3] dark:border-[#2e2c29]" dir="rtl">
        <ScopeTab label="כל הדובר" active={scope === 'token'} onClick={() => setScope('token')} />
        <ScopeTab
          label="הודעה זו"
          active={scope === 'segment'}
          disabled={!canOverrideSegment}
          onClick={() => canOverrideSegment && setScope('segment')}
        />
      </div>

      {/* Context hint */}
      <div className="px-3 pt-2">
        <p className="text-[10px] text-[#b1ada1]" dir="rtl">
          {scope === 'token' ? `מיהו דובר ${token}?` : 'שייך רק את ההודעה הזו'}
        </p>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-[#f4f3ee] dark:bg-[#1d1c1a] px-2 py-1.5">
          <Search size={12} className="text-[#b1ada1] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חיפוש איש צוות…"
            className="w-full bg-transparent text-[11px] text-[#1e1e1c] dark:text-[#e8e5e0] placeholder:text-[#b1ada1] outline-none"
            dir="rtl"
          />
        </div>
      </div>

      {/* Staff list */}
      <ul className="max-h-48 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-[10px] text-[#b1ada1] text-center" dir="rtl">אין תוצאות</li>
        )}
        {filtered.map(s => (
          <StaffRow
            key={s.id}
            staff={s}
            selected={s.id === currentId}
            onSelect={() => handleSelect(s.id)}
          />
        ))}
      </ul>

      {/* Unassign (for the active scope) */}
      {currentId && (
        <div className="border-t border-[#ede9e3] dark:border-[#2e2c29] py-1">
          <button
            onClick={handleClear}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            dir="rtl"
          >
            <UserX size={12} className="text-red-400 shrink-0" />
            <span className="text-[11px] text-red-500">
              {scope === 'token' ? 'הסר שיוך דובר' : 'הסר שיוך הודעה'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function ScopeTab({
  label, active, disabled, onClick,
}: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
        disabled
          ? 'text-[#cfc8bd] dark:text-[#4a4640] cursor-not-allowed'
          : active
          ? 'bg-[#c15f3c] text-white'
          : 'text-[#8a8680] hover:bg-[#f0ece6] dark:hover:bg-[#2e2c29]',
      ].join(' ')}
    >
      {label}
    </button>
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
