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