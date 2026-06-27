import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Check, Zap, Syringe, Activity, HeartPulse, Flag } from 'lucide-react'
import type { ProtocolNode, NodeRuntime, TimerView } from '../types'
import { CountdownRing } from './CountdownRing'

// Data carried by every React Flow node.
export type FlowNodeData = {
  pnode: ProtocolNode
  runtime: NodeRuntime
  timer?: TimerView
  active: boolean
  onToggleDone: (id: string) => void
  onFire: (id: string) => void
  /** Advance the current pointer to a branch target (answering a decision). */
  onAnswer: (id: string) => void
}
export type PFNode = Node<FlowNodeData>

// Invisible connection points — edges anchor here; we don't connect by hand.
const HANDLE = '!h-1 !w-1 !min-w-0 !border-0 !bg-transparent'
function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className={HANDLE} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className={HANDLE} isConnectable={false} />
      <Handle id="l" type="source" position={Position.Left} className={HANDLE} isConnectable={false} />
      <Handle id="r" type="source" position={Position.Right} className={HANDLE} isConnectable={false} />
    </>
  )
}

function Badge({ n }: { n?: number }) {
  if (n == null) return null
  return (
    <span className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[#C8C2B8] bg-white text-[10px] font-bold text-[#6b6662] shadow-sm dark:border-[#3a3835] dark:bg-[#252420] dark:text-[#c0bdb8]">
      {n}
    </span>
  )
}

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={checked ? 'בטל סימון' : 'סמן כבוצע'}
      className={[
        'nodrag nopan absolute -top-2 -left-2 z-10 flex h-5 w-5 items-center justify-center rounded-[5px] border shadow-sm transition-colors',
        checked ? 'border-[#3FA37A] bg-[#3FA37A] text-white' : 'border-[#C8C2B8] bg-white text-transparent hover:border-[#3FA37A] dark:border-[#3a3835] dark:bg-[#252420]',
      ].join(' ')}
    >
      <Check size={12} strokeWidth={3} />
    </button>
  )
}

const TONE_ICON = { shock: Zap, drug: Syringe, rhythm: HeartPulse } as const

function activeRing(active: boolean) {
  return active ? 'ring-2 ring-[#C15F3C] ring-offset-1 ring-offset-[#F4F1EB] dark:ring-offset-[#161310]' : ''
}

// ── Box: start / process / terminal ───────────────────────────────────────────
export function BoxNode({ data }: NodeProps<PFNode>) {
  const { pnode, runtime, timer, active, onToggleDone, onFire } = data
  const isTerminal = pnode.kind === 'terminal'
  const box = isTerminal
    ? 'border-[#B9B2A6] bg-[#EDEBE6] text-[#4a4640] dark:border-[#4a4640] dark:bg-[#211F1B] dark:text-[#c0bdb8]'
    : 'border-[#2F6DA8] bg-[#DCEAF7] text-[#1E4E79] dark:border-[#2F6DA8] dark:bg-[#16273A] dark:text-[#9CC4E8]'
  return (
    <div dir="rtl" className={['relative w-full', runtime.done ? 'opacity-55' : ''].join(' ')}>
      <Handles />
      <Badge n={pnode.badge} />
      <Checkbox checked={runtime.done} onToggle={() => onToggleDone(pnode.id)} />
      <div className={['rounded-lg border-2 px-2.5 py-2', box, activeRing(active)].join(' ')}>
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              {isTerminal && <Flag size={12} className="shrink-0" />}
              <span className="text-[11.5px] font-extrabold leading-tight">{pnode.title}</span>
            </div>
            {pnode.bullets && (
              <ul className="mt-1 space-y-0.5">
                {pnode.bullets.map((b, i) => (
                  <li key={i} className="flex gap-1 text-[9.5px] leading-snug opacity-90">
                    <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-current" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {timer && (
            <button type="button" onClick={() => onFire(pnode.id)} title={pnode.timer?.label ?? 'אפס טיימר'} className="nodrag nopan shrink-0">
              <CountdownRing remainingMs={timer.remainingMs} totalMs={timer.totalMs} status={timer.status} size={36} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Decision: pink hexagon ─────────────────────────────────────────────────────
export function DecisionNode({ data }: NodeProps<PFNode>) {
  const { pnode, runtime, active, onToggleDone, onAnswer } = data
  return (
    <div dir="rtl" className={['relative w-full', runtime.done ? 'opacity-55' : ''].join(' ')}>
      <Handles />
      <Checkbox checked={runtime.done} onToggle={() => onToggleDone(pnode.id)} />
      <div
        className={['flex items-center justify-center px-5 py-2.5 text-center', 'bg-[#F8D6D2] text-[#9B2D22] dark:bg-[#3A1E1C] dark:text-[#E6A6A0]', 'border-y-2 border-[#C0392B]', activeRing(active)].join(' ')}
        style={{ clipPath: 'polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%)' }}
      >
        <span className="text-[11px] font-bold leading-tight">{pnode.title}</span>
      </div>
      {/* Answer the decision → advances the current pointer + camera follows. */}
      <div className="mt-1 flex justify-center gap-1.5">
        {pnode.yes && (
          <button type="button" onClick={() => onAnswer(pnode.yes!)}
            className="nodrag nopan rounded-full border border-[#2E7D58] px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#2E7D58] hover:bg-[#2E7D58] hover:text-white dark:text-[#5BC79A]">
            כן
          </button>
        )}
        {pnode.no && (
          <button type="button" onClick={() => onAnswer(pnode.no!)}
            className="nodrag nopan rounded-full border border-[#C0392B] px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#C0392B] hover:bg-[#C0392B] hover:text-white dark:text-[#E08A6E]">
            לא
          </button>
        )}
      </div>
    </div>
  )
}

// ── Event: shock / drug / rhythm-label ────────────────────────────────────────
export function EventNode({ data }: NodeProps<PFNode>) {
  const { pnode, runtime, active, onFire } = data
  const tone = pnode.tone ?? 'rhythm'
  const Icon = TONE_ICON[tone]
  if (tone === 'rhythm') {
    return (
      <div dir="rtl" className="relative w-full">
        <Handles />
        <Badge n={pnode.badge} />
        <div className={['flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5', 'border-[#B9B2A6] bg-[#E9E7E2] text-[#5A544B] dark:border-[#4a4640] dark:bg-[#26241F] dark:text-[#b0a89c]', activeRing(active)].join(' ')}>
          <Activity size={12} className="shrink-0" />
          <span className="text-[11px] font-bold">{pnode.title}</span>
        </div>
      </div>
    )
  }
  return (
    <div dir="rtl" className="relative w-full">
      <Handles />
      <Badge n={pnode.badge} />
      <button
        type="button"
        onClick={() => onFire(pnode.id)}
        title="רשום ביצוע"
        className={['nodrag nopan flex w-full items-center justify-center gap-1.5 rounded-md border-2 px-2.5 py-1.5 transition-colors', 'border-[#C0392B] bg-[#FBE3DD] text-[#B23A28] hover:bg-[#F7D2CB] dark:bg-[#331B17] dark:text-[#E89A87] dark:hover:bg-[#3D211C]', activeRing(active)].join(' ')}
      >
        <Icon size={14} className="shrink-0" strokeWidth={2.4} />
        <span className="text-[11.5px] font-extrabold">{pnode.title}</span>
        {runtime.firedCount > 0 && <span className="text-[9.5px] font-bold opacity-70">×{runtime.firedCount}</span>}
      </button>
    </div>
  )
}

export const nodeTypes = { box: BoxNode, decision: DecisionNode, event: EventNode }
