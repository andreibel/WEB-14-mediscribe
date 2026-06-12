// Normalize transcript text before regex matching.
//
// Soniox returns plain, unvocalized Hebrew mixed with English. We strip nikud and
// punctuation and collapse whitespace so detection patterns can stay simple. We do
// NOT fold final-letter forms (ם/מ, ן/נ) — words like "אדרנלין" already carry the
// correct final form, and patterns are written against the natural spelling.

const NIKUD = /[֑-ׇ]/g          // Hebrew points + cantillation
const PUNCT = /["'׳״“”‘’.,;:!?()[\]{}]/g  // quotes, gershayim, sentence punctuation

export function normalizeHe(input: string): string {
  return input
    .replace(NIKUD, '')
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase() // lowercases Latin (epi/EPI); no-op for Hebrew
}

/** True if any pattern hits the normalized text. */
export function matchesAny(normalized: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(normalized))
}
