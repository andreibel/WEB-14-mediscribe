import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names safely for Tailwind.
 *
 * Runs two steps:
 *  1. `clsx`    — flattens conditional inputs (strings, arrays, objects,
 *                 falsy values) into a single space-separated string.
 *  2. `twMerge` — resolves *conflicting* Tailwind utilities so the last one
 *                 wins (e.g. "px-2 px-4" -> "px-4"), preventing ambiguous
 *                 output that would otherwise depend on CSS source order.
 *
 * This is what lets reusable components expose a `className` prop that callers
 * can override predictably:
 *   cn("px-4 py-2", className)  // caller's "px-8" overrides the default "px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
