import type { Protocol } from '../types'

const MIN = 60_000

// ── ACLS — Adult Cardiac Arrest Algorithm (VF/pVT + Asystole/PEA) ─────────────
//
// Modelled on the AHA "Adult Cardiac Arrest Algorithm" as a UML-style activity
// graph: process boxes, decision diamonds, shock/drug events, two parallel lanes
// (shockable / non-shockable) and loop-backs. Intervals follow AHA defaults and
// live here in config so they're trivial to tune per deployment.

// Shared detection vocab — the KEYWORDS the session listens for.
const D = {
  shock: [/דפיברילציה/, /הלם\s*חשמלי/, /\bשוק\b/, /\bshock\b/i, /defib/i],
  epi: [/אדרנלין/, /אפינפרין/, /\bepi\b/i, /adrenaline/i, /epinephrine/i],
  amio: [/אמיודרון/, /קורדרון/, /amiodarone/i, /cordarone/i, /לידוקאין/, /lidocaine/i],
  rhythmCheck: [/בדיק(ת|ה)\s*קצב/, /בדיק(ת|ה)\s*דופק/, /אנליז(ה|ת)/, /rhythm\s*check/i],
}

export const acls: Protocol = {
  id: 'acls',
  name: 'החייאה (ACLS)',
  description: 'אלגוריתם דום לב — VF/pVT ו-Asystole/PEA',
  entry: 's1',

  triggers: [
    /דום\s*לב/,
    /החייאה/,
    /אין\s*דופק/,
    /עיסוי(ים)?\s*(לב|חזה)/,
    /\bcpr\b/i,
    /\bacls\b/i,
  ],

  nodes: [
    // ── Trunk: entry + the split decision ──
    {
      id: 's1', kind: 'start', lane: 'trunk', badge: 1, title: 'התחל החייאה',
      bullets: ['תן חמצן', 'חבר מוניטור / דפיברילטור'],
      next: 'd1',
    },
    {
      id: 'd1', kind: 'decision', lane: 'trunk', title: 'קצב מתאים לשוק?',
      yes: 'n2', no: 'n9', yesLabel: 'כן · VF/pVT', noLabel: 'לא · Asystole/PEA',
    },

    // ── Lane A — VF / pVT (shockable) ──
    { id: 'n2', kind: 'event', lane: 'a', tone: 'rhythm', badge: 2, title: 'VF / pVT', next: 'e3' },
    { id: 'e3', kind: 'event', lane: 'a', tone: 'shock', badge: 3, title: 'שוק', detect: D.shock, next: 'p4' },
    {
      id: 'p4', kind: 'process', lane: 'a', badge: 4, title: 'CPR · 2 דק׳',
      bullets: ['גישה ורידית / תוך-גרמית (IV/IO)'],
      detect: D.rhythmCheck, timer: { interval_ms: 2 * MIN, repeat: true, label: 'מחזור 2 דק׳' },
      next: 'd2',
    },
    { id: 'd2', kind: 'decision', lane: 'a', title: 'קצב מתאים לשוק?', yes: 'e5', no: 'p10' },
    { id: 'e5', kind: 'event', lane: 'a', tone: 'shock', badge: 5, title: 'שוק', detect: D.shock, next: 'p6' },
    {
      id: 'p6', kind: 'process', lane: 'a', badge: 6, title: 'CPR · 2 דק׳',
      bullets: ['אדרנלין כל 3–5 דק׳', 'שקול נתיב אוויר מתקדם, קפנוגרפיה'],
      detect: D.epi, timer: { interval_ms: 4 * MIN, repeat: true, label: 'אדרנלין כל 3–5 דק׳' },
      next: 'd3',
    },
    { id: 'd3', kind: 'decision', lane: 'a', title: 'קצב מתאים לשוק?', yes: 'e7', no: 'p10' },
    { id: 'e7', kind: 'event', lane: 'a', tone: 'shock', badge: 7, title: 'שוק', detect: D.shock, next: 'p8' },
    {
      id: 'p8', kind: 'process', lane: 'a', badge: 8, title: 'CPR · 2 דק׳',
      bullets: ['אמיודרון או לידוקאין', 'טפל בסיבות הפיכות'],
      detect: D.amio,
      next: 'e5', // loop back → "חזרה לשלב 5"
    },

    // ── Lane B — Asystole / PEA (non-shockable) ──
    { id: 'n9', kind: 'event', lane: 'b', tone: 'rhythm', badge: 9, title: 'Asystole / PEA', next: 'd9' },
    { id: 'd9', kind: 'event', lane: 'b', tone: 'drug', title: 'אדרנלין מיידי', detect: D.epi, next: 'p10' },
    {
      id: 'p10', kind: 'process', lane: 'b', badge: 10, title: 'CPR · 2 דק׳',
      bullets: ['גישה ורידית / תוך-גרמית', 'אדרנלין כל 3–5 דק׳', 'שקול נתיב אוויר מתקדם, קפנוגרפיה'],
      detect: D.epi, timer: { interval_ms: 4 * MIN, repeat: true, label: 'אדרנלין כל 3–5 דק׳' },
      next: 'd4',
    },
    { id: 'd4', kind: 'decision', lane: 'b', title: 'קצב מתאים לשוק?', yes: 'e5', no: 'p11' },
    {
      id: 'p11', kind: 'process', lane: 'b', badge: 11, title: 'CPR · 2 דק׳',
      bullets: ['טפל בסיבות הפיכות'],
      next: 'd5',
    },
    { id: 'd5', kind: 'decision', lane: 'b', title: 'קצב מתאים לשוק?', yes: 'e5', no: 't12' },

    // ── Trunk: shared outcome ──
    {
      id: 't12', kind: 'terminal', lane: 'trunk', badge: 12, title: 'המשך / סיום',
      bullets: [
        'אם אין ROSC — חזור לשלב 10 או 11',
        'אם יש ROSC — טיפול לאחר החייאה',
        'שקול התאמת המשך החייאה',
      ],
    },
  ],
}
