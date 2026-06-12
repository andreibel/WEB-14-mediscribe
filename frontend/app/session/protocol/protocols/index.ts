import type { Protocol } from '../types'
import { acls } from './acls'

// The registry. Adding a protocol = one import + one entry here. Nothing else.
export const PROTOCOLS: Protocol[] = [acls]

export function getProtocol(id: string | null): Protocol | null {
  if (!id) return null
  return PROTOCOLS.find((p) => p.id === id) ?? null
}
