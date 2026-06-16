import { Users } from 'lucide-react'
import { LiveDot, AudioLevel, ConnectionBadge } from './TranscriptAtoms'
import type { ConnectionState } from './types'

export function TranscriptHeader({
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
