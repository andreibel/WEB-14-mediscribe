import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ConnectionState, TranscriptSegment } from './types'

// ── Correct Soniox endpoint & model ──────────────────────────────────────────
const SONIOX_WS_URL = 'wss://stt-rt.soniox.com/transcribe-websocket'
const SONIOX_MODEL  = 'stt-rt-v4'

// ── Soniox response shape ─────────────────────────────────────────────────────
type SonioxToken = {
  text: string
  is_final: boolean
  speaker?: string   // "S1", "S2" … only present when diarization enabled
  language?: string
}

type SonioxMessage = {
  tokens?: SonioxToken[]
  final_audio_proc_ms?: number
  total_audio_proc_ms?: number
  finished?: boolean
  error_code?: number
  error_message?: string
}

export type UseTranscriptReturn = {
  connectionState: ConnectionState
  errorMessage: string | null
  connect: () => Promise<void>
  disconnect: () => void
  pause: () => void
  resume: () => void
  segments: TranscriptSegment[]
  partialSegment: TranscriptSegment | null
  clearSegments: () => void
  // Per-token default identity (speaker_token → user_id), backed by session_speakers.
  speakerMap: Map<string, string>
  assignSpeaker: (token: string, userId: string) => void
  unassignSpeaker: (token: string) => void
  // Per-segment override (seq → user_id), backed by segment_speakers.
  segmentMap: Map<number, string>
  assignSegment: (seq: number, userId: string) => void
  unassignSegment: (seq: number) => void
  audioLevel: number
}

let segId = 0

