'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function NewSessionButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // RLS: created_by must equal auth.uid().
    const { data, error } = await supabase
      .from('sessions')
      .insert({ created_by: user.id })
      .select('id')
      .single()

    if (error || !data) {
      console.error('create session failed', error)
      setError('לא ניתן ליצור מפגש חדש')
      setLoading(false)
      return
    }

    router.push(`/session/${data.id}`)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={start}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C15F3C] text-white text-sm font-semibold shadow-sm hover:bg-[#a94e30] disabled:opacity-60 transition-colors"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> יוצר מפגש…</>
          : <><Plus size={16} /> מפגש חדש</>}
      </button>
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  )
}
