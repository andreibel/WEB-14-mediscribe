import { useRef, useEffect, useState, useCallback } from 'react'
import { useTranscript } from './transcript/useTranscript'
import { SpeakerPickerPopover } from './transcript/SpeakerPickerPopover'
import { EnrollmentModal } from './transcript/EnrollmentModal'
import { staffById, unknownSpeaker } from './transcript/staffDb'
import { MedicalBackground } from './transcript/MedicalBackground'
import { TranscriptHeader } from './transcript/TranscriptHeader'
import { ErrorBanner } from './transcript/TranscriptAtoms'
import { Bubble } from './transcript/Bubble'
import { SessionControls } from './transcript/SessionControls'
import { MOCK_SEGMENTS, MOCK_SPEAKER_MAP } from './transcript/mockData'
import type { StaffMember } from './transcript/types'

const API_KEY = import.meta.env.VITE_SONIOX_API_KEY ?? ''

export function TranscriptPanel() {
  const t = useTranscript(API_KEY)

  const [pickerToken, setPickerToken]   = useState<string | null>(null)
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null)
  const [showEnrollment, setShowEnrollment] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [t.segments.length])

  const openPicker = useCallback((token: string, rect: DOMRect) => {
    setPickerToken(token)
    setPickerAnchor(rect)
  }, [])

  const isLive = t.connectionState !== 'idle' && t.connectionState !== 'error'

  const displaySegments = isLive
    ? (t.partialSegment ? [...t.segments, t.partialSegment] : t.segments)
    : MOCK_SEGMENTS

  const displaySpeakerMap = isLive ? t.speakerMap : MOCK_SPEAKER_MAP

  const resolveSpeaker = useCallback((map: Map<string, string>, token: string): StaffMember => {
    const staffId = map.get(token)
    return staffId ? (staffById(staffId) ?? unknownSpeaker(token)) : unknownSpeaker(token)
  }, [])

  const handleStartSession = () => {
    t.startEnrollment(5)
    setShowEnrollment(true)
    t.connect()
  }

  const handleEnrollmentFinish = () => {
    setShowEnrollment(false)
    t.finishEnrollment()
  }

  const handleEnrollmentSkip = () => {
    setShowEnrollment(false)
    t.skipEnrollment()
  }

  const handleRollCall = () => {
    t.startEnrollment(5)
    setShowEnrollment(true)
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
        onRollCall={handleRollCall}
      />

      {t.errorMessage && (
        <ErrorBanner message={t.errorMessage} onRetry={t.connect} />
      )}

      <div className={['relative flex-1 overflow-y-auto px-4 py-4 space-y-4', !isLive && 'opacity-60'].filter(Boolean).join(' ')}>
        {displaySegments.map(seg => (
          <Bubble
            key={seg.id}
            segment={seg}
            speaker={resolveSpeaker(displaySpeakerMap, seg.token)}
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
        onStop={t.disconnect}
      />

      {pickerToken && pickerAnchor && (
        <SpeakerPickerPopover
          token={pickerToken}
          currentStaffId={t.speakerMap.get(pickerToken) ?? null}
          onAssign={staffId => t.assignSpeaker(pickerToken, staffId)}
          onUnassign={() => t.unassignSpeaker(pickerToken)}
          onClose={() => { setPickerToken(null); setPickerAnchor(null) }}
          anchorRect={pickerAnchor}
        />
      )}

      {showEnrollment && (
        <EnrollmentModal
          slots={t.enrollmentSlots}
          currentIndex={t.currentSlotIndex}
          audioLevel={t.audioLevel}
          onNext={t.advanceEnrollmentSlot}
          onConfirmSlot={t.confirmEnrollmentSlot}
          onFinish={handleEnrollmentFinish}
          onSkip={handleEnrollmentSkip}
        />
      )}
    </div>
  )
}
