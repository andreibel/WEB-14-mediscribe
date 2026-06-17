import { Mic, MicOff, Pause, Play, Square, Loader2 } from 'lucide-react'
import type { ConnectionState } from './types'

export function SessionControls({
  connectionState, onStart, onPause, onResume, onStop,
}: {
  connectionState: ConnectionState
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}) {
  const isLive   = connectionState === 'live'
  const isPaused = connectionState === 'paused'
  const isIdle   = connectionState === 'idle' || connectionState === 'error'

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
