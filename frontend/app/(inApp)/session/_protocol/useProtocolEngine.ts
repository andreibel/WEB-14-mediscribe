'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Protocol,
  ProtocolNode,
  NodeRuntime,
  TimerView,
  TimerStatus,
  ProtocolNotification,
} from './types'
import { normalizeHe, matchesAny } from './normalize'
import { getProtocol, PROTOCOLS } from './protocols'
import { useProtocolSettings, type ProtocolSettings } from './settings'

const GRACE_MS = 30_000 // after due, before escalating to overdue
const TICK_MS = 1_000

// ── Pure: countdown view for a timed node ─────────────────────────────────────
export function computeTimerView(node: ProtocolNode, rt: NodeRuntime, now: number): TimerView {
  if (!node.timer || rt.lastFiredAt == null) return { status: 'idle', remainingMs: null, totalMs: null }
  const dueAt = rt.lastFiredAt + node.timer.interval_ms
  const remaining = dueAt - now
  let status: TimerStatus = 'counting'
  if (remaining <= 0) status = now >= dueAt + GRACE_MS ? 'overdue' : 'due'
  return { status, remainingMs: remaining, totalMs: node.timer.interval_ms }
}

function emptyRuntime(): NodeRuntime {
  return { firedCount: 0, lastFiredAt: null, done: false }
}

// ── WebAudio beep (no asset) ──────────────────────────────────────────────────
let audioCtx: AudioContext | null = null
function getCtx(): AudioContext | null {
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    return audioCtx
  } catch {
    return null
  }
}
// Browsers start the AudioContext "suspended" until a user gesture — resume it so
// later timer beeps (which aren't gestures) actually play.
function unlockAudio() {
  const ctx = getCtx()
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
}
function beep(overdue: boolean) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = overdue ? 880 : 660
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32)
    osc.start()
    osc.stop(ctx.currentTime + 0.34)
  } catch {
    /* autoplay blocked or unsupported */
  }
}

export interface ProtocolEngine {
  activeProtocol: Protocol | null
  available: Protocol[]
  /** nodeId → runtime. */
  runtimes: Record<string, NodeRuntime>
  /** nodeId → countdown view (only nodes with a timer). */
  timerViews: Record<string, TimerView>
  /** Most recently fired node — highlighted in the diagram. */
  activeNodeId: string | null
  notifications: ProtocolNotification[]
  now: number
  settings: ProtocolSettings
  updateSettings: (patch: Partial<ProtocolSettings>) => void
  /** Feed a finalized transcript segment. Stable identity. */
  pushSegment: (text: string) => void
  loadProtocol: (id: string) => void
  unload: () => void
  /** Manually mark a node as performed now (arms its timer). */
  fireNode: (nodeId: string) => void
  /** Move the "current" pointer to a node (e.g. answering a decision) — no fire. */
  focus: (nodeId: string) => void
  toggleDone: (nodeId: string) => void
  dismissNotification: (id: string) => void
}

