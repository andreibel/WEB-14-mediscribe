import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StaffMember } from './types'

/** Raw row shape from public.users (only the columns we read). */
type UserRow = {
  id: string
  name: string
  name_he: string
  name_en: string | null
  role: string
  role_display: string | null
  initials: string
  color: string
}

function toStaff(u: UserRow): StaffMember {
  return {
    id: u.id,
    name: u.name,
    nameHe: u.name_he,
    nameEn: u.name_en ?? undefined,
    role: u.role_display ?? u.role,
    initials: u.initials,
    color: u.color,
  }
}

/**
 * Active staff who may appear in the trauma-room transcript.
 * Fetches `users` where active = true AND can_appear_in_transcript = true
 * (i.e. on-roster and not soft-deleted). Used to populate the speaker picker.
 */
export function useStaff() {
  const supabase = useMemo(() => createClient(), [])
  const [staff, setStaff] = useState<StaffMember[]>([])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('users')
      .select('id, name, name_he, name_en, role, role_display, initials, color')
      .eq('active', true)
      .eq('can_appear_in_transcript', true)
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { console.error('staff load failed', error); return }
        setStaff((data as UserRow[] ?? []).map(toStaff))
      })
    return () => { cancelled = true }
  }, [supabase])

  const byId = useCallback(
    (id: string | null | undefined) => (id ? staff.find(s => s.id === id) : undefined),
    [staff],
  )

  return { staff, byId }
}
