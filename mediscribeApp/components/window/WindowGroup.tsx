import React from 'react'

interface WindowGroupProps {
  children: React.ReactNode
  className?: string
}

/**
 * Lays out its child <Window/>s in a flex row. Each window manages its own
 * minimized state independently — minimizing one lets the others expand to
 * fill the space, so no shared group state (context) is needed here.
 */
export function WindowGroup({ children, className = '' }: WindowGroupProps) {
  return (
    <div className={['flex flex-row gap-2 w-full h-full min-h-0 min-w-0', className].join(' ')}>
      {children}
    </div>
  )
}