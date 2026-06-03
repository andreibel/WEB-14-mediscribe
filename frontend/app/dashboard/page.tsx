'use client'

import { Window, WindowGroup } from '@/components/window'
import { AppNav } from '@/components/AppNav'
import { TranscriptPanel } from './transcript/TranscriptPanel'
import { MoHForm } from './MoHForm'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[#EDE8E1] dark:bg-[#141210] transition-colors duration-200">
      <AppNav />
      <div className="flex-1 flex flex-col gap-2 p-3 pt-[calc(3.5rem+0.75rem)] min-h-0">

      {/* Row 1 — three equal panels */}
        <WindowGroup className="flex-1 min-h-0">
          <Window title="Overview" defaultMinimized={true}>
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                This panel shows a high-level summary of the current session.
                You can minimize it to reclaim space, or maximize it to focus.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Active', 'Pending', 'Done', 'Total'].map((label, i) => (
                  <div key={label} className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                    <div className="text-lg font-bold text-gray-800">{(i + 1) * 12}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Window>

          <Window title="Transcript">
            <TranscriptPanel />
          </Window>

          <Window title="נספח ז">
            <MoHForm />
          </Window>
        </WindowGroup>

      </div>
    </div>
  )
}
