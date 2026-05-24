import type { TranscriptSegment } from './types'

export const MOCK_SEGMENTS: TranscriptSegment[] = [
  { id: 'm1', token: 'S5', start_ms: 67262000, is_final: true, words: [], text: 'גבר 52, תאונת דרכים, חבלה בחזה ובבטן. GCS 9. לחץ דם 80/50, דופק 130.' },
  { id: 'm2', token: 'S1', start_ms: 67278000, is_final: true, words: [], text: 'מתחילים פרוטוקול טראומה — כולם לתפקידים.' },
  { id: 'm3', token: 'S3', start_ms: 67295000, is_final: true, words: [], text: 'מוכן. מתחיל RSI — Ketamine 100mg ו-Succinylcholine 140mg.' },
  { id: 'm4', token: 'S2', start_ms: 67330000, is_final: true, words: [], text: 'שני עירויים רחבים פתוחים. מתחיל עירוי מסיבי.' },
  { id: 'm5', token: 'S4', start_ms: 67385000, is_final: true, words: [], text: 'הכירורג בדרך, 3 דקות. SpO₂ 92% — מעלה חמצן.' },
  { id: 'm6', token: 'S3', start_ms: 67408000, is_final: true, words: [], text: 'אינטובציה הושלמה. צינור 8.0 בעומק 22 ס"מ. SpO₂ עולה ל-97%.' },
  { id: 'm7', token: 'S2', start_ms: 67441000, is_final: true, words: [], text: 'TXA 1g ניתן. לחץ דם 95/60 — משתפר.' },
  { id: 'm8', token: 'S1', start_ms: 67470000, is_final: true, words: [], text: 'טוב מאוד. מנטרים רציף. מוכנים להעברה לניתוח.' },
]

export const MOCK_SPEAKER_MAP = new Map<string, string>([
  ['S1', 'cohen'], ['S2', 'katz'], ['S3', 'stern'], ['S4', 'levi'], ['S5', 'ben'],
])
