import React, { useContext, useId, useState } from 'react'
import { Minus, Maximize2, Minimize2 } from 'lucide-react'
import { IconBtn } from '../IconBtn'
import { GroupContext } from './WindowContext'

// ─── Window ────────────────────────────────────────────────────────────

interface WindowProps {
  title?: string
  children?: React.ReactNode
  className?: string
  defaultMinimized?: boolean
}

export function Window({
  title = 'Panel',
  children,
  className = '',
  defaultMinimized = false,
}: WindowProps) {
  const id = useId()
  const group = useContext(GroupContext)
  const [minimized, setMinimized] = useState(defaultMinimized)

  const isMaximized = group?.maximizedId === id // check if I am the maximed
  const otherIsMaximized = group?.maximizedId !== null && !isMaximized // check if some other window is maximized
  const effectivelyMinimized = minimized || otherIsMaximized // someone else is maximized, so I have to look minimized

  function handleMinimize() {
    if (isMaximized)  group?.setMaximizedId(null)
    setMinimized(v => !v)
  }

  function handleMaximize() {
    if (isMaximized) {
      group?.setMaximizedId(null)
    } else {
      group?.setMaximizedId(id)
      setMinimized(false)
    }
  }

  function handleRestore() {
    if (otherIsMaximized) {
      group?.setMaximizedId(null)
    } else {
      setMinimized(false)
    }
  }

  const sizeClass = isMaximized
    ? 'flex-1'
    : effectivelyMinimized
      ? 'flex-none w-9'
      : 'flex-1'

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
      {effectivelyMinimized ? (
        <MinimizedStrip title={title} onRestore={handleRestore} onMaximize={handleMaximize} />
      ) : (
        <>
          <TitleBar
            title={title}
            isMaximized={isMaximized}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
          <div className="flex-1 overflow-auto min-h-0">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

// ─── TitleBar ─────────────────────────────────────────────────────────────────

function TitleBar({
  title,
  isMaximized,
  onMinimize,
  onMaximize,
}: {
  title: string
  isMaximized: boolean
  onMinimize: () => void
  onMaximize: () => void
}) {
  return (
    <div className="relative flex items-center px-3 py-2 select-none shrink-0 gap-2 bg-[#C15F3C] border-b border-[#E8E2D9] dark:bg-[#a04e31] dark:border-[#2E2A27]">
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-[#e8e5e0] pointer-events-none">
        {title}
      </span>
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <IconBtn onClick={onMinimize} label="Minimize" className="text-white/70 hover:text-white hover:bg-white/20">
          <Minus size={12} strokeWidth={2} />
        </IconBtn>
        <IconBtn onClick={onMaximize} label={isMaximized ? 'Restore' : 'Maximize'} className="text-white/70 hover:text-white hover:bg-white/20">
          {isMaximized ? <Minimize2 size={12} strokeWidth={2} /> : <Maximize2 size={12} strokeWidth={2} />}
        </IconBtn>
      </div>
    </div>
  )
}

// ─── MinimizedStrip ───────────────────────────────────────────────────────────

function MinimizedStrip({
  title,
  onRestore,
  onMaximize,
}: {
  title: string
  onRestore: () => void
  onMaximize: () => void
}) {
  return (
    <div className="flex flex-col items-center w-full h-full select-none bg-[#c15f3c] dark:bg-[#a04e31]">
      <div className="flex flex-col items-center gap-1 pt-2 shrink-0">
        <IconBtn onClick={onRestore} label="Restore" className="text-white/70 hover:text-white hover:bg-white/20">
          <Minus size={12} strokeWidth={2} />
        </IconBtn>
        <IconBtn onClick={onMaximize} label="Maximize" className="text-white/70 hover:text-white hover:bg-white/20">
          <Maximize2 size={12} strokeWidth={2} />
        </IconBtn>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden w-full cursor-pointer" onClick={onRestore}>
        <span
          className="text-[11px] font-medium text-[#e8e5e0] whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {title}
        </span>
      </div>
    </div>
  )
}
