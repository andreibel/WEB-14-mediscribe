import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { MoHFormData } from '@/app/session/MoHForm/formSchema'
import type { TranscriptSegment } from '@/app/session/transcript/types'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `אתה עוזר רפואי שממלא טופס רישום וניטור החייאה (נספח ז, משרד הבריאות ישראל).

קולטים:
1. תמלול של שיחת הצוות הרפואי (עברית ואנגלית מעורבבות)
2. מצב נוכחי של הטופס כ-JSON

המשימה: עדכן את ה-JSON עם מידע חדש מהתמלול.

כללים:
- מלא שדות רק כאשר יש עדות ברורה בתמלול
- אל תמחק או תדרוס נתונים שכבר מולאו
- אל תמציא נתונים
- שדות boolean: true רק אם הוזכר במפורש
- שדות enum: השתמש אך ורק בערכים המותרים בסכמה
- שדות זמן: פורמט HH:MM
- שדות תאריך: פורמט DD/MM/YYYY
- החזר אך ורק את אובייקט ה-JSON המלא, ללא הסברים וללא markdown`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { segments, currentForm }: {
    segments: TranscriptSegment[]
    currentForm: MoHFormData
  } = await req.json()

  const transcript = segments
    .filter(s => s.is_final && s.text.trim())
    .map(s => `[${s.token}] ${s.text.trim()}`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `מצב נוכחי של הטופס:\n${JSON.stringify(currentForm, null, 2)}\n\nתמלול חדש:\n${transcript}\n\nהחזר את ה-JSON המעודכן.`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

  let updatedForm: MoHFormData
  try {
    updatedForm = JSON.parse(json)
  } catch {
    console.error('Haiku returned invalid JSON', raw)
    return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
  }

  return NextResponse.json({ form: updatedForm })
}
