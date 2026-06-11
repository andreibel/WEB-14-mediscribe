'use client'

import { useState, useRef, useCallback, useMemo, use } from 'react'
import { Window, WindowGroup } from '@/components/window'
import { TranscriptPanel } from '../transcript/TranscriptPanel'
import { MoHForm } from '../MoHForm'
import { EMPTY_FORM, type MoHFormData } from '../MoHForm/formSchema'
import type { TranscriptSegment } from '../transcript/types'
import { createClient } from '@/lib/supabase/client'

const BATCH_SIZE = 10

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params)
  const supabase = useMemo(() => createClient(), [])

  const [formData, setFormData]     = useState<MoHFormData>(EMPTY_FORM)
  const [isUpdating, setIsUpdating]  = useState(false)
  const [aiEnabled, setAiEnabled]    = useState(true)

  // Read the toggle from inside the (otherwise stable) segment handler
  // without re-creating it on every flip.
  const aiEnabledRef = useRef(aiEnabled)
  aiEnabledRef.current = aiEnabled

  // All finalized segments accumulated for the session — sent as full context each call
  const allSegmentsRef  = useRef<TranscriptSegment[]>([])
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

    // 2. Accumulate for AI context.
    allSegmentsRef.current.push(seg)
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
  }, [formData, sessionId, supabase])

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
          <Window title="Overview" defaultMinimized={true}>
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                This panel shows a high-level summary of the current session.
                You can minimize it to reclaim space, or maximize it to focus.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Active', 'Pending', 'Done', 'Total'].map((label, i) => (
                  <div key={label} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <div className="text-lg font-bold text-gray-800">{(i + 1) * 12}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Window>

          <Window title="Transcript">
            <TranscriptPanel onSegmentFinalized={handleSegment} onSessionEnd={handleSessionEnd} />
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
