import React, { useState } from 'react'
import { GroupContext } from './WindowContext'

interface WindowGroupProps {
  children: React.ReactNode
  className?: string
}

export function WindowGroup({ children, className = '' }: WindowGroupProps) {
  const [maximizedId, setMaximizedId] = useState<string | null>(null)

  return (
    <GroupContext.Provider value={{ maximizedId, setMaximizedId }}>
      <div className={['flex flex-row gap-2 w-full h-full min-h-0 min-w-0', className].join(' ')}>
        {children}
      </div>
    </GroupContext.Provider>
  )
}