export function useTranscript(
  sessionId: string,
  onSegmentFinalized?: (seg: TranscriptSegment) => void,
): UseTranscriptReturn {
  const supabase = useMemo(() => createClient(), [])

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [errorMessage, setErrorMessage]       = useState<string | null>(null)
  const [segments, setSegments]               = useState<TranscriptSegment[]>([])
  const [partialSegment, setPartialSegment]   = useState<TranscriptSegment | null>(null)
  const [speakerMap, setSpeakerMap]           = useState<Map<string, string>>(new Map())
  const [segmentMap, setSegmentMap]           = useState<Map<number, string>>(new Map())
  const [audioLevel, setAudioLevel]           = useState(0)

  const onSegFinalizedRef = useRef(onSegmentFinalized)
  useEffect(() => { onSegFinalizedRef.current = onSegmentFinalized }, [onSegmentFinalized])

  // ── Load any saved speaker attribution for this session ──────────────────────

  useEffect(() => {
    let cancelled = false
    supabase
      .from('session_speakers')
      .select('speaker_token, user_id')
      .eq('session_id', sessionId)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        setSpeakerMap(new Map(
          data.filter(r => r.user_id).map(r => [r.speaker_token as string, r.user_id as string]),
        ))
      })
    supabase
      .from('segment_speakers')
      .select('seq, user_id')
      .eq('session_id', sessionId)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        setSegmentMap(new Map(data.map(r => [Number(r.seq), r.user_id as string])))
      })
    return () => { cancelled = true }
  }, [sessionId, supabase])

  // ── Load previously saved transcript segments for this session ───────────────
  // Display-only: we rehydrate the bubbles (with their DB seq so per-segment
  // speaker overrides still resolve) but deliberately do NOT replay them through
  // onSegmentFinalized — that would re-run the protocol engine's timers/alerts
  // and re-trigger AI auto-fill on reload.
  useEffect(() => {
    let cancelled = false
    supabase
      .from('transcript_segments')
      .select('seq, speaker_token, text, start_ms')
      .eq('session_id', sessionId)
      .order('seq', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { console.error('transcript load failed', error); return }
        if (!data) return
        setSegments(data.map(r => ({
          id:        `db_${r.seq}`,
          seq:       Number(r.seq),
          token:     (r.speaker_token as string) ?? 'S?',
          text:      r.text as string,
          words:     [],
          start_ms:  Number(r.start_ms),
          is_final:  true,
        })))
      })
    return () => { cancelled = true }
  }, [sessionId, supabase])

  // ── Speaker mapping (token default) — mirrored to session_speakers ───────────

  const assignSpeaker = useCallback((token: string, userId: string) => {
    setSpeakerMap(prev => new Map(prev).set(token, userId))
    supabase
      .from('session_speakers')
      .upsert(
        { session_id: sessionId, speaker_token: token, user_id: userId },
        { onConflict: 'session_id,speaker_token' },
      )
      .then(({ error }) => { if (error) console.error('assign speaker failed', error) })
  }, [sessionId, supabase])

  const unassignSpeaker = useCallback((token: string) => {
    setSpeakerMap(prev => { const n = new Map(prev); n.delete(token); return n })
    supabase
      .from('session_speakers')
      .delete()
      .eq('session_id', sessionId)
      .eq('speaker_token', token)
      .then(({ error }) => { if (error) console.error('unassign speaker failed', error) })
  }, [sessionId, supabase])

  // ── Segment override — mirrored to segment_speakers ──────────────────────────

  const assignSegment = useCallback((seq: number, userId: string) => {
    setSegmentMap(prev => new Map(prev).set(seq, userId))
    supabase
      .from('segment_speakers')
      .upsert(
        { session_id: sessionId, seq, user_id: userId },
        { onConflict: 'session_id,seq' },
      )
      .then(({ error }) => { if (error) console.error('assign segment failed', error) })
  }, [sessionId, supabase])

  const unassignSegment = useCallback((seq: number) => {
    setSegmentMap(prev => { const n = new Map(prev); n.delete(seq); return n })
    supabase
      .from('segment_speakers')
      .delete()
      .eq('session_id', sessionId)
      .eq('seq', seq)
      .then(({ error }) => { if (error) console.error('unassign segment failed', error) })
  }, [sessionId, supabase])

  const wsRef          = useRef<WebSocket | null>(null)
  const recorderRef    = useRef<MediaRecorder | null>(null)
  const streamRef      = useRef<MediaStream | null>(null)
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const analyserRef    = useRef<AnalyserNode | null>(null)
  const animFrameRef   = useRef<number>(0)
  const pausedRef      = useRef(false)
  const sessionStartRef = useRef<number>(0)

  // Buffer final tokens per speaker; flush after FLUSH_AFTER_MS of silence
  const FLUSH_AFTER_MS = 5000
  type PendingBuf = { token: string; text: string; start_ms: number; timer: ReturnType<typeof setTimeout> }
  const pendingRef = useRef<Map<string, PendingBuf>>(new Map())

  // ── Audio level meter ──────────────────────────────────────────────────────

  const startLevelMeter = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser
    source.connect(analyser)

    const buf = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteTimeDomainData(buf)
      let sum = 0
      for (const v of buf) sum += Math.abs(v - 128)
      setAudioLevel(Math.min(1, (sum / buf.length) / 40))
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Persist a finalized segment, then attach its DB seq to the bubble ────────

  const persistSegment = useCallback((seg: TranscriptSegment) => {
    supabase
      .from('transcript_segments')
      .insert({
        session_id:    sessionId,
        speaker_token: seg.token,
        text:          seg.text,
        start_ms:      seg.start_ms,
      })
      .select('seq')
      .single()
      .then(({ data, error }) => {
        if (error) { console.error('segment save failed', error); return }
        if (data) {
          const seq = Number(data.seq)
          // Tag the in-memory bubble so per-segment override can target this row.
          setSegments(prev => prev.map(s => (s.id === seg.id ? { ...s, seq } : s)))
        }
      })
  }, [sessionId, supabase])

  // ── Flush a pending buffer entry into a final segment ─────────────────────

  const flushPending = useCallback((speakerTok: string) => {
    const buf = pendingRef.current.get(speakerTok)
    if (!buf || !buf.text.trim()) { pendingRef.current.delete(speakerTok); return }
    pendingRef.current.delete(speakerTok)
    const newSeg: TranscriptSegment = {
      id: String(++segId), token: buf.token, text: buf.text.trim(), words: [], start_ms: buf.start_ms, is_final: true,
    }
    setSegments(prev => [
      ...prev.filter(s => s.id !== `buf_${speakerTok}`),
      newSeg,
    ])
    persistSegment(newSeg)
    onSegFinalizedRef.current?.(newSeg)
  }, [persistSegment])

  // ── Token → segment grouping (buffered) ───────────────────────────────────

  const handleTokens = useCallback((tokens: SonioxToken[], audioMs: number) => {
    void audioMs
    if (!tokens.length) return

    const nowMs         = Date.now() - sessionStartRef.current
    const finalTokens   = tokens.filter(t => t.is_final)
    const partialTokens = tokens.filter(t => !t.is_final)

    // ── Handle final tokens: accumulate in per-speaker buffer ──────────────
    if (finalTokens.length > 0) {
      // Group consecutive final tokens by speaker
      const groups: SonioxToken[][] = []
      let cur: SonioxToken[] = [finalTokens[0]]
      for (let i = 1; i < finalTokens.length; i++) {
        const tok = finalTokens[i]
        if ((tok.speaker ?? '') === (cur[0].speaker ?? '')) {
          cur.push(tok)
        } else {
          groups.push(cur); cur = [tok]
        }
      }
      groups.push(cur)

      for (const group of groups) {
        const speakerTok = group[0].speaker ?? 'S?'
        const newText    = group.map(t => t.text).join('')
        if (!newText.trim()) continue

        const existing = pendingRef.current.get(speakerTok)

        if (existing) {
          // Same speaker — extend buffer, reset flush timer
          clearTimeout(existing.timer)
          const timer = setTimeout(() => flushPending(speakerTok), FLUSH_AFTER_MS)
          pendingRef.current.set(speakerTok, { ...existing, text: existing.text + newText, timer })
        } else {
          // New speaker — flush whoever was speaking before (speaker change = natural break)
          for (const [tok] of pendingRef.current) {
            if (tok !== speakerTok) {
              clearTimeout(pendingRef.current.get(tok)!.timer)
              flushPending(tok)
            }
          }
          const timer = setTimeout(() => flushPending(speakerTok), FLUSH_AFTER_MS)
          pendingRef.current.set(speakerTok, { token: speakerTok, text: newText, start_ms: nowMs, timer })
        }

        // Live preview of the in-progress buffer (shown as an "is_final" bubble that keeps growing)
        const buf = pendingRef.current.get(speakerTok)
        if (buf) {
          setSegments(prev => {
            const last = prev[prev.length - 1]
            if (last && last.token === speakerTok && last.id === `buf_${speakerTok}`) {
              return [...prev.slice(0, -1), { ...last, text: buf.text.trim() }]
            }
            return [...prev, { id: `buf_${speakerTok}`, token: speakerTok, text: buf.text.trim(), words: [], start_ms: buf.start_ms, is_final: false }]
          })
        }
      }
    }

    // ── Partial tokens: shown as blinking preview inside the live bubble ────
    if (partialTokens.length > 0) {
      const speakerTok = partialTokens[0].speaker ?? 'S?'
      const text = partialTokens.map(t => t.text).join('')
      if (text.trim()) {
        setPartialSegment({ id: 'partial', token: speakerTok, text, words: [], start_ms: nowMs, is_final: false })
      }
    } else {
      setPartialSegment(null)
    }
  }, [flushPending])

  // ── Connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    try {
      setConnectionState('connecting')
      setErrorMessage(null)

      const tokenRes = await fetch('/api/soniox-token', { method: 'POST' })
      if (!tokenRes.ok) {
        setErrorMessage('לא ניתן לאמת מול שרת — נסה שוב')
        setConnectionState('error')
        return
      }
      const { api_key: apiKey } = await tokenRes.json() as { api_key: string }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      startLevelMeter(stream)
      sessionStartRef.current = Date.now()

      const ws = new WebSocket(SONIOX_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        // Send config as first message
        ws.send(JSON.stringify({
          api_key: apiKey,
          model: SONIOX_MODEL,
          audio_format: 'auto',             // auto-detect WebM/Opus from MediaRecorder
          enable_speaker_diarization: true,
        }))

        // Use MediaRecorder — no manual PCM conversion needed
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'

        const recorder = new MediaRecorder(stream, { mimeType })
        recorderRef.current = recorder

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN && !pausedRef.current) {
            ws.send(e.data)
          }
        }

        recorder.start(100)   // 100ms chunks → ~10 updates/sec
        setConnectionState('live')
      }

      ws.onmessage = (event) => {
        try {
          const msg: SonioxMessage = JSON.parse(event.data as string)

          if (msg.error_code || msg.error_message) {
            setErrorMessage(msg.error_message ?? `Error ${msg.error_code}`)
            setConnectionState('error')
            return
          }

          if (msg.tokens?.length) {
            handleTokens(msg.tokens, msg.total_audio_proc_ms ?? 0)
          }
        } catch { /* ignore malformed frames */ }
      }

      ws.onerror = (e) => {
        console.error('Soniox WS error', e)
        setErrorMessage('חיבור ל-Soniox נכשל')
        setConnectionState('error')
      }

      ws.onclose = (e) => {
        console.log('Soniox WS closed', e.code, e.reason)
        setConnectionState(prev => prev === 'live' ? 'idle' : prev)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שגיאה לא ידועה'
      setErrorMessage(msg)
      setConnectionState('error')
    }
  }, [handleTokens, startLevelMeter])

  // ── Disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    // Flush any buffered text before closing
    for (const [tok, buf] of pendingRef.current) {
      clearTimeout(buf.timer)
      flushPending(tok)
    }
    cancelAnimationFrame(animFrameRef.current)
    recorderRef.current?.stop()
    audioCtxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    wsRef.current?.close()
    recorderRef.current = null
    setConnectionState('idle')
    setAudioLevel(0)
    pausedRef.current = false
  }, [flushPending])

  const pause = useCallback(() => {
    pausedRef.current = true
    recorderRef.current?.pause()
    setConnectionState('paused')
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    recorderRef.current?.resume()
    setConnectionState('live')
  }, [])

  const clearSegments = useCallback(() => { setSegments([]); setPartialSegment(null) }, [])

  useEffect(() => () => disconnect(), [disconnect])

  return {
    connectionState, errorMessage,
    connect, disconnect, pause, resume,
    segments, partialSegment, clearSegments,
    speakerMap, assignSpeaker, unassignSpeaker,
    segmentMap, assignSegment, unassignSegment,
    audioLevel,
  }
}
