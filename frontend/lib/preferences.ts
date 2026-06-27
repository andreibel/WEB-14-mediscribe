// ─── User preferences: shared business logic ──────────────────────────────────
// Single source of truth for the shape, defaults and validation of the per-user
// preferences stored in `public.users.preferences` (jsonb). Both the
// localStorage hook (in-session, offline-friendly) and the Supabase-backed
// settings page read their types/defaults from here so the two never drift.

/** Protocol-panel defaults — applied to every session unless changed mid-session. */
export interface ProtocolSettings {
  /** Auto-activate a protocol when its trigger phrase is heard. */
  autoDetect: boolean;
  /** Play a beep when a step becomes due/overdue. */
  sound: boolean;
  /** Also raise an OS notification (requires permission). */
  browserNotify: boolean;
  /** Pan the diagram to keep the current node centered. */
  follow: boolean;
}

export const DEFAULT_PROTOCOL_SETTINGS: ProtocolSettings = {
  autoDetect: true,
  sound: true,
  browserNotify: false,
  follow: true,
};

/** localStorage key the in-session panel reads/writes (kept here so the settings
 *  page can mirror Supabase writes into it and keep an active session in sync). */
export const PROTOCOL_SETTINGS_KEY = "mediscribe.protocol.settings";

/**
 * Coerce an untrusted value (jsonb from the DB, parsed localStorage) into a
 * valid ProtocolSettings, filling any missing/garbage keys from the defaults.
 * Never throws — bad input degrades to defaults.
 */
export function normalizeProtocolSettings(raw: unknown): ProtocolSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROTOCOL_SETTINGS };
  const r = raw as Record<string, unknown>;
  const pick = (k: keyof ProtocolSettings) =>
    typeof r[k] === "boolean" ? (r[k] as boolean) : DEFAULT_PROTOCOL_SETTINGS[k];
  return {
    autoDetect: pick("autoDetect"),
    sound: pick("sound"),
    browserNotify: pick("browserNotify"),
    follow: pick("follow"),
  };
}

/** Extract protocol settings from a `users.preferences` blob (any/unknown). */
export function readProtocolSettings(preferences: unknown): ProtocolSettings {
  const p = preferences as Record<string, unknown> | null | undefined;
  return normalizeProtocolSettings(p?.protocol);
}