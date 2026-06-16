import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { MoHFormData } from '@/app/session/_form/formSchema'
import type { TranscriptSegment } from '@/app/session/_transcript/types'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `אתה עוזר רפואי שממלא טופס רישום וניטור החייאה .

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
- כל שורת תמלול מתחילה בזמן בפועל שבו נאמרה, בפורמט [HH:MM]. כאשר מוזכר מתן תרופה, שוק חשמלי, או אירוע מתוזמן — קבע את זמנו בטופס לפי הזמן שבתחילת אותה שורה (למשל times של תרופות, defibrillationTimes, slots של קצב לב, timeFound וכו׳)
- החזר אך ורק את אובייקט ה-JSON המלא, ללא הסברים וללא markdown`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { segments, currentForm }: {
    // `clock` is the wall-clock time (HH:MM) the segment was finalized — the LLM
    // uses it to time-stamp medications/events in the form.
    segments: Array<TranscriptSegment & { clock?: string }>
    currentForm: MoHFormData
  } = await req.json()

  const transcript = segments
    .filter(s => s.is_final && s.text.trim())
    .map(s => `[${s.clock ?? '--:--'}] [${s.token}] ${s.text.trim()}`)
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
