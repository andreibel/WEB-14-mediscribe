import { useState } from 'react'
import { CornerLeftDown } from 'lucide-react'
import { MoHFormData, EMPTY_FORM } from './formSchema'

// ── Primitives ────────────────────────────────────────────────────────────────

const inputCls = 'flex-1 min-w-0 border-b border-[#d8d2c8] dark:border-[#3a3835] bg-transparent text-[11px] text-[#1e1e1c] dark:text-[#e8e5e0] outline-none py-px focus:border-[#c15f3c] transition-colors disabled:opacity-60'

function Field({ label, value, onChange, width = 'flex-1', disabled = false }: {
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

function FreeInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <input dir="rtl" value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)} className={inputCls} />
  )
}

function Check({ label, checked, onChange, disabled = false }: {
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

function RowLabel({ children, underline = false }: { children: string; underline?: boolean }) {
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

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-[#c15f3c] border-b border-[#c15f3c]/30 pb-1 mb-2">
      {children}
    </div>
  )
}

const PROCEDURE_NAMES = [
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

// ── MoHForm ───────────────────────────────────────────────────────────────────

interface MoHFormProps {
  initialData?: MoHFormData
  onSave?: (data: MoHFormData) => void
}

export function MoHForm({ initialData = EMPTY_FORM, onSave }: MoHFormProps) {
  const [data, setData] = useState<MoHFormData>(initialData)
  const locked = data.signed

  function set<K extends keyof MoHFormData>(section: K, patch: Partial<MoHFormData[K]>) {
    setData(prev => ({ ...prev, [section]: { ...(prev[section] as object), ...patch } }))
  }

  function updateMedName(mi: number, name: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      meds[mi] = { ...meds[mi], name }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateMedDose(mi: number, dose: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      meds[mi] = { ...meds[mi], dose }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateMedTime(mi: number, ti: number, time: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      const times = [...meds[mi].times]
      times[ti] = time
      meds[mi] = { ...meds[mi], times }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateProc(pi: number, val: boolean) {
    setData(prev => {
      const procedures = [...prev.resuscitationProcess.procedures]
      procedures[pi] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, procedures } }
    })
  }

  function updateDefiTime(ti: number, val: string) {
    setData(prev => {
      const defibrillationTimes = [...prev.resuscitationProcess.defibrillationTimes]
      defibrillationTimes[ti] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, defibrillationTimes } }
    })
  }

  function updateDefiEnergy(ei: number, val: string) {
    setData(prev => {
      const defibrillationEnergies = [...prev.resuscitationProcess.defibrillationEnergies]
      defibrillationEnergies[ei] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, defibrillationEnergies } }
    })
  }

  function updateHeartSlot(i: number, patch: Partial<MoHFormData['heartRhythm']['slots'][0]>) {
    setData(prev => {
      const slots = [...prev.heartRhythm.slots]
      slots[i] = { ...slots[i], ...patch }
      return { ...prev, heartRhythm: { slots } }
    })
  }

  function handleSign() {
    const now = new Date()
    setData(prev => ({
      ...prev,
      signed: true,
      signedAt: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    }))
  }

  const pr = data.preResuscitation
  const rp = data.resuscitationProcess
  const tdCls = 'border border-[#d8d2c8] dark:border-[#3a3835]'
  const cellInput = 'w-full bg-transparent outline-none disabled:opacity-60'

  return (
    <div className="print-area h-full overflow-y-auto" dir="rtl">
      <div className="max-w-2xl mx-auto p-4 space-y-1 text-[#1e1e1c] dark:text-[#e8e5e0]">

        {/* ── Header ── */}
        <div className="text-center border-b border-[#d8d2c8] dark:border-[#3a3835] pb-2">
          <div className="text-[13px] font-bold">טופס רישום וניטור החייאה</div>
        </div>

        {/* ── Pre-resuscitation + Patient sticker ── */}
        <div className="flex items-start gap-4">

          <div className="flex-1 space-y-1">
            <SectionTitle>נתונים לפני תחילת פעולות החייאה</SectionTitle>
            <Field label="תאריך החייאה"                  value={pr.date}            onChange={v => set('preResuscitation', { date: v })}            disabled={locked} />
            <Field label="שעת איתור החולה"               value={pr.timeFound}       onChange={v => set('preResuscitation', { timeFound: v })}       disabled={locked} />
            <Field label="שעת התחלת החייאה"              value={pr.timeStarted}     onChange={v => set('preResuscitation', { timeStarted: v })}     disabled={locked} />
            <Field label="שעת הגעת צוות ההחייאה המוסדי" value={pr.timeTeamArrived} onChange={v => set('preResuscitation', { timeTeamArrived: v })} disabled={locked} />
            <Field label="מקום האירוע"                   value={pr.location}        onChange={v => set('preResuscitation', { location: v })}        disabled={locked} />
          </div>

          <div className="shrink-0 w-70 border-2 border-dashed border-[#d8d2c8] dark:border-[#3a3835] rounded-lg p-2.5 space-y-1.5 bg-[#faf9f7] dark:bg-[#1c1917]">
            <div className="text-center text-[8px] uppercase tracking-widest text-[#b1ada1] font-semibold border-b border-[#ece9e1] dark:border-[#2a2825] pb-1 mb-1">
              פרטי מטופל (מדבקה)
            </div>
            <div className="flex gap-1.5">
              <Field label="שם ומשפחה" value={data.patient.name} onChange={v => set('patient', { name: v })} disabled={locked} width="w-43" />
              <Field label="ת.ז."      value={data.patient.id}   onChange={v => set('patient', { id: v })}   disabled={locked} width="w-20" />
            </div>
            <div className="flex gap-1.5">
              <Field label="כתובת" value={data.patient.address} onChange={v => set('patient', { address: v })} disabled={locked} />
              <Field label="טל"    value={data.patient.phone}   onChange={v => set('patient', { phone: v })}   disabled={locked} width="w-20" />
            </div>
            <div className="flex gap-1.5">
              <Field label="איש קשר" value={data.patient.emergencyContact} onChange={v => set('patient', { emergencyContact: v })} disabled={locked} />
              <Field label="טל"      value={data.patient.emergencyPhone}   onChange={v => set('patient', { emergencyPhone: v })}   disabled={locked} width="w-20" />
            </div>
            <div className="flex gap-1.5">
              <Field label='קופ"ח' value={data.patient.hmo} onChange={v => set('patient', { hmo: v })} disabled={locked} />
              <Field label="גיל"   value={data.patient.age} onChange={v => set('patient', { age: v })} disabled={locked} width="w-14" />
            </div>
          </div>

        </div>

        {/* עדים לאירוע */}
        <div className="flex items-center gap-3 flex-wrap">
          <RowLabel>עדים לאירוע</RowLabel>
          <Check label="צוות רפואי" checked={pr.witnessTeamMedical} onChange={v => set('preResuscitation', { witnessTeamMedical: v })} disabled={locked} />
          <Check label="סיעודי"     checked={pr.witnessTeamNursing} onChange={v => set('preResuscitation', { witnessTeamNursing: v })} disabled={locked} />
          <Check label="משפחה"      checked={pr.witnessFamily}       onChange={v => set('preResuscitation', { witnessFamily: v })}       disabled={locked} />
          <Check label="אחר"        checked={pr.witnessOther}        onChange={v => set('preResuscitation', { witnessOther: v })}        disabled={locked} />
          <FreeInput value={pr.witnessOtherText} onChange={v => set('preResuscitation', { witnessOtherText: v })} disabled={locked} />
        </div>

        {/* סיבה להחייאה */}
        <div className="flex items-center gap-3">
          <RowLabel underline>סיבה להחייאה</RowLabel>
          <Check label="דום לב"    checked={pr.reasonCardiacArrest}     onChange={v => set('preResuscitation', { reasonCardiacArrest: v })}     disabled={locked} />
          <Check label="דום נשימה" checked={pr.reasonRespiratoryArrest} onChange={v => set('preResuscitation', { reasonRespiratoryArrest: v })} disabled={locked} />
        </div>

        {/* מצב הכרה + מגיב */}
        <div className="flex items-center gap-4 flex-wrap">
          <RowLabel underline>מצב הכרה</RowLabel>
          <Check label="מעורפל"   checked={pr.consciousness === 'מעורפל'}   onChange={() => set('preResuscitation', { consciousness: 'מעורפל' })}   disabled={locked} />
          <Check label="ללא הכרה" checked={pr.consciousness === 'ללא הכרה'} onChange={() => set('preResuscitation', { consciousness: 'ללא הכרה' })} disabled={locked} />
          <RowLabel underline>מגיב</RowLabel>
          <Check label="כן" checked={pr.responsive === 'כן'} onChange={() => set('preResuscitation', { responsive: 'כן' })} disabled={locked} />
          <Check label="לא" checked={pr.responsive === 'לא'} onChange={() => set('preResuscitation', { responsive: 'לא' })} disabled={locked} />
        </div>

        {/* מצב נשימתי */}
        <div className="flex items-center gap-4 flex-wrap">
          <RowLabel underline>מצב נשימתי</RowLabel>
          <Check label="נושם"                             checked={pr.respiratoryStatus === 'נושם'}    onChange={() => set('preResuscitation', { respiratoryStatus: 'נושם' })}    disabled={locked} />
          <Check label="לא נושם (כולל נשימות לא יעילות)" checked={pr.respiratoryStatus === 'לא נושם'} onChange={() => set('preResuscitation', { respiratoryStatus: 'לא נושם' })} disabled={locked} />
          <Check label="מונשם"                            checked={pr.respiratoryStatus === 'מונשם'}   onChange={() => set('preResuscitation', { respiratoryStatus: 'מונשם' })}   disabled={locked} />
        </div>

        {/* מצב/רקע מקדים */}
        <div className="flex items-center gap-3 flex-wrap">
          <RowLabel underline>מצב/רקע מקדים</RowLabel>
          <Check label="קרדיאלי"            checked={pr.backgroundCardiac}     onChange={v => set('preResuscitation', { backgroundCardiac: v })}     disabled={locked} />
          <Check label="נשימתי"             checked={pr.backgroundRespiratory} onChange={v => set('preResuscitation', { backgroundRespiratory: v })} disabled={locked} />
          <Check label="טראומה"             checked={pr.backgroundTrauma}      onChange={v => set('preResuscitation', { backgroundTrauma: v })}      disabled={locked} />
          <Check label="הפרעה אלקטרוליטית" checked={pr.backgroundElectrolyte} onChange={v => set('preResuscitation', { backgroundElectrolyte: v })} disabled={locked} />
          <RowLabel>אחר</RowLabel>
          <FreeInput value={pr.backgroundOther} onChange={v => set('preResuscitation', { backgroundOther: v })} disabled={locked} />
        </div>

        {/* ── תהליך החייאה ── */}
        <div className="space-y-2">
          <SectionTitle>תהליך החייאה</SectionTitle>

          {/* Heart rhythm table */}
          <table className="w-full border-collapse text-[10px]">
            <tbody>
              <tr>
                <td colSpan={6} className={`${tdCls} px-2 py-1 text-center font-semibold bg-[#f5f2ed] dark:bg-[#232120]`}>
                  הערכת קצב לב שזוהה. יש לציין כל שינוי בקצב לב ושעה
                </td>
              </tr>
              <tr>
                <td className={`${tdCls} w-[18%]`} />
                {data.heartRhythm.slots.map((slot, i) => (
                  <td key={i} className={`${tdCls} px-1 py-0.5 text-center`}>
                    {i === 0 && (
                      <div className="text-[8px] font-semibold underline underline-offset-1 mb-0.5 whitespace-nowrap">
                        קצב לב ראשוני שזוהה
                      </div>
                    )}
                    <input dir="ltr" value={slot.time} disabled={locked} placeholder="00:00"
                      onChange={e => updateHeartSlot(i, { time: e.target.value })}
                      className={`${cellInput} text-center border-b border-transparent focus:border-[#c15f3c] font-mono text-[10px]`} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className={`${tdCls} px-1.5 py-1 font-semibold whitespace-nowrap`}>
                  הערכת קצב לב (אבחנה) ←
                </td>
                {data.heartRhythm.slots.map((slot, i) => (
                  <td key={i} className={`${tdCls} px-1 py-0.5`}>
                    <input dir="rtl" value={slot.assessment} disabled={locked}
                      onChange={e => updateHeartSlot(i, { assessment: e.target.value })}
                      className={`${cellInput} border-b border-transparent focus:border-[#c15f3c] text-[10px]`} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Medications + Procedures table */}
          {/* Col order in HTML: [בוצע][פעולה][תרופה][מינון][שעה×9] — RTL renders procedures on right, meds on left */}
          <table className="w-full border-collapse text-[8px] leading-tight">
            <thead>
              <tr>
                <th colSpan={2} className={`${tdCls} px-1 py-0.5 text-center font-semibold bg-[#f5f2ed] dark:bg-[#232120]`}>
                  פעולות
                </th>
                <th colSpan={11} style={{ borderRight: '3px solid #c15f3c' }} className={`${tdCls} px-1 py-0.5 text-center font-semibold bg-[#f5f2ed] dark:bg-[#232120]`}>
                  רשום את מינון התרופה ושעה מדוייקת של מתן התרופה
                </th>
              </tr>
              <tr>
                <th className={`${tdCls} py-0.5 text-center font-semibold text-[#b1ada1] w-8`}>בוצע</th>
                <th className={`${tdCls} px-1 py-0.5 text-right font-semibold text-[#b1ada1]`}>פעולה</th>
                <th style={{ borderRight: '3px solid #c15f3c' }} className={`${tdCls} px-0.5 py-0.5 text-right font-semibold text-[#b1ada1] w-16`}>תרופה</th>
                <th className={`${tdCls} px-0.5 py-0.5 text-right font-semibold text-[#b1ada1] w-8`}>מינון</th>
                {Array.from({ length: 9 }, (_, i) => (
                  <th key={i} className={`${tdCls} py-0.5 text-center font-semibold text-[#b1ada1] w-9`}>שעה</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rp.meds.map((med, mi) => (
                <tr key={mi}>
                  <td className={`${tdCls} py-0.5 text-center`}>
                    <input type="checkbox" checked={rp.procedures[mi]} disabled={locked}
                      onChange={e => updateProc(mi, e.target.checked)} className="accent-[#c15f3c] w-3 h-3" />
                  </td>
                  <td className={`${tdCls} px-1 py-0.5`}>{PROCEDURE_NAMES[mi]}</td>
                  <td style={{ borderRight: '3px solid #c15f3c' }} className={`${tdCls} px-1 py-0.5 font-mono`}>
                    {mi === rp.meds.length - 1 ? (
                      <input value={med.name} disabled={locked} placeholder="אחר"
                        onChange={e => updateMedName(mi, e.target.value)}
                        className={`${cellInput} text-right font-mono text-[8px]`} />
                    ) : med.name}
                  </td>
                  <td className={`${tdCls} px-0.5 py-0.5`}>
                    <input value={med.dose} disabled={locked} onChange={e => updateMedDose(mi, e.target.value)}
                      className={`${cellInput} text-right text-[8px]`} />
                  </td>
                  {med.times.map((t, ti) => (
                    <td key={ti} className={`${tdCls} px-0.5 py-0.5`}>
                      <input value={t} disabled={locked} onChange={e => updateMedTime(mi, ti, e.target.value)}
                        className={`${cellInput} text-center font-mono text-[7px]`} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Defibrillation times row */}
              <tr>
                <td className={`${tdCls} py-0.5 text-center`}>
                  <input type="checkbox" checked={rp.ivAccess} disabled={locked}
                    onChange={e => setData(prev => ({ ...prev, resuscitationProcess: { ...prev.resuscitationProcess, ivAccess: e.target.checked } }))}
                    className="accent-[#c15f3c] w-3 h-3" />
                </td>
                <td className={`${tdCls} px-1 py-0.5`}>החדרת עירוי I.V. או I.O.</td>
                <td colSpan={2} style={{ borderRight: '3px solid #c15f3c' }} className={`${tdCls} px-1 py-0.5 font-semibold whitespace-nowrap`}>
                  שעת מתן דפיברילציה / היפוך חשמלי
                </td>
                {rp.defibrillationTimes.map((t, ti) => (
                  <td key={ti} className={`${tdCls} px-0.5 py-0.5`}>
                    <input value={t} disabled={locked} onChange={e => updateDefiTime(ti, e.target.value)}
                      className={`${cellInput} text-center font-mono text-[7px]`} />
                  </td>
                ))}
              </tr>

              {/* Defibrillation energy row */}
              <tr>
                <td className={`${tdCls} px-0.5 py-0.5`}>
                  <input value={rp.procedureOther} disabled={locked}
                    onChange={e => setData(prev => ({ ...prev, resuscitationProcess: { ...prev.resuscitationProcess, procedureOther: e.target.value } }))}
                    className={`${cellInput} text-[8px]`} />
                </td>
                <td className={`${tdCls} px-1 py-0.5 font-semibold`}>אחר</td>
                <td colSpan={2} style={{ borderRight: '3px solid #c15f3c' }} className={`${tdCls} px-1 py-0.5 font-semibold`}>
                  כמות האנרגיה של מכת החשמל
                </td>
                {rp.defibrillationEnergies.map((e, ei) => (
                  <td key={ei} className={`${tdCls} px-0.5 py-0.5`}>
                    <input value={e} disabled={locked} onChange={ev => updateDefiEnergy(ei, ev.target.value)}
                      className={`${cellInput} text-center text-[8px]`} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── סיכום החייאה ── */}
        <div className="space-y-1.5">
          <SectionTitle>סיכום החייאה</SectionTitle>

          <div className="flex items-center gap-6">
            <Field label="שעת סיום החייאה" value={data.summary.endTime} onChange={v => set('summary', { endTime: v })} disabled={locked} width="w-48" />
            <div className="flex items-center gap-3 shrink-0">
              <RowLabel>קביעת מוות</RowLabel>
              <Check label="כן" checked={data.summary.deathDeclared === 'כן'} onChange={() => set('summary', { deathDeclared: 'כן' })} disabled={locked} />
              <Check label="לא" checked={data.summary.deathDeclared === 'לא'} onChange={() => set('summary', { deathDeclared: 'לא' })} disabled={locked} />
            </div>
            <CornerLeftDown size={16} className="text-[#c15f3c] shrink-0" />
          </div>

          {/* סימנים קליניים בתום החייאה */}
          <div className="border-2 border-[#d8d2c8] dark:border-[#3a3835] rounded p-2 space-y-1.5">

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[9px] font-semibold text-[#c15f3c] underline underline-offset-2 shrink-0">
                סימנים קליניים בתום החייאה:
              </span>
              <RowLabel underline>נשימה עצמונית</RowLabel>
              <Check label="כן"    checked={data.summary.spontaneousBreathing === 'כן'}    onChange={() => set('summary', { spontaneousBreathing: 'כן' })}    disabled={locked} />
              <Check label="לא"    checked={data.summary.spontaneousBreathing === 'לא'}    onChange={() => set('summary', { spontaneousBreathing: 'לא' })}    disabled={locked} />
              <Check label="מונשם" checked={data.summary.spontaneousBreathing === 'מונשם'} onChange={() => set('summary', { spontaneousBreathing: 'מונשם' })} disabled={locked} />
              <Field label="קצב לב" value={data.summary.heartRateEnd} onChange={v => set('summary', { heartRateEnd: v })} disabled={locked} width="w-24" />
            </div>

            <div className="flex items-center gap-4">
              <Field label="סטורציה" value={data.summary.saturation} onChange={v => set('summary', { saturation: v })} disabled={locked} width="w-32" />
              <Field label="ETCO2"   value={data.summary.etco2End}   onChange={v => set('summary', { etco2End: v })}   disabled={locked} width="w-28" />
              <Field label="לחץ דם"  value={data.summary.bpEnd}      onChange={v => set('summary', { bpEnd: v })}      disabled={locked} />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <RowLabel underline>מצב הכרה</RowLabel>
              <Check label="מעורפל"   checked={data.summary.consciousnessEnd === 'מעורפל'}   onChange={() => set('summary', { consciousnessEnd: 'מעורפל' })}   disabled={locked} />
              <Check label="ללא הכרה" checked={data.summary.consciousnessEnd === 'ללא הכרה'} onChange={() => set('summary', { consciousnessEnd: 'ללא הכרה' })} disabled={locked} />
              <Check label="מורדם"    checked={data.summary.consciousnessEnd === 'מורדם'}    onChange={() => set('summary', { consciousnessEnd: 'מורדם' })}    disabled={locked} />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Check label="לא עבר" checked={data.summary.notTransferred} onChange={v => set('summary', { notTransferred: v })} disabled={locked} />
              <Field label="הועבר ל"    value={data.summary.transferredTo}  onChange={v => set('summary', { transferredTo: v })}  disabled={locked || data.summary.notTransferred} />
              <Field label="אמצעי הערה" value={data.summary.transferMethod} onChange={v => set('summary', { transferMethod: v })} disabled={locked || data.summary.notTransferred} width="w-36" />
              <Field label="שעת העברה"  value={data.summary.transferTime}   onChange={v => set('summary', { transferTime: v })}   disabled={locked || data.summary.notTransferred} width="w-24" />
            </div>

          </div>
        </div>

        {/* ── פרטי אנשי הצוות ── */}
        <div className="space-y-1.5">
          <SectionTitle>פרטי אנשי הצוות (כולל חתימה וחותמת)</SectionTitle>
          <div className="flex gap-3">
            <Field label="איש צוות 1 (מנהל החייאה)" value={data.staff.member1} onChange={v => set('staff', { member1: v })} disabled={locked} />
            <Field label="איש צוות 2"                value={data.staff.member2} onChange={v => set('staff', { member2: v })} disabled={locked} />
            <Field label="איש צוות 3"                value={data.staff.member3} onChange={v => set('staff', { member3: v })} disabled={locked} />
          </div>
          <div className="flex justify-end">
            <Field label="שם וחתימת מאשר הטופס" value={data.staff.approver} onChange={v => set('staff', { approver: v })} disabled={locked} width="w-64" />
          </div>
        </div>

        {/* print-only signature line */}
        {data.signed && (
          <div className="hidden print:block border-t border-[#999] pt-2 text-[9px]">
            ✓ נחתם על ידי {data.signedBy} — {data.signedAt}
          </div>
        )}

        {/* ── Actions bar (screen only) ── */}
        <div className="no-print border-t border-[#d8d2c8] dark:border-[#3a3835] pt-3 flex items-center justify-between gap-3">
          {data.signed ? (
            <div className="text-[11px] text-[#22c55e] font-semibold">
              ✓ נחתם על ידי {data.signedBy} — {data.signedAt}
            </div>
          ) : (
            <div className="text-[10px] text-[#b1ada1]">טרם נחתם</div>
          )}
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="px-3 py-1.5 text-[11px] border border-[#d8d2c8] dark:border-[#3a3835] rounded-lg hover:bg-[#ece9e1] dark:hover:bg-[#2a2825] transition-colors">
              הדפסה
            </button>
            <button onClick={() => onSave?.(data)}
              className="px-3 py-1.5 text-[11px] border border-[#d8d2c8] dark:border-[#3a3835] rounded-lg hover:bg-[#ece9e1] dark:hover:bg-[#2a2825] transition-colors">
              שמירה
            </button>
            {!data.signed && (
              <button onClick={handleSign}
                className="px-3 py-1.5 text-[11px] bg-[#c15f3c] hover:bg-[#a04e31] text-white rounded-lg transition-colors font-semibold">
                חתימה וסגירה
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
