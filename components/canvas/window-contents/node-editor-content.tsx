'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Play, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NodePort {
  id: string
  name: string
  type: 'input' | 'output'
  dataType: 'number' | 'vector3' | 'color' | 'texture' | 'any'
  connected?: string // portId of connected port
}

interface Node {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  inputs: NodePort[]
  outputs: NodePort[]
  data: Record<string, unknown>
  color: string
}

interface Connection {
  id: string
  fromNode: string
  fromPort: string
  toNode: string
  toPort: string
}

const nodeTemplates: Omit<Node, 'id' | 'position'>[] = [
  {
    type: 'number',
    name: 'Number',
    inputs: [],
    outputs: [{ id: 'out', name: 'Value', type: 'output', dataType: 'number' }],
    data: { value: 0 },
    color: '#3b82f6',
  },
  {
    type: 'vector3',
    name: 'Vector3',
    inputs: [],
    outputs: [{ id: 'out', name: 'Vector', type: 'output', dataType: 'vector3' }],
    data: { x: 0, y: 0, z: 0 },
    color: '#22c55e',
  },
  {
    type: 'add',
    name: 'Add',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number' },
      { id: 'b', name: 'B', type: 'input', dataType: 'number' },
    ],
    outputs: [{ id: 'result', name: 'Result', type: 'output', dataType: 'number' }],
    data: {},
    color: '#f97316',
  },
  {
    type: 'multiply',
    name: 'Multiply',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number' },
      { id: 'b', name: 'B', type: 'input', dataType: 'number' },
    ],
    outputs: [{ id: 'result', name: 'Result', type: 'output', dataType: 'number' }],
    data: {},
    color: '#ec4899',
  },
  {
    type: 'time',
    name: 'Time',
    inputs: [],
    outputs: [{ id: 'time', name: 'Time', type: 'output', dataType: 'number' }],
    data: {},
    color: '#14b8a6',
  },
  {
    type: 'sin',
    name: 'Sine',
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'number' }],
    outputs: [{ id: 'out', name: 'Output', type: 'output', dataType: 'number' }],
    data: {},
    color: '#8b5cf6',
  },
  {
    type: 'color',
    name: 'Color',
    inputs: [],
    outputs: [{ id: 'color', name: 'Color', type: 'output', dataType: 'color' }],
    data: { color: '#ffffff' },
    color: '#eab308',
  },
  {
    type: 'output',
    name: 'Output',
    inputs: [
      { id: 'position', name: 'Position', type: 'input', dataType: 'vector3' },
      { id: 'color', name: 'Color', type: 'input', dataType: 'color' },
    ],
    outputs: [],
    data: {},
    color: '#ef4444',
  },
]

const defaultNodes: Node[] = [
  {
    id: 'node-1',
    type: 'time',
    name: 'Time',
    position: { x: 50, y: 100 },
    inputs: [],
    outputs: [{ id: 'time', name: 'Time', type: 'output', dataType: 'number' }],
    data: {},
    color: '#14b8a6',
  },
  {
    id: 'node-2',
    type: 'sin',
    name: 'Sine',
    position: { x: 220, y: 100 },
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'number' }],
    outputs: [{ id: 'out', name: 'Output', type: 'output', dataType: 'number' }],
    data: {},
    color: '#8b5cf6',
  },
  {
    id: 'node-3',
    type: 'output',
    name: 'Output',
    position: { x: 400, y: 100 },
    inputs: [
      { id: 'position', name: 'Position', type: 'input', dataType: 'vector3' },
      { id: 'color', name: 'Color', type: 'input', dataType: 'color' },
    ],
    outputs: [],
    data: {},
    color: '#ef4444',
  },
]

const defaultConnections: Connection[] = [
  { id: 'conn-1', fromNode: 'node-1', fromPort: 'time', toNode: 'node-2', toPort: 'in' },
]

