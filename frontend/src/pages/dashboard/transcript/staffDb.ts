import type { StaffMember } from './types'

// Mock staff database — replace with real API call
export const STAFF_DB: StaffMember[] = [
  { id: 'cohen',  name: 'ד"ר כהן',   nameHe: 'כהן',   nameEn: 'cohen',  role: 'רופא מוביל',   initials: 'כה', color: '#3b82f6' },
  { id: 'katz',   name: 'אחות כץ',   nameHe: 'כץ',    nameEn: 'katz',   role: 'אחות תרופות',  initials: 'כץ', color: '#8b5cf6' },
  { id: 'stern',  name: 'ד"ר שטרן',  nameHe: 'שטרן',  nameEn: 'stern',  role: 'הרדמה',        initials: 'שט', color: '#ec4899' },
  { id: 'levi',   name: 'אחות לוי',  nameHe: 'לוי',   nameEn: 'levi',   role: 'אחות אחראית',  initials: 'לו', color: '#10b981' },
  { id: 'ben',    name: 'פרמדיק בן', nameHe: 'בן',    nameEn: 'ben',    role: 'פרמדיק',       initials: 'בן', color: '#f59e0b' },
  { id: 'mizrahi',name: 'ד"ר מזרחי', nameHe: 'מזרחי', nameEn: 'mizrahi',role: 'כירורג',       initials: 'מז', color: '#ef4444' },
  { id: 'shapira',name: 'אחות שפירא',nameHe: 'שפירא', nameEn: 'shapira',role: 'טיפול נמרץ',   initials: 'שפ', color: '#06b6d4' },
]

export function staffById(id: string): StaffMember | undefined {
  return STAFF_DB.find(s => s.id === id)
}

/** Fuzzy match a transcribed utterance (e.g. "אני כהן" or "I'm Dr. Cohen") → best StaffMember */
export function fuzzyMatchStaff(text: string): StaffMember | null {
  const normalized = text.toLowerCase().trim()
  let best: StaffMember | null = null
  let bestScore = 0

  for (const s of STAFF_DB) {
    let score = 0
    if (normalized.includes(s.nameHe.toLowerCase())) score += 10
    if (s.nameEn && normalized.includes(s.nameEn.toLowerCase())) score += 8
    // Partial: first two chars
    if (normalized.includes(s.nameHe.slice(0, 2))) score += 3
    if (score > bestScore) { best = s; bestScore = score }
  }

  return bestScore >= 3 ? best : null
}

/** Unresolved placeholder for unknown speaker tokens */
export function unknownSpeaker(token: string): StaffMember {
  const hue = token.charCodeAt(token.length - 1) * 40
  return {
    id: `__${token}`,
    name: `דובר ${token}`,
    nameHe: token,
    role: 'לא מזוהה',
    initials: token.replace(/\D/g, '') || '?',
    color: `hsl(${hue}, 50%, 50%)`,
  }
}