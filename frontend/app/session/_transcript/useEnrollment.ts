import { useState, useRef, useCallback } from 'react'
import type { EnrollmentSlot } from './types'

type SonioxToken = { text: string; speaker?: string }

/**
 * Speaker-enrollment roll-call state machine, split out of useTranscript so the
 * transcription hook stays focused on audio + WebSocket plumbing.
 *
 * `assignSpeaker` is injected by the parent (it owns the speaker→staff map) so
 * confirming a slot can bind the detected Soniox token to a staff member.
 */
export function useEnrollment(assignSpeaker: (token: string, staffId: string) => void) {
  const [enrollmentActive, setEnrollmentActive] = useState(false)
  const [enrollmentSlots, setEnrollmentSlots]   = useState<EnrollmentSlot[]>([])
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0)

  // Per-token speech counts for the current slot; used to pick the dominant speaker.
  const slotTokensRef = useRef<Map<string, number>>(new Map())

  /** Feed live tokens in while a slot is recording. No-op when not enrolling. */
  const trackEnrollment = useCallback((tokens: SonioxToken[]) => {
    if (!enrollmentActive) return
    for (const t of tokens) {
      if (!t.speaker) continue
      slotTokensRef.current.set(t.speaker, (slotTokensRef.current.get(t.speaker) ?? 0) + 1)
    }
    const text = tokens.map(t => t.text).join('')
    if (text.trim()) {
      setEnrollmentSlots(prev => prev.map((s, i) =>
        i === currentSlotIndex
          ? { ...s, detectedText: (s.detectedText + text).replace(/\s+/g, ' ').trim() }
          : s,
      ))
    }
  }, [enrollmentActive, currentSlotIndex])

  const startEnrollment = useCallback((expectedCount: number) => {
    setEnrollmentSlots(Array.from({ length: expectedCount }, (_, i) => ({
      index: i, staffId: null, detectedText: '', assignedToken: null, confirmed: false,
    })))
    setCurrentSlotIndex(0)
    setEnrollmentActive(true)
    slotTokensRef.current = new Map()
  }, [])

  const advanceEnrollmentSlot = useCallback(() => {
    let dominantToken: string | null = null
    let maxCount = 0
    for (const [tok, count] of slotTokensRef.current) {
      if (count > maxCount) { maxCount = count; dominantToken = tok }
    }
    setEnrollmentSlots(prev => prev.map((s, i) =>
      i === currentSlotIndex ? { ...s, assignedToken: dominantToken } : s,
    ))
    slotTokensRef.current = new Map()
    setCurrentSlotIndex(prev => prev + 1)
  }, [currentSlotIndex])

  const confirmEnrollmentSlot = useCallback((slotIndex: number, staffId: string) => {
    setEnrollmentSlots(prev => prev.map((s, i) => {
      if (i !== slotIndex) return s
      if (s.assignedToken) assignSpeaker(s.assignedToken, staffId)
      return { ...s, staffId, confirmed: true }
    }))
  }, [assignSpeaker])

  const finishEnrollment = useCallback(() => setEnrollmentActive(false), [])
  const skipEnrollment   = useCallback(() => { setEnrollmentActive(false); setEnrollmentSlots([]) }, [])

  return {
    enrollmentActive, enrollmentSlots, currentSlotIndex,
    trackEnrollment,
    startEnrollment, advanceEnrollmentSlot,
    confirmEnrollmentSlot, finishEnrollment, skipEnrollment,
  }
}
