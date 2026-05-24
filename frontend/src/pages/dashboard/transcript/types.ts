// ── App-level types ───────────────────────────────────────────────────────────

export type ConnectionState = 'idle' | 'connecting' | 'live' | 'paused' | 'error'

export type StaffMember = {
  id: string
  name: string          // Hebrew display name
  nameHe: string        // search key (Hebrew, no punctuation)
  nameEn?: string       // English alias
  role: string
  initials: string
  color: string
}

/** Speaker resolved from Soniox token → staff member (or unresolved) */
export type SpeakerResolution = {
  token: string                // Soniox token e.g. "S1"
  staffId: string | null       // null = not yet identified
  confidence: 'enrolled' | 'manual' | 'unresolved'
}

export type TranscriptSegment = {
  id: string
  token: string         // Soniox speaker token e.g. "S1"
  text: string
  words: never[]        // reserved for future per-token data
  start_ms: number
  is_final: boolean
}

/** One slot in the enrollment roll-call */
export type EnrollmentSlot = {
  index: number
  staffId: string | null         // who we think this is
  detectedText: string           // what Soniox heard
  assignedToken: string | null   // Soniox token captured during this slot
  confirmed: boolean
}