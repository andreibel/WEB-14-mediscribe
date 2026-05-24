import { useState } from 'react'
import { Mic, ChevronLeft, CheckCircle2, AlertCircle, SkipForward } from 'lucide-react'
import { STAFF_DB, fuzzyMatchStaff } from './staffDb'
import type { EnrollmentSlot } from './types'

type Props = {
  slots: EnrollmentSlot[]
  currentIndex: number
  audioLevel: number    // 0–1, live from mic during enrollment
  onNext: () => void
  onConfirmSlot: (slotIndex: number, staffId: string) => void
  onFinish: () => void
  onSkip: () => void
}

export function EnrollmentModal({
  slots, currentIndex, audioLevel,
  onNext, onConfirmSlot, onFinish, onSkip,
}: Props) {
  const allConfirmed = slots.every(s => s.confirmed)
  const currentSlot  = slots[currentIndex] as EnrollmentSlot | undefined
  const isCapturing  = !!currentSlot && !currentSlot.confirmed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#faf9f5] dark:bg-[#1e1d1b] border border-[#ddd8d0] dark:border-[#3a3835] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#ede9e3] dark:border-[#2e2c29]">
          <h2 className="text-[15px] font-semibold text-[#1e1e1c] dark:text-[#e8e5e0]" dir="rtl">
            זיהוי דוברים
          </h2>
          <p className="text-[11px] text-[#8a8680] mt-0.5" dir="rtl">
            כל אחד אומר את שמו — המערכת תזהה את הקול
          </p>
        </div>

        {/* Slot list */}
        <ul className="px-3 py-3 space-y-2 max-h-64 overflow-y-auto">
          {slots.map((slot, i) => (
            <SlotRow
              key={i}
              slot={slot}
              index={i}
              isCurrent={i === currentIndex && !slot.confirmed}
              audioLevel={audioLevel}
              onConfirm={(staffId) => onConfirmSlot(i, staffId)}
            />
          ))}
        </ul>

        {/* Actions */}
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
          {isCapturing && (
            <button
              onClick={onNext}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#c15f3c] text-white text-[12px] font-medium hover:bg-[#a94e30] transition-colors"
              dir="rtl"
            >
              <ChevronLeft size={14} />
              {currentIndex < slots.length - 1 ? 'הבא — שמור וקדם' : 'סיים קליטה'}
            </button>
          )}

          {allConfirmed && (
            <button
              onClick={onFinish}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#10b981] text-white text-[12px] font-medium hover:bg-[#059669] transition-colors"
              dir="rtl"
            >
              <CheckCircle2 size={14} />
              אשר והתחל שיחה
            </button>
          )}

          <button
            onClick={onSkip}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-[#ddd8d0] dark:border-[#3a3835] text-[#8a8680] text-[11px] hover:bg-[#f0ece6] dark:hover:bg-[#252420] transition-colors"
            dir="rtl"
          >
            <SkipForward size={12} />
            דלג על זיהוי — הקצה ידנית בהמשך
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SlotRow ───────────────────────────────────────────────────────────────────

function SlotRow({
  slot, index, isCurrent, audioLevel, onConfirm,
}: {
  slot: EnrollmentSlot
  index: number
  isCurrent: boolean
  audioLevel: number
  onConfirm: (staffId: string) => void
}) {
  const autoMatch = slot.detectedText ? fuzzyMatchStaff(slot.detectedText) : null
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const resolvedId = overrideId ?? autoMatch?.id ?? null

  return (
    <li
      className={[
        'rounded-xl border px-3 py-2.5 transition-colors',
        isCurrent
          ? 'border-[#c15f3c]/60 bg-[#fdf8f3] dark:bg-[#2a2420]'
          : slot.confirmed
          ? 'border-[#10b981]/40 bg-[#f0fdf8] dark:bg-[#1a2e28]'
          : 'border-[#ddd8d0] dark:border-[#3a3835] bg-white dark:bg-[#252420] opacity-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-2" dir="rtl">
        {/* Person number */}
        <span className="text-[10px] font-mono text-[#b1ada1] w-4 shrink-0">#{index + 1}</span>

        {/* Mic + wave indicator (current slot only) */}
        {isCurrent && (
          <div className="flex items-end gap-[2px] shrink-0 h-4">
            {[0.3, 0.5, 1, 0.5, 0.3].map((mult, i) => (
              <div
                key={i}
                className="w-0.5 rounded-sm bg-[#c15f3c] transition-all duration-75"
                style={{ height: `${Math.max(3, audioLevel * 16 * mult)}px` }}
              />
            ))}
          </div>
        )}

        {/* Status icon */}
        {slot.confirmed && <CheckCircle2 size={13} className="text-[#10b981] shrink-0" />}
        {!slot.confirmed && !isCurrent && <Mic size={13} className="text-[#d1d5db] shrink-0" />}

        <div className="flex-1 min-w-0">
          {/* What was heard */}
          {slot.detectedText && (
            <p className="text-[10px] text-[#6b6662] truncate italic mb-0.5">
              "{slot.detectedText}"
            </p>
          )}
          {isCurrent && !slot.detectedText && (
            <p className="text-[10px] text-[#b1ada1] italic animate-pulse">מאזין…</p>
          )}

          {/* Match / picker */}
          {(isCurrent || slot.confirmed) && (
            <div className="flex items-center gap-1 mt-0.5">
              {autoMatch && !overrideId && (
                <span className="text-[10px] font-medium" style={{ color: autoMatch.color }}>
                  {autoMatch.name}
                </span>
              )}
              {!slot.confirmed && (
                <StaffSelector
                  currentId={resolvedId}
                  onSelect={id => {
                    setOverrideId(id)
                    onConfirm(id)
                  }}
                />
              )}
              {slot.confirmed && slot.staffId && (
                <span className="text-[10px] text-[#10b981] font-medium">✓ אושר</span>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

// ── StaffSelector ─────────────────────────────────────────────────────────────

function StaffSelector({ currentId, onSelect }: { currentId: string | null; onSelect: (id: string) => void }) {
  return (
    <select
      value={currentId ?? ''}
      onChange={e => { if (e.target.value) onSelect(e.target.value) }}
      className="text-[10px] bg-transparent border border-[#ddd8d0] dark:border-[#3a3835] rounded-md px-1.5 py-0.5 text-[#1e1e1c] dark:text-[#e8e5e0] cursor-pointer"
      dir="rtl"
    >
      <option value="" disabled>בחר…</option>
      {STAFF_DB.map(s => (
        <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
      ))}
    </select>
  )
}