import { useRef } from 'react'
import type { TranscriptSegment, StaffMember } from './types'

export function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map(n => n.toString().padStart(2, '0')).join(':')
}

export function Bubble({
  segment, speaker, onAvatarClick,
}: {
  segment: TranscriptSegment
  speaker: StaffMember
  onAvatarClick: (segment: TranscriptSegment, rect: DOMRect) => void
}) {
  const avatarRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      <button
        ref={avatarRef}
        onClick={() => {
          const rect = avatarRef.current?.getBoundingClientRect()
          if (rect) onAvatarClick(segment, rect)
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