export function useProtocolEngine(): ProtocolEngine {
  const [settings, updateSettings] = useProtocolSettings()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [runtimes, setRuntimes] = useState<Record<string, NodeRuntime>>({})
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<ProtocolNotification[]>([])
  const [now, setNow] = useState(() => Date.now())

  const activeProtocol = useMemo(() => getProtocol(activeId), [activeId])

  // Latest-state refs for the stable callbacks + interval tick.
  const settingsRef = useRef(settings)
  const activeIdRef = useRef(activeId)
  const runtimesRef = useRef(runtimes)
  useEffect(() => {
    settingsRef.current = settings
    activeIdRef.current = activeId
    runtimesRef.current = runtimes
  })
  const notifiedForRef = useRef<Record<string, number>>({})

  const notify = useCallback((n: Omit<ProtocolNotification, 'id' | 'ts'>) => {
    const full: ProtocolNotification = { ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now() }
    // Chronological log for the timeline strip (oldest→newest), capped.
    setNotifications((prev) => [...prev, full].slice(-40))
    if (settingsRef.current.sound && (n.kind === 'due' || n.kind === 'overdue')) beep(n.kind === 'overdue')
    if (settingsRef.current.browserNotify && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(full.title, { body: full.body }) } catch { /* ignore */ }
    }
  }, [])

  const activate = useCallback((protocol: Protocol, viaVoice: boolean) => {
    setActiveId(protocol.id)
    setRuntimes(Object.fromEntries(protocol.nodes.map((n) => [n.id, emptyRuntime()])))
    setActiveNodeId(protocol.entry)
    setNotifications([]) // fresh timeline per protocol run
    notifiedForRef.current = {}
    notify({ kind: 'protocol', title: viaVoice ? `זוהה פרוטוקול: ${protocol.name}` : `פרוטוקול נטען: ${protocol.name}` })
  }, [notify])

  const fire = useCallback((protocol: Protocol, node: ProtocolNode) => {
    const ts = Date.now()
    setRuntimes((prev) => ({
      ...prev,
      [node.id]: {
        firedCount: (prev[node.id]?.firedCount ?? 0) + 1,
        lastFiredAt: ts,
        done: prev[node.id]?.done ?? false,
      },
    }))
    setActiveNodeId(node.id)
    delete notifiedForRef.current[node.id] // new firing → next due may re-notify
    notify({ kind: 'info', title: `נרשם: ${node.title}`, body: protocol.name })
  }, [notify])

  // ── Stable transcript feed ──────────────────────────────────────────────────
  const pushSegment = useCallback((text: string) => {
    if (!text || !text.trim()) return
    const norm = normalizeHe(text)

    if (!activeIdRef.current) {
      if (!settingsRef.current.autoDetect) return
      const hit = PROTOCOLS.find((p) => matchesAny(norm, p.triggers))
      if (hit) activate(hit, true)
      return
    }

    const protocol = getProtocol(activeIdRef.current)
    if (!protocol) return
    for (const node of protocol.nodes) {
      if (node.detect && matchesAny(norm, node.detect)) fire(protocol, node)
    }
  }, [activate, fire])

  const loadProtocol = useCallback((id: string) => {
    const p = getProtocol(id)
    if (p) activate(p, false)
  }, [activate])

  const unload = useCallback(() => {
    setActiveId(null)
    setRuntimes({})
    setActiveNodeId(null)
    setNotifications([])
    notifiedForRef.current = {}
  }, [])

  const fireNode = useCallback((nodeId: string) => {
    const protocol = getProtocol(activeIdRef.current)
    const node = protocol?.nodes.find((n) => n.id === nodeId)
    if (protocol && node) fire(protocol, node)
  }, [fire])

  const focus = useCallback((nodeId: string) => setActiveNodeId(nodeId), [])

  const toggleDone = useCallback((nodeId: string) => {
    setRuntimes((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? emptyRuntime()), done: !(prev[nodeId]?.done ?? false) },
    }))
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Prime audio on the first user interaction so timer beeps can play later.
  useEffect(() => {
    const h = () => unlockAudio()
    window.addEventListener('pointerdown', h, { once: true })
    window.addEventListener('keydown', h, { once: true })
    return () => {
      window.removeEventListener('pointerdown', h)
      window.removeEventListener('keydown', h)
    }
  }, [])

  // OS-notification permission when enabled.
  useEffect(() => {
    if (settings.browserNotify && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [settings.browserNotify])

  // ── Tick: advance `now`, fire due/overdue notifications once per cycle ──
  useEffect(() => {
    if (!activeProtocol) return
    const tick = () => {
      const t = Date.now()
      setNow(t)
      for (const node of activeProtocol.nodes) {
        if (!node.timer) continue
        const rt = runtimesRef.current[node.id] ?? emptyRuntime()
        const view = computeTimerView(node, rt, t)
        if ((view.status === 'due' || view.status === 'overdue') && rt.lastFiredAt != null) {
          const dueAt = rt.lastFiredAt + node.timer.interval_ms
          if (notifiedForRef.current[node.id] !== dueAt) {
            notifiedForRef.current[node.id] = dueAt
            notify({
              kind: view.status === 'overdue' ? 'overdue' : 'due',
              title: view.status === 'overdue' ? `${node.timer.label ?? node.title} — באיחור` : `${node.timer.label ?? node.title} — עכשיו`,
              body: activeProtocol.name,
            })
          }
        }
      }
    }
    tick()
    const h = setInterval(tick, TICK_MS)
    return () => clearInterval(h)
  }, [activeProtocol, notify])

  const timerViews = useMemo(() => {
    const out: Record<string, TimerView> = {}
    if (!activeProtocol) return out
    for (const node of activeProtocol.nodes) {
      if (node.timer) out[node.id] = computeTimerView(node, runtimes[node.id] ?? emptyRuntime(), now)
    }
    return out
  }, [activeProtocol, runtimes, now])

  return {
    activeProtocol,
    available: PROTOCOLS,
    runtimes,
    timerViews,
    activeNodeId,
    notifications,
    now,
    settings,
    updateSettings,
    pushSegment,
    loadProtocol,
    unload,
    fireNode,
    focus,
    toggleDone,
    dismissNotification,
  }
}
