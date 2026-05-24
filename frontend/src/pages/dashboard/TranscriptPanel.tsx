import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Stethoscope, Activity, Syringe, Pill, HeartPulse,
  Brain, Thermometer, Microscope,
  Mic, MicOff, Pause, Play, Square,
  Wifi, WifiOff, Loader2, AlertCircle, Users,
} from 'lucide-react'
import { useTranscript } from './transcript/useTranscript'
import { SpeakerPickerPopover } from './transcript/SpeakerPickerPopover'
import { EnrollmentModal } from './transcript/EnrollmentModal'
import { staffById, unknownSpeaker } from './transcript/staffDb'
import type { TranscriptSegment, ConnectionState, StaffMember } from './transcript/types'

const API_KEY = import.meta.env.VITE_SONIOX_API_KEY ?? ''

// ── Mock preview data (shown until a live session starts) ─────────────────────

const MOCK_SEGMENTS: TranscriptSegment[] = [
  { id: 'm1', token: 'S5', start_ms: 67262000, is_final: true, words: [], text: 'גבר 52, תאונת דרכים, חבלה בחזה ובבטן. GCS 9. לחץ דם 80/50, דופק 130.' },
  { id: 'm2', token: 'S1', start_ms: 67278000, is_final: true, words: [], text: 'מתחילים פרוטוקול טראומה — כולם לתפקידים.' },
  { id: 'm3', token: 'S3', start_ms: 67295000, is_final: true, words: [], text: 'מוכן. מתחיל RSI — Ketamine 100mg ו-Succinylcholine 140mg.' },
  { id: 'm4', token: 'S2', start_ms: 67330000, is_final: true, words: [], text: 'שני עירויים רחבים פתוחים. מתחיל עירוי מסיבי.' },
  { id: 'm5', token: 'S4', start_ms: 67385000, is_final: true, words: [], text: 'הכירורג בדרך, 3 דקות. SpO₂ 92% — מעלה חמצן.' },
  { id: 'm6', token: 'S3', start_ms: 67408000, is_final: true, words: [], text: 'אינטובציה הושלמה. צינור 8.0 בעומק 22 ס"מ. SpO₂ עולה ל-97%.' },
  { id: 'm7', token: 'S2', start_ms: 67441000, is_final: true, words: [], text: 'TXA 1g ניתן. לחץ דם 95/60 — משתפר.' },
  { id: 'm8', token: 'S1', start_ms: 67470000, is_final: true, words: [], text: 'טוב מאוד. מנטרים רציף. מוכנים להעברה לניתוח.' },
]

// Pre-mapped so mock data looks identified right away
const MOCK_SPEAKER_MAP = new Map<string, string>([
  ['S1', 'cohen'], ['S2', 'katz'], ['S3', 'stern'], ['S4', 'levi'], ['S5', 'ben'],
])

// ── Background ────────────────────────────────────────────────────────────────

const BG_ICONS = [
  { Icon: Stethoscope,  top: '6%',  left: '5%',  rotate: -15, size: 48, opacity: 0.045 },
  { Icon: HeartPulse,   top: '18%', left: '82%', rotate: 8,   size: 40, opacity: 0.04  },
  { Icon: Activity,     top: '38%', left: '10%', rotate: 5,   size: 36, opacity: 0.035 },
  { Icon: Syringe,      top: '55%', left: '88%', rotate: -30, size: 44, opacity: 0.04  },
  { Icon: Pill,         top: '72%', left: '4%',  rotate: 20,  size: 32, opacity: 0.04  },
  { Icon: Brain,        top: '82%', left: '75%', rotate: -10, size: 42, opacity: 0.038 },
  { Icon: Thermometer,  top: '12%', left: '50%', rotate: 0,   size: 30, opacity: 0.03  },
  { Icon: Microscope,   top: '62%', left: '45%', rotate: 12,  size: 38, opacity: 0.035 },
] as const

