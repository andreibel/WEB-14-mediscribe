'use client'

import { useState } from 'react'
import { Settings2, X, Volume2, VolumeX, Radio, BellRing, FlaskConical, Crosshair } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import type { ProtocolEngine } from './useProtocolEngine'
import { ProtocolPicker } from './ProtocolPicker'
import { ProtocolFlow } from './ProtocolFlow'
import { Timeline } from './blocks/Timeline'

// The whole left-section UI: a real-time activity diagram of the protocol on a
// pan/zoom flow canvas. Nothing here is persisted — state comes from the engine.
export function ProtocolPanel({ engine }: { engine: ProtocolEngine }) {
  const {
    activeProtocol, available, notifications,
    settings, updateSettings, loadProtocol, unload,
  } = engine
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div dir="rtl" className="relative flex h-full min-h-0 flex-col bg-[#F4F1EB] dark:bg-[#161310]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E8E2D9] bg-[#FFFEF9]/95 px-3 py-2 backdrop-blur-sm dark:border-[#2E2A27] dark:bg-[#1C1917]/95">
        <div className="flex min-w-0 items-center gap-2">
          <Radio size={15} className="shrink-0 text-[#C15F3C]" />
          <span className="truncate text-[12px] font-extrabold text-[#3A332D] dark:text-[#E8E2D9]">
            {activeProtocol ? activeProtocol.name : 'פרוטוקול'}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {activeProtocol && (
            <button type="button" onClick={unload} title="סגור פרוטוקול"
              className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-semibold text-[#A89D90] hover:bg-[#EFEAE2] hover:text-[#C0492B] dark:hover:bg-[#2A2724]">
              <X size={13} /> סגור
            </button>
          )}
          <button type="button" onClick={() => setShowSettings((v) => !v)} title="הגדרות"
            className={['flex h-6 w-6 items-center justify-center rounded-md transition-colors', showSettings ? 'bg-[#C15F3C]/12 text-[#C15F3C]' : 'text-[#A89D90] hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724]'].join(' ')}>
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="shrink-0 space-y-1 border-b border-[#E8E2D9] bg-[#FBF8F3] px-3 py-2 dark:border-[#2E2A27] dark:bg-[#1A1714]">
          <Toggle icon={Radio} label="זיהוי פרוטוקול אוטומטי" on={settings.autoDetect} onClick={() => updateSettings({ autoDetect: !settings.autoDetect })} />
          <Toggle icon={Crosshair} label="מעקב מצלמה אחר השלב הנוכחי" on={settings.follow} onClick={() => updateSettings({ follow: !settings.follow })} />
          <Toggle icon={settings.sound ? Volume2 : VolumeX} label="צליל התראה" on={settings.sound} onClick={() => updateSettings({ sound: !settings.sound })} />
          <Toggle icon={BellRing} label="התראות דפדפן" on={settings.browserNotify} onClick={() => updateSettings({ browserNotify: !settings.browserNotify })} />
        </div>
      )}

      {/* Fixed event timeline (replaces hovering toasts) */}
      {activeProtocol && <Timeline items={notifications} />}

      {/* Body */}
      {!activeProtocol ? (
        <div className="flex-1 overflow-y-auto">
          <ProtocolPicker protocols={available} autoDetect={settings.autoDetect} onLoad={loadProtocol} />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1">
            <ProtocolFlow protocol={activeProtocol} engine={engine} />
          </div>
          <div className="shrink-0 border-t border-[#E8E2D9] px-2 py-1.5 dark:border-[#2E2A27]">
            <TestBar onPush={engine.pushSegment} />
          </div>
        </>
      )}
    </div>
  )
}

// Simulate a transcript segment to exercise detection + timers without a mic.
function TestBar({ onPush }: { onPush: (text: string) => void }) {
  const [text, setText] = useState('')
  const send = () => {
    if (!text.trim()) return
    onPush(text)
    setText('')
  }
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#D8D2C8] bg-[#FBF8F3] p-1.5 dark:border-[#3a3835] dark:bg-[#1A1714]">
      <FlaskConical size={13} className="shrink-0 text-[#A89D90]" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="בדיקה: 'דום לב' · 'שוק' · 'אדרנלין'…"
        className="min-w-0 flex-1 bg-transparent text-[11px] text-[#3A332D] outline-none placeholder:text-[#B1ADA1] dark:text-[#E8E2D9]"
      />
      <button type="button" onClick={send} className="shrink-0 rounded-md bg-[#6b6662] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#4a4640]">
        שלח
      </button>
    </div>
  )
}
