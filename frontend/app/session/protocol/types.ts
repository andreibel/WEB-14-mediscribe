// ── Protocol model: a node graph (UML activity diagram) ───────────────────────
//
// A protocol is *data, not code*. The engine knows nothing about ACLS — it walks
// whatever nodes/edges the config declares and overlays live state (detected,
// counting down, due) on them. New protocols = a new graph file + one registry
// line. New diagram look = a new node kind/tone, added once to the renderer.

export type NodeKind =
  | 'start'     // entry pill — "Start CPR"
  | 'process'   // blue rounded box with bullets — "CPR 2 min"
  | 'decision'  // pink diamond — "Rhythm shockable?"
  | 'event'     // an action moment — shock / drug / rhythm label
  | 'terminal'  // end / outcome box

/** Visual sub-type for `event` nodes — picks colour + icon. */
export type EventTone = 'shock' | 'drug' | 'rhythm'

/** A repeating/one-shot timer attached to a node (epinephrine q3–5m, CPR 2m…). */
export interface NodeTimer {
  interval_ms: number
  repeat?: boolean
  /** Short label for the countdown, e.g. "כל 3–5 דק׳". */
  label?: string
}

export interface ProtocolNode {
  id: string
  kind: NodeKind
  /** The numbered circle from the algorithm (1…12). */
  badge?: number
  /** Hebrew title shown in the node. */
  title: string
  /** Bullet lines inside a process/terminal box. */
  bullets?: string[]
  /** event-only: colour/icon selector. */
  tone?: EventTone
  note?: string
  source?: string

  /**
   * Layout lane. 'trunk' nodes render full-width (entry + shared outcome); 'a'
   * and 'b' render as two parallel columns that split off the trunk decision.
   * Defaults to 'trunk'.
   */
  lane?: 'trunk' | 'a' | 'b'

  // ── Engine hooks (all optional — visual-only nodes omit them) ──
  /** Keywords that "fire" this node when heard (Hebrew + English). */
  detect?: RegExp[]
  /** Reminder timer; arms when the node first fires. */
  timer?: NodeTimer

  // ── Flow edges ──
  /** Default downstream node (start/process/event). */
  next?: string
  /** decision-only branches. */
  yes?: string
  no?: string
  yesLabel?: string // default "כן"
  noLabel?: string  // default "לא"
}

export interface Protocol {
  id: string
  name: string
  description?: string
  /** Phrases that auto-activate the protocol (voice self-load). */
  triggers: RegExp[]
  /** id of the entry node. */
  entry: string
  nodes: ProtocolNode[]
}

// ── Runtime (ephemeral — the whole left panel is real-time, never persisted) ──

export interface NodeRuntime {
  firedCount: number
  /** Epoch ms of the most recent firing, or null. */
  lastFiredAt: number | null
  /** User ticked the node's checkbox. */
  done: boolean
}

export type TimerStatus = 'idle' | 'counting' | 'due' | 'overdue'

/** Derived countdown view for a timed node at a given `now`. */
export interface TimerView {
  status: TimerStatus
  remainingMs: number | null
  totalMs: number | null
}

export type NotifKind = 'protocol' | 'due' | 'overdue' | 'info'

export interface ProtocolNotification {
  id: string
  kind: NotifKind
  title: string
  body?: string
  ts: number
}