function MedicalBackground() {
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="ecg" x="0" y="0" width="200" height="80" patternUnits="userSpaceOnUse">
            <path d="M0,40 L30,40 L35,36 L40,40 L55,40 L60,10 L65,62 L70,40 L80,40 L85,32 L90,40 L200,40"
              fill="none" stroke="#c15f3c" strokeWidth="1.2" opacity="0.07" />
          </pattern>
          <pattern id="cross" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.04" fill="#c15f3c">
              <rect x="34" y="26" width="12" height="28" rx="2" />
              <rect x="26" y="34" width="28" height="12" rx="2" />
            </g>
          </pattern>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.2" fill="#c15f3c" opacity="0.05" />
          </pattern>
          <radialGradient id="glow" cx="15%" cy="10%" r="40%">
            <stop offset="0%" stopColor="#c15f3c" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#c15f3c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect width="100%" height="100%" fill="url(#cross)" />
        {[0, 1, 2, 3].map(i => (
          <rect key={i} y={`${i * 25}%`} width="100%" height="25%" fill="url(#ecg)" />
        ))}
        <rect width="100%" height="100%" fill="url(#glow)" />
      </svg>
      {BG_ICONS.map(({ Icon, top, left, rotate, size, opacity }, i) => (
        <div key={i} className="absolute pointer-events-none text-[#c15f3c]"
          style={{ top, left, opacity, transform: `rotate(${rotate}deg)` }} aria-hidden>
          <Icon size={size} />
        </div>
      ))}
    </>
  )
}

// ── Small atoms ───────────────────────────────────────────────────────────────

