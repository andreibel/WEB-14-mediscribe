'use client'

import { useState, useRef, useCallback, useMemo, useEffect, use } from 'react'
import { Window, WindowGroup } from '@/components/window'
import { TranscriptPanel } from '../transcript/TranscriptPanel'
import { MoHForm } from '../MoHForm'
import { EMPTY_FORM, type MoHFormData } from '../MoHForm/formSchema'
import { ProtocolPanel, useProtocolEngine } from '../protocol'
import type { TranscriptSegment } from '../transcript/types'
import { createClient } from '@/lib/supabase/client'

// DD/MM/YYYY + HH:MM for the current moment — injected into the form at session
// start so the AI never has to (and never overwrites) the start date/time.
function nowDateTime() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  }
}

const BATCH_SIZE = 3

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params)
  const supabase = useMemo(() => createClient(), [])
  const protocol = useProtocolEngine()
  const { pushSegment: pushProtocolSegment } = protocol

  const [formData, setFormData]     = useState<MoHFormData>(EMPTY_FORM)
  const [isUpdating, setIsUpdating]  = useState(false)
  const [aiEnabled, setAiEnabled]    = useState(true)
  // Gate saves until the initial load resolves, so we never overwrite a stored
  // form with EMPTY_FORM before it has been fetched.
  const [loaded, setLoaded]          = useState(false)

  // Read the toggle from inside the (otherwise stable) segment handler
  // without re-creating it on every flip.
  const aiEnabledRef = useRef(aiEnabled)
  aiEnabledRef.current = aiEnabled

  // Load any previously saved form for this session on mount.
  useEffect(() => {
    let cancelled = false
    supabase
      .from('moh_forms')
      .select('data')
      .eq('session_id', sessionId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('form load failed', error)
        else if (data?.data) setFormData(data.data as MoHFormData)
        setLoaded(true)
      })
    return () => { cancelled = true }
  }, [sessionId, supabase])

  // Persist the form (debounced) whenever it changes — covers manual edits and
  // AI auto-fill alike, since both flow through setFormData. One row per session.
  useEffect(() => {
    if (!loaded) return
    const handle = setTimeout(() => {
      supabase
        .from('moh_forms')
        .upsert(
          { session_id: sessionId, data: formData, signed: formData.signed },
          { onConflict: 'session_id' },
        )
        .then(({ error }) => { if (error) console.error('form save failed', error) })
    }, 800)
    return () => clearTimeout(handle)
  }, [formData, loaded, sessionId, supabase])

  // All finalized segments accumulated for the session — sent as full context each
  // call, each tagged with the wall-clock time it landed so the AI can time-stamp
  // medications/events (e.g. adrenaline heard at 15:41 → that med's time = 15:41).
  const allSegmentsRef  = useRef<Array<TranscriptSegment & { clock: string }>>([])
  // Count of segments since the last Haiku call
  const pendingCountRef = useRef(0)

  const handleSegment = useCallback(async (seg: TranscriptSegment) => {
    // 1. Persist every finalized segment (append-only) — runs regardless of AI toggle.
    supabase
      .from('transcript_segments')
      .insert({
        session_id:    sessionId,
        speaker_token: seg.token,
        text:          seg.text,
        start_ms:      seg.start_ms,
      })
      .then(({ error }) => { if (error) console.error('segment save failed', error) })

    // 2. Feed the protocol engine (real-time, never persisted) — drives the
    //    left panel's detection, timers and notifications.
    pushProtocolSegment(seg.text)

    // 3. Accumulate for AI context, stamped with the wall-clock time it landed.
    const { time: clock } = nowDateTime()
    allSegmentsRef.current.push({ ...seg, clock })
    pendingCountRef.current += 1

    // 3. AI auto-fill — only when the toggle is on.
    if (!aiEnabledRef.current) return
    if (pendingCountRef.current < BATCH_SIZE) return
    pendingCountRef.current = 0

    setIsUpdating(true)
    try {
      const res = await fetch('/api/form-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: allSegmentsRef.current,
          currentForm: formData,
        }),
      })
      if (!res.ok) return
      const { form } = await res.json() as { form: MoHFormData }
      setFormData(form)
    } catch (e) {
      console.error('form-fill failed', e)
    } finally {
      setIsUpdating(false)
    }
  }, [formData, sessionId, supabase, pushProtocolSegment])

  // Inject the start date/time once, when recording begins — so the AI never
  // fills (or later overwrites) these. Only sets fields still empty.
  const handleSessionStart = useCallback(() => {
    const { date, time } = nowDateTime()
    setFormData(f => ({
      ...f,
      preResuscitation: {
        ...f.preResuscitation,
        date: f.preResuscitation.date || date,
        timeStarted: f.preResuscitation.timeStarted || time,
      },
    }))
  }, [])

  // Mark the session ended when the user stops recording.
  const handleSessionEnd = useCallback(() => {
    supabase
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .then(({ error }) => { if (error) console.error('session end failed', error) })
  }, [sessionId, supabase])

  return (
    <div className="h-screen flex flex-col bg-[#EDE8E1] dark:bg-[#141210] transition-colors duration-200">
      <div className="flex-1 flex flex-col gap-2 p-3 pt-[calc(3.5rem+0.75rem)] min-h-0">

        <WindowGroup className="flex-1 min-h-0">
          <Window title="פרוטוקול">
            <ProtocolPanel engine={protocol} />
          </Window>

          <Window title="Transcript">
            <TranscriptPanel
              onSegmentFinalized={handleSegment}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionEnd}
            />
          </Window>

          <Window title={isUpdating && aiEnabled ? 'נספח ז ●' : 'נספח ז'}>
            <AiToggle enabled={aiEnabled} onChange={setAiEnabled} />
            <MoHForm data={formData} onChange={setFormData} />
          </Window>
        </WindowGroup>

      </div>
    </div>
  )
}

// ── AI auto-fill toggle ───────────────────────────────────────────────────────
function AiToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2 bg-[#FFFEF9]/95 dark:bg-[#1C1917]/95 backdrop-blur-sm border-b border-[#E8E2D9] dark:border-[#2E2A27]">
      <span className="text-[11px] font-medium text-[#6b6662] dark:text-[#9A8F82]">
        מילוי אוטומטי ב-AI
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle AI auto-fill"
        onClick={() => onChange(!enabled)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-[#c15f3c]' : 'bg-[#cfc8bd] dark:bg-[#3a3835]',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
