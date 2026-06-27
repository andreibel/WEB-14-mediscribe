import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_PROTOCOL_SETTINGS,
  PROTOCOL_SETTINGS_KEY,
  type ProtocolSettings,
} from '@/lib/preferences'

// In-session protocol settings hook. Type, defaults and storage key live in
// lib/preferences (the single source of truth shared with the Supabase-backed
// settings page). This hook persists to localStorage only — fast and
// offline-friendly during a live session; the settings page mirrors the user's
// saved defaults into the same key so an active session stays in sync.

export type { ProtocolSettings }

const KEY = PROTOCOL_SETTINGS_KEY
const DEFAULTS = DEFAULT_PROTOCOL_SETTINGS

export function useProtocolSettings(): [ProtocolSettings, (patch: Partial<ProtocolSettings>) => void] {
  // Start from defaults on both server and first client render to avoid a
  // hydration mismatch; hydrate from localStorage in an effect.
  const [settings, setSettings] = useState<ProtocolSettings>(DEFAULTS)

  useEffect(() => {
    // Hydrate from localStorage after mount (not in a lazy initializer) so the
    // first client render matches the server's DEFAULTS and avoids a mismatch.
    try {
      const raw = localStorage.getItem(KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot hydrate
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  const update = useCallback((patch: Partial<ProtocolSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return [settings, update]
}