export function NodeEditorContent() {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes)
  const [connections, setConnections] = useState<Connection[]>(defaultConnections)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<{ nodeId: string; portId: string; portType: 'input' | 'output' } | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 })

  const addNode = (template: typeof nodeTemplates[0]) => {
    const newNode: Node = {
      ...template,
      id: `node-${Date.now()}`,
      position: { x: 150 - pan.x, y: 150 - pan.y },
      inputs: template.inputs.map(p => ({ ...p })),
      outputs: template.outputs.map(p => ({ ...p })),
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setConnections(connections.filter(c => c.fromNode !== nodeId && c.toNode !== nodeId))
    setSelectedNode(null)
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setSelectedNode(nodeId)
    setDraggingNode(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      dragStartRef.current = { x: e.clientX, y: e.clientY, nodeX: node.position.x, nodeY: node.position.y }
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNode) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setNodes(nodes.map(n => 
        n.id === draggingNode 
          ? { ...n, position: { x: dragStartRef.current.nodeX + dx, y: dragStartRef.current.nodeY + dy } }
          : n
      ))
    } else if (isPanning) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPan({ x: dragStartRef.current.nodeX + dx, y: dragStartRef.current.nodeY + dy })
    }
  }, [draggingNode, isPanning, nodes])

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null)
    setIsPanning(false)
    setConnecting(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY, nodeX: pan.x, nodeY: pan.y }
    } else {
      setSelectedNode(null)
    }
  }

  const handlePortClick = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    if (!connecting) {
      setConnecting({ nodeId, portId, portType })
    } else {
      if (connecting.portType !== portType && connecting.nodeId !== nodeId) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromNode: portType === 'input' ? connecting.nodeId : nodeId,
          fromPort: portType === 'input' ? connecting.portId : portId,
          toNode: portType === 'input' ? nodeId : connecting.nodeId,
          toPort: portType === 'input' ? portId : connecting.portId,
        }
        setConnections([...connections, newConnection])
      }
      setConnecting(null)
    }
  }

  const getPortPosition = (nodeId: string, portId: string, portType: 'input' | 'output') => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return { x: 0, y: 0 }
    const ports = portType === 'input' ? node.inputs : node.outputs
    const portIndex = ports.findIndex(p => p.id === portId)
    const headerHeight = 28
    const portSpacing = 24
    return {
      x: node.position.x + (portType === 'input' ? 0 : 160),
      y: node.position.y + headerHeight + portIndex * portSpacing + 12,
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/50">
        <span className="text-xs text-muted-foreground">Add:</span>
        {nodeTemplates.slice(0, 6).map((template) => (
          <Button
            key={template.type}
            variant="outline"
            size="sm"
            onClick={() => addNode(template)}
            className="text-xs h-6 px-2"
            style={{ borderColor: template.color, color: template.color }}
          >
            {template.name}
          </Button>
        ))}
        {selectedNode && (
          <>
            <div className="w-px h-5 bg-border" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteNode(selectedNode)}
              className="text-xs h-6 gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-[#0a0a14]"
        onMouseDown={handleCanvasMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a2e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" transform={`translate(${pan.x % 20}, ${pan.y % 20})`} />
        </svg>

        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {connections.map((conn) => {
            const from = getPortPosition(conn.fromNode, conn.fromPort, 'output')
            const to = getPortPosition(conn.toNode, conn.toPort, 'input')
            const dx = to.x - from.x
            return (
              <path
                key={conn.id}
                d={`M ${from.x} ${from.y} C ${from.x + dx * 0.5} ${from.y}, ${to.x - dx * 0.5} ${to.y}, ${to.x} ${to.y}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                opacity={0.7}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {nodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "absolute w-40 rounded-lg border bg-card shadow-lg overflow-hidden select-none",
                selectedNode === node.id ? "ring-2 ring-primary" : "border-border"
              )}
              style={{ left: node.position.x, top: node.position.y }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              {/* Header */}
              <div 
                className="px-2 py-1 text-xs font-medium text-white cursor-move"
                style={{ backgroundColor: node.color }}
              >
                {node.name}
              </div>
              
              {/* Body */}
              <div className="p-2 space-y-1">
                {/* Inputs */}
                {node.inputs.map((port) => (
                  <div key={port.id} className="flex items-center gap-2 -ml-4">
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full border-2 cursor-pointer transition-transform hover:scale-125",
                        connecting?.nodeId === node.id && connecting?.portId === port.id
                          ? "bg-primary border-primary"
                          : "bg-secondary border-muted-foreground"
                      )}
                      onClick={() => handlePortClick(node.id, port.id, 'input')}
                    />
                    <span className="text-[10px] text-muted-foreground">{port.name}</span>
                  </div>
                ))}
                
                {/* Outputs */}
                {node.outputs.map((port) => (
                  <div key={port.id} className="flex items-center justify-end gap-2 -mr-4">
                    <span className="text-[10px] text-muted-foreground">{port.name}</span>
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full border-2 cursor-pointer transition-transform hover:scale-125",
                        connecting?.nodeId === node.id && connecting?.portId === port.id
                          ? "bg-primary border-primary"
                          : "bg-secondary border-muted-foreground"
                      )}
                      onClick={() => handlePortClick(node.id, port.id, 'output')}
                    />
                  </div>
                ))}

                {/* Node-specific values */}
                {node.type === 'number' && (
                  <input
                    type="number"
                    value={node.data.value as number}
                    onChange={(e) => {
                      setNodes(nodes.map(n => 
                        n.id === node.id ? { ...n, data: { ...n.data, value: Number(e.target.value) } } : n
                      ))
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs bg-secondary px-2 py-1 rounded"
                  />
                )}
                {node.type === 'color' && (
                  <input
                    type="color"
                    value={node.data.color as string}
                    onChange={(e) => {
                      setNodes(nodes.map(n => 
                        n.id === node.id ? { ...n, data: { ...n.data, color: e.target.value } } : n
                      ))
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-6 rounded cursor-pointer"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 border-t border-border text-xs text-muted-foreground">
        <span>{nodes.length} nodes, {connections.length} connections</span>
        <span>Alt+Drag to pan | Click port to connect</span>
      </div>
    </div>
  )
}