function LiveDot({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

function AudioLevel({ level = 0 }: { level?: number }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0.2, 0.4, 0.6, 0.8, 1].map((thresh, i) => (
        <div key={i} className="w-0.75 rounded-sm transition-all duration-75"
          style={{
            height: `${40 + i * 14}%`,
            background: level >= thresh ? '#10b981' : '#d1d5db',
            opacity: level >= thresh ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const cfg = {
    idle:       { Icon: WifiOff,     label: 'מנותק',  color: '#9ca3af' },
    connecting: { Icon: Loader2,     label: 'מתחבר…', color: '#f59e0b' },
    live:       { Icon: Wifi,        label: 'חי',     color: '#10b981' },
    paused:     { Icon: Pause,       label: 'מושהה',  color: '#6366f1' },
    error:      { Icon: AlertCircle, label: 'שגיאה',  color: '#ef4444' },
  }[state]
  const { Icon } = cfg
  return (
    <div className="flex items-center gap-1.5" style={{ color: cfg.color }}>
      <Icon size={13} className={state === 'connecting' ? 'animate-spin' : undefined} />
      <span className="text-[10px] font-medium">{cfg.label}</span>
    </div>
  )
}

// ── TranscriptHeader ──────────────────────────────────────────────────────────

function TranscriptHeader({
  connectionState, audioLevel, speakerCount, onRollCall,
}: {
  connectionState: ConnectionState
  audioLevel: number
  speakerCount: number
  onRollCall: () => void
}) {
  return (
    <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-[#ddd8d0] dark:border-[#2e2c29] shrink-0 bg-[#f4f3ee]/80 dark:bg-[#1a1a18]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <LiveDot active={connectionState === 'live'} />
        <ConnectionBadge state={connectionState} />
        <div className="w-px h-3 bg-[#ddd8d0] dark:bg-[#3a3835]" />
        <AudioLevel level={audioLevel} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRollCall}
          className="flex items-center gap-1.5 text-[10px] text-[#8a8680] hover:text-[#c15f3c] transition-colors"
          title="Roll call — זהה דוברים"
        >
          <Users size={13} />
          <span className="hidden sm:inline">{speakerCount} דוברים</span>
        </button>
      </div>
    </div>
  )
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mx-4 my-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <AlertCircle size={14} className="text-red-500 shrink-0" />
      <p className="text-[11px] text-red-600 dark:text-red-400 flex-1" dir="rtl">{message}</p>
      <button onClick={onRetry} className="text-[10px] text-red-500 underline shrink-0">נסה שוב</button>
    </div>
  )
}

// ── Bubble ────────────────────────────────────────────────────────────────────

function Bubble({
  segment, speaker, onAvatarClick,
}: {
  segment: TranscriptSegment
  speaker: StaffMember
  onAvatarClick: (token: string, rect: DOMRect) => void
}) {
  const avatarRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      {/* Avatar — clickable to open speaker picker */}
      <button
        ref={avatarRef}
        onClick={() => {
          const rect = avatarRef.current?.getBoundingClientRect()
          if (rect) onAvatarClick(segment.token, rect)
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm hover:ring-2 hover:ring-offset-1 transition-all"
        style={{ background: speaker.color }}
        title={`שנה זיהוי עבור ${speaker.name}`}
      >
        {speaker.initials}
      </button>

      <div className="flex flex-col items-end gap-0.5 max-w-[78%]">
        <div className="flex items-baseline gap-1.5 px-1 flex-row-reverse">
          <span className="text-[10px] font-semibold" style={{ color: speaker.color }}>{speaker.name}</span>
          <span className="text-[9px] text-[#b1ada1]">{speaker.role}</span>
        </div>

        <div className={[
          'px-3 py-2 rounded-2xl rounded-br-sm shadow-sm',
          segment.is_final
            ? 'bg-white dark:bg-[#252420] border border-[#d8d2c8] dark:border-[#3a3835]'
            : 'bg-[#fdf8f3] dark:bg-[#2a2824] border border-dashed border-[#d8d2c8] dark:border-[#4a4640]',
        ].join(' ')}>
          <p className={[
            'text-[13px] leading-relaxed',
            segment.is_final ? 'text-[#1e1e1c] dark:text-[#e8e5e0]' : 'text-[#6b6662] dark:text-[#8a8680] italic',
          ].join(' ')} dir="rtl">
            {segment.text}
            {!segment.is_final && (
              <span className="inline-block w-1 h-3 ml-1 bg-current animate-pulse rounded-sm align-middle" />
            )}
          </p>
        </div>

        <span className="text-[9px] text-[#b1ada1] px-1 font-mono">
          {msToTime(segment.start_ms)}
        </span>
      </div>
    </div>
  )
}

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map(n => n.toString().padStart(2, '0')).join(':')
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 select-none">
      <Mic size={32} className="text-[#c15f3c]" />
      <p className="text-[12px] text-[#7a7670]" dir="rtl">ממתין לתחילת שיחה…</p>
    </div>
  )
}

// ── SessionControls ───────────────────────────────────────────────────────────

function SessionControls({
  connectionState, onStart, onPause, onResume, onStop,
}: {
  connectionState: ConnectionState
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}) {
  const isLive    = connectionState === 'live'
  const isPaused  = connectionState === 'paused'
  const isIdle    = connectionState === 'idle' || connectionState === 'error'

  return (
    <div className="relative flex items-center justify-center gap-3 px-4 py-3 border-t border-[#ddd8d0] dark:border-[#2e2c29] shrink-0 bg-[#f4f3ee]/80 dark:bg-[#1a1a18]/80 backdrop-blur-sm">
      {isIdle && (
        <button onClick={onStart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c15f3c] text-white text-[11px] font-medium shadow-sm hover:bg-[#a94e30] transition-colors">
          <Mic size={12} />
          התחל הקלטה
        </button>
      )}
      {isPaused && (
        <button onClick={onResume}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c15f3c] text-white text-[11px] font-medium shadow-sm hover:bg-[#a94e30] transition-colors">
          <Play size={12} />
          המשך
        </button>
      )}
      {isLive && (
        <button onClick={onPause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6366f1] text-white text-[11px] font-medium shadow-sm hover:bg-[#4f46e5] transition-colors">
          <Pause size={12} />
          השהה
        </button>
      )}
      {(isLive || isPaused) && (
        <button onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#252420] border border-[#d8d2c8] dark:border-[#3a3835] text-[#4a4640] dark:text-[#c0bdb8] text-[11px] font-medium shadow-sm hover:bg-[#f0ece6] dark:hover:bg-[#2e2c29] transition-colors">
          <Square size={12} />
          עצור
        </button>
      )}
      {connectionState === 'connecting' && (
        <div className="flex items-center gap-1.5 text-[#f59e0b] text-[11px]">
          <Loader2 size={13} className="animate-spin" />
          מתחבר…
        </div>
      )}
      {isLive && (
        <button className="absolute left-4 text-[#b1ada1] hover:text-[#6b6662] transition-colors" title="השתק מיקרופון">
          <MicOff size={14} />
        </button>
      )}
    </div>
  )
}

// ── TranscriptPanel ───────────────────────────────────────────────────────────

export function TranscriptPanel() {
  const t = useTranscript(API_KEY)

  // Speaker picker state
  const [pickerToken, setPickerToken]     = useState<string | null>(null)
  const [pickerAnchor, setPickerAnchor]   = useState<DOMRect | null>(null)

  // Enrollment modal trigger
  const [showEnrollment, setShowEnrollment] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [t.segments.length])

  const openPicker = useCallback((token: string, rect: DOMRect) => {
    setPickerToken(token)
    setPickerAnchor(rect)
  }, [])

  const isLive = t.connectionState !== 'idle' && t.connectionState !== 'error'

  // While idle, show pre-mapped mock data so the panel never looks empty
  const displaySegments = isLive
    ? (t.partialSegment ? [...t.segments, t.partialSegment] : t.segments)
    : MOCK_SEGMENTS

  const displaySpeakerMap = isLive ? t.speakerMap : MOCK_SPEAKER_MAP

  const resolveSpeakerFrom = useCallback((map: Map<string, string>, token: string): StaffMember => {
    const staffId = map.get(token)
    return staffId ? (staffById(staffId) ?? unknownSpeaker(token)) : unknownSpeaker(token)
  }, [])

  const handleStartSession = () => {
    t.startEnrollment(5)
    setShowEnrollment(true)
    t.connect()
  }

  const handleEnrollmentFinish = () => {
    setShowEnrollment(false)
    t.finishEnrollment()
  }

  const handleEnrollmentSkip = () => {
    setShowEnrollment(false)
    t.skipEnrollment()
  }

  const handleRollCall = () => {
    t.startEnrollment(5)
    setShowEnrollment(true)
  }

  const uniqueTokens = [...new Set(displaySegments.map(s => s.token))]

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="absolute inset-0 bg-[#f4f3ee] dark:bg-[#1a1a18]" />
      <MedicalBackground />

      <TranscriptHeader
        connectionState={t.connectionState}
        audioLevel={t.audioLevel}
        speakerCount={uniqueTokens.length}
        onRollCall={handleRollCall}
      />

      {t.errorMessage && (
        <ErrorBanner message={t.errorMessage} onRetry={t.connect} />
      )}

      {/* Message list */}
      <div className={['relative flex-1 overflow-y-auto px-4 py-4 space-y-4', !isLive && 'opacity-60'].filter(Boolean).join(' ')}>
        {displaySegments.map(seg => (
          <Bubble
            key={seg.id}
            segment={seg}
            speaker={resolveSpeakerFrom(displaySpeakerMap, seg.token)}
            onAvatarClick={openPicker}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="relative h-6 shrink-0 bg-linear-to-t from-[#f4f3ee] dark:from-[#1a1a18] to-transparent pointer-events-none" />

      <SessionControls
        connectionState={t.connectionState}
        onStart={handleStartSession}
        onPause={t.pause}
        onResume={t.resume}
        onStop={t.disconnect}
      />

      {/* Speaker picker popover */}
      {pickerToken && pickerAnchor && (
        <SpeakerPickerPopover
          token={pickerToken}
          currentStaffId={t.speakerMap.get(pickerToken) ?? null}
          onAssign={staffId => t.assignSpeaker(pickerToken, staffId)}
          onUnassign={() => t.unassignSpeaker(pickerToken)}
          onClose={() => { setPickerToken(null); setPickerAnchor(null) }}
          anchorRect={pickerAnchor}
        />
      )}

      {/* Enrollment modal */}
      {showEnrollment && (
        <EnrollmentModal
          slots={t.enrollmentSlots}
          currentIndex={t.currentSlotIndex}
          audioLevel={t.audioLevel}
          onNext={t.advanceEnrollmentSlot}
          onConfirmSlot={t.confirmEnrollmentSlot}
          onFinish={handleEnrollmentFinish}
          onSkip={handleEnrollmentSkip}
        />
      )}
    </div>
  )
}