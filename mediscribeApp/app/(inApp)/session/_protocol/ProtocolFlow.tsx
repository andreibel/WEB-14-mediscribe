'use client'

import { useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Protocol } from './types'
import type { ProtocolEngine } from './useProtocolEngine'
import { nodeTypes, type FlowNodeData, type PFNode } from './blocks/flowNodes'

// Fixed node widths (px) — cards never stretch; the canvas pans/zooms to fit.
const W = { box: 188, decision: 172, event: 156 }
const X_A = 16        // lane A (shockable) column
const X_B = 268       // lane B (non-shockable) column
const X_TRUNK = 130   // centred trunk
const Y_STEP = 138
const Y_LANE = 250

function rfType(kind: string): keyof typeof W {
  if (kind === 'decision') return 'decision'
  if (kind === 'event') return 'event'
  return 'box'
}

function buildPositions(protocol: Protocol): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {}
  const nodes = protocol.nodes
  const splitIdx = nodes.findIndex((n) => n.kind === 'decision' && (n.lane ?? 'trunk') === 'trunk')
  const laneA = nodes.filter((n) => n.lane === 'a')
  const laneB = nodes.filter((n) => n.lane === 'b')

  // Trunk top (entry + split)
  nodes.filter((n, i) => (n.lane ?? 'trunk') === 'trunk' && (splitIdx < 0 || i <= splitIdx))
    .forEach((n, i) => { pos[n.id] = { x: X_TRUNK, y: i * 120 } })

  laneA.forEach((n, i) => { pos[n.id] = { x: X_A, y: Y_LANE + i * Y_STEP } })
  laneB.forEach((n, i) => { pos[n.id] = { x: X_B, y: Y_LANE + i * Y_STEP } })

  // Trunk bottom (shared outcome), below the taller lane
  const tail = Y_LANE + Math.max(laneA.length, laneB.length) * Y_STEP + 20
  nodes.filter((n, i) => (n.lane ?? 'trunk') === 'trunk' && splitIdx >= 0 && i > splitIdx)
    .forEach((n, i) => { pos[n.id] = { x: X_TRUNK, y: tail + i * Y_STEP } })

  return pos
}

function buildEdges(protocol: Protocol, pos: Record<string, { x: number; y: number }>): Edge[] {
  const order: Record<string, number> = {}
  protocol.nodes.forEach((n, i) => { order[n.id] = i })
  const edges: Edge[] = []

  const make = (
    from: string,
    to: string,
    kind: 'seq' | 'yes' | 'no' | 'loop',
    label?: string,
  ): Edge => {
    const color = kind === 'yes' ? '#2E7D58' : kind === 'no' ? '#C0392B' : kind === 'loop' ? '#C15F3C' : '#A89D90'
    const a = pos[from]
    const b = pos[to]
    const dx = (b?.x ?? 0) - (a?.x ?? 0)
    const dy = (b?.y ?? 0) - (a?.y ?? 0)
    // Pick the exit side by where the target actually sits:
    //  - target above (a loop-back) → leave from the outer side and route around
    //  - target clearly left/right → leave from that side
    //  - otherwise straight down from the bottom
    let sourceHandle: string | undefined
    if (dy < 0) sourceHandle = (a?.x ?? 0) <= X_TRUNK ? 'l' : 'r'
    else if (Math.abs(dx) > 60) sourceHandle = dx > 0 ? 'r' : 'l'
    return {
      id: `${from}-${to}`,
      source: from,
      target: to,
      sourceHandle,
      type: 'smoothstep',
      label,
      labelBgPadding: [4, 1],
      labelBgStyle: { fill: '#FFFEF9', fillOpacity: 0.9 },
      labelStyle: { fill: color, fontWeight: 800, fontSize: 10 },
      animated: kind === 'loop',
      style: { stroke: color, strokeWidth: 1.6, strokeDasharray: kind === 'loop' ? '5 3' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
    }
  }

  for (const n of protocol.nodes) {
    if (n.kind === 'decision') {
      if (n.yes) edges.push(make(n.id, n.yes, 'yes', 'כן'))
      if (n.no) edges.push(make(n.id, n.no, 'no', 'לא'))
    } else if (n.next) {
      const loop = (order[n.next] ?? 0) <= (order[n.id] ?? 0)
      edges.push(make(n.id, n.next, loop ? 'loop' : 'seq'))
    }
  }
  return edges
}

// Pans the viewport to keep the current node centered. Lives inside <ReactFlow>
// so it can use the imperative camera API.
function Recenter({
  nodeId,
  positions,
  follow,
}: {
  nodeId: string | null
  positions: Record<string, { x: number; y: number }>
  follow: boolean
}) {
  const { setCenter, getZoom } = useReactFlow()
  useEffect(() => {
    if (!follow || !nodeId) return
    const p = positions[nodeId]
    if (!p) return
    // Keep the user's zoom, but never sit so far out that text turns fuzzy —
    // snap up to a crisp 1× when zoomed below readable.
    const z = getZoom()
    const zoom = z < 0.85 ? 1 : z
    void setCenter(p.x + 90, p.y + 38, { zoom, duration: 500 })
  }, [nodeId, follow, positions, setCenter, getZoom])
  return null
}

export function ProtocolFlow({ protocol, engine }: { protocol: Protocol; engine: ProtocolEngine }) {
  const { runtimes, timerViews, activeNodeId, toggleDone, fireNode, focus, settings } = engine

  const positions = useMemo(() => buildPositions(protocol), [protocol])
  const edges = useMemo(() => buildEdges(protocol, positions), [protocol, positions])

  const EMPTY = { firedCount: 0, lastFiredAt: null, done: false }
  const nodes: Node<FlowNodeData>[] = useMemo(() =>
    protocol.nodes.map((n): PFNode => ({
      id: n.id,
      type: rfType(n.kind),
      position: positions[n.id] ?? { x: 0, y: 0 },
      style: { width: W[rfType(n.kind)] },
      data: {
        pnode: n,
        runtime: runtimes[n.id] ?? EMPTY,
        timer: timerViews[n.id],
        active: activeNodeId === n.id,
        onToggleDone: toggleDone,
        onFire: fireNode,
        onAnswer: focus,
      },
      draggable: false,
      selectable: true, // selectable → node gets pointer-events, so its buttons are clickable
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [protocol, positions, runtimes, timerViews, activeNodeId, toggleDone, fireNode, focus])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      minZoom={0.2}
      maxZoom={1.6}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      selectNodesOnDrag={false}
      edgesFocusable={false}
      proOptions={{ hideAttribution: true }}
      className="bg-[#F4F1EB] dark:bg-[#161310]"
    >
      {/* Nodes must be selectable for their buttons to receive clicks, but we
          don't want the selection outline — hide it. */}
      <style>{`.react-flow__node.selected,.react-flow__node:focus,.react-flow__node:focus-visible{box-shadow:none!important;outline:none!important}`}</style>
      <Recenter nodeId={activeNodeId} positions={positions} follow={settings.follow} />
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} className="!text-[#D8D2C8] dark:!text-[#2A2724]" color="currentColor" />
      <Controls showInteractive={false} className="!shadow-sm" />
    </ReactFlow>
  )
}
