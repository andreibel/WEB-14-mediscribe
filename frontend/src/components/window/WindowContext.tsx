import { createContext } from 'react'

export interface GroupCtx {
  maximizedId: string | null
  setMaximizedId: (id: string | null) => void
}

export const GroupContext = createContext<GroupCtx | null>(null)
