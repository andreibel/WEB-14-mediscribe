import { useRef, useEffect, useState, useCallback } from 'react'
import { useTranscript } from './useTranscript'
import { useStaff } from './useStaff'
import type { TranscriptSegment, StaffMember } from './types'
import { SpeakerPickerPopover } from './SpeakerPickerPopover'
import { staffById, unknownSpeaker } from './staffDb'
import { MedicalBackground } from './MedicalBackground'
import { TranscriptHeader } from './TranscriptHeader'
import { ErrorBanner } from './TranscriptAtoms'
import { Bubble } from './Bubble'
import { SessionControls } from './SessionControls'
import { MOCK_SEGMENTS, MOCK_SPEAKER_MAP } from './mockData'

export function TranscriptPanel({ sessionId, onSegmentFinalized, onSessionStart, onSessionEnd }: {
  sessionId: string
  onSegmentFinalized?: (seg: TranscriptSegment) => void
  onSessionStart?: () => void
  onSessionEnd?: () => void
}) {
  const t = useTranscript(sessionId, onSegmentFinalized)
  const { staff, byId: staffBy } = useStaff()

  const [pickerSegment, setPickerSegment] = useState<TranscriptSegment | null>(null)
  const [pickerAnchor, setPickerAnchor]   = useState<DOMRect | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [t.segments.length])

  const openPicker = useCallback((segment: TranscriptSegment, rect: DOMRect) => {
    setPickerSegment(segment)
    setPickerAnchor(rect)
  }, [])

  const isLive = t.connectionState !== 'idle' && t.connectionState !== 'error'

  const displaySegments = isLive
    ? (t.partialSegment ? [...t.segments, t.partialSegment] : t.segments)
    : MOCK_SEGMENTS

  const displaySpeakerMap = isLive ? t.speakerMap : MOCK_SPEAKER_MAP

  // Resolution precedence: per-segment override → token default → unresolved.
  // Live identities come from the real staff directory; the idle preview uses
  // the mock staff so the demo bubbles still render nicely.
  const resolveSpeaker = useCallback((seg: TranscriptSegment): StaffMember => {
    const overrideId = seg.seq != null ? t.segmentMap.get(seg.seq) : undefined
    const userId = overrideId ?? displaySpeakerMap.get(seg.token)
    if (!userId) return unknownSpeaker(seg.token)
    const found = isLive ? staffBy(userId) : staffById(userId)
    return found ?? unknownSpeaker(seg.token)
  }, [isLive, staffBy, displaySpeakerMap, t.segmentMap])

  const handleStartSession = () => {
    onSessionStart?.()
    t.connect()
  }

  const handleStop = () => {
    t.disconnect()
    onSessionEnd?.()
  }

  const uniqueTokens = [...new Set(displaySegments.map(s => s.token))]

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="absolute inset-0 bg-[#f4f3ee] dark:bg-[#1a1a18]" />
      <MedicalBackground />

      <TranscriptHeader
        connectionState={t.connectionState}
        audioLevel={t.audioLevel}
        speakerCount={uniqueTokens.length}
      />

      {t.errorMessage && (
        <ErrorBanner message={t.errorMessage} onRetry={t.connect} />
      )}

      <div className={['relative flex-1 overflow-y-auto px-4 py-4 space-y-4', !isLive && 'opacity-60'].filter(Boolean).join(' ')}>
        {displaySegments.map(seg => (
          <Bubble
            key={seg.id}
            segment={seg}
            speaker={resolveSpeaker(seg)}
            onAvatarClick={openPicker}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="relative h-6 shrink-0 bg-linear-to-t from-[#f4f3ee] dark:from-[#1a1a18] to-transparent pointer-events-none" />

      <SessionControls
        connectionState={t.connectionState}
        onStart={handleStartSession}
        onPause={t.pause}
        onResume={t.resume}
        onStop={handleStop}
      />

      {pickerSegment && pickerAnchor && (
        <SpeakerPickerPopover
          token={pickerSegment.token}
          seq={pickerSegment.seq}
          staff={staff}
          currentTokenUserId={t.speakerMap.get(pickerSegment.token) ?? null}
          currentSegmentUserId={pickerSegment.seq != null ? (t.segmentMap.get(pickerSegment.seq) ?? null) : null}
          onAssignToken={userId => t.assignSpeaker(pickerSegment.token, userId)}
          onAssignSegment={userId => { if (pickerSegment.seq != null) t.assignSegment(pickerSegment.seq, userId) }}
          onClearToken={() => t.unassignSpeaker(pickerSegment.token)}
          onClearSegment={() => { if (pickerSegment.seq != null) t.unassignSegment(pickerSegment.seq) }}
          onClose={() => { setPickerSegment(null); setPickerAnchor(null) }}
          anchorRect={pickerAnchor}
        />
      )}
    </div>
  )
}
