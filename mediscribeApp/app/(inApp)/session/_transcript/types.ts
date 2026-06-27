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

export type TranscriptSegment = {
  id: string
  seq?: number          // DB row id (transcript_segments.seq), set once persisted
  token: string         // Soniox speaker token e.g. "S1"
  text: string
  words: never[]        // reserved for future per-token data
  start_ms: number
  is_final: boolean
}