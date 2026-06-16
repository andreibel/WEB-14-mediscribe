// Reusable field primitives for the MoH resuscitation form.
// Kept separate from MoHForm.tsx so the form file stays focused on layout.

export const inputCls = 'flex-1 min-w-0 border-b border-[#d8d2c8] dark:border-[#3a3835] bg-transparent text-[11px] text-[#1e1e1c] dark:text-[#e8e5e0] outline-none py-px focus:border-[#c15f3c] transition-colors disabled:opacity-60'

export function Field({ label, value, onChange, width = 'flex-1', disabled = false }: {
  label: string; value: string; onChange?: (v: string) => void
  width?: string; disabled?: boolean
}) {
  return (
    <div className={`flex flex-row items-center gap-1.5 ${width}`}>
      <label className="text-[9px] text-[#b1ada1] font-semibold uppercase tracking-wider shrink-0">
        {label}
      </label>
      <input dir="rtl" value={value} disabled={disabled}
        onChange={e => onChange?.(e.target.value)} className={inputCls} />
    </div>
  )
}

export function FreeInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <input dir="rtl" value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)} className={inputCls} />
  )
}

export function Check({ label, checked, onChange, disabled = false }: {
  label: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} disabled={disabled}
        onChange={e => onChange?.(e.target.checked)} className="accent-[#c15f3c] w-3 h-3" />
      <span className="text-[11px] text-[#1e1e1c] dark:text-[#e8e5e0]">{label}</span>
    </label>
  )
}

export function RowLabel({ children, underline = false }: { children: string; underline?: boolean }) {
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider shrink-0 ${
      underline
        ? 'text-[#1e1e1c] dark:text-[#e8e5e0] underline underline-offset-2'
        : 'text-[#b1ada1]'
    }`}>
      {children}
    </span>
  )
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-[#c15f3c] border-b border-[#c15f3c]/30 pb-1 mb-2">
      {children}
    </div>
  )
}

export const PROCEDURE_NAMES = [
  'בדיקת מצב הכרה',
  'בדיקת נשימה',
  'קריאה לצוות החייאה',
  'בדיקת דופק',
  'עיסוי לב חיצוני',
  'חיבור למוניטור - דפיברילטור',
  'פתיחת דרכי אוויר',
  'הנשמה במפוח',
  'אינטובציה',
  'הנשמה ב-LMA',
  'חיבור לקפנוגרף',
]
