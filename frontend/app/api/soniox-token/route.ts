import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch('https://api.soniox.com/v1/auth/temporary-api-key', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SONIOX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usage_type: 'transcribe_websocket',
      expires_in_seconds: 60,
      single_use: true,
      max_session_duration_seconds: 7200,
      client_reference_id: user.id,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Soniox token error', res.status, text)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 502 })
  }

  const { api_key } = await res.json() as { api_key: string }
  return NextResponse.json({ api_key })
}
