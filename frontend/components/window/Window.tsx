import React, { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { IconBtn } from '../IconBtn'

// ─── Window ────────────────────────────────────────────────────────────

interface WindowProps {
  title?: string
  children?: React.ReactNode
  className?: string
  defaultMinimized?: boolean
}

export function Window({title = 'Panel', children, className = '', defaultMinimized = false,}: WindowProps) {
  const [minimized, setMinimized] = useState(defaultMinimized)
  const sizeClass = minimized ? 'flex-none w-9' : 'flex-1'

  return (
    <div
      className={[
        'flex flex-col rounded-xl overflow-hidden shadow-sm min-h-0',
        'border border-[#E8E2D9] bg-[#FFFEF9] dark:border-[#2E2A27] dark:bg-[#1C1917]',
        'transition-all duration-300 ease-in-out',
        sizeClass,
        className,
      ].join(' ')}
    >
      {minimized ? (
        <MinimizedStrip title={title} onRestore={() => setMinimized(false)} />
      ) : (
        <>
          <TitleBar title={title} onMinimize={() => setMinimized(true)} />
          <div className="flex-1 overflow-auto min-h-0">{children}</div>
        </>
      )}
    </div>
  )
}

// ─── TitleBar ─────────────────────────────────────────────────────────────────

function TitleBar({title, onMinimize}: {
  title: string
  onMinimize: () => void
}) {
  return (
    <div className="relative flex items-center px-3 py-2 select-none shrink-0 gap-2 bg-[#C15F3C] border-b border-[#E8E2D9] dark:bg-[#a04e31] dark:border-[#2E2A27]">
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-[#e8e5e0] pointer-events-none">{title}</span>
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <IconBtn onClick={onMinimize} label="Minimize" className="text-white/70 hover:text-white hover:bg-white/20">
          <Minus size={12} strokeWidth={2} />
        </IconBtn>
      </div>
    </div>
  )
}

// ─── MinimizedStrip ───────────────────────────────────────────────────────────

function MinimizedStrip({title, onRestore}: {
  title: string
  onRestore: () => void
}) {
  return (
    <div className="flex flex-col items-center w-full h-full select-none bg-[#c15f3c] dark:bg-[#a04e31]">
      <div className="flex flex-col items-center gap-1 pt-2 shrink-0">
        <IconBtn onClick={onRestore} label="Restore" className="text-white/70 hover:text-white hover:bg-white/20"><Plus size={12} strokeWidth={2} /></IconBtn>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden w-full cursor-pointer" onClick={onRestore}>
        <span className="text-[11px] font-medium text-[#e8e5e0] whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{title}</span>
      </div>
    </div>
  )
}