import { useCallback, useEffect, useState } from 'react'

// Protocol panel settings. Local + ephemeral-friendly: persisted only to
// localStorage (the panel data itself never touches the DB).

export interface ProtocolSettings {
  /** Auto-activate a protocol when its trigger phrase is heard. */
  autoDetect: boolean
  /** Play a beep when a step becomes due/overdue. */
  sound: boolean
  /** Also raise an OS notification (requires permission). */
  browserNotify: boolean
  /** Pan the diagram to keep the current node centered. */
  follow: boolean
}

const KEY = 'mediscribe.protocol.settings'
const DEFAULTS: ProtocolSettings = { autoDetect: true, sound: true, browserNotify: false, follow: true }

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
