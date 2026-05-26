'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Layers, Box, Circle, Type } from 'lucide-react'

interface SceneNode {
  id: string
  name: string
  type: 'group' | 'mesh' | 'light' | 'camera' | 'text'
  children?: SceneNode[]
  properties?: { [key: string]: string | number | boolean }
}

const sceneGraph: SceneNode[] = [
  {
    id: 'scene',
    name: 'Scene',
    type: 'group',
    children: [
      {
        id: 'camera',
        name: 'PerspectiveCamera',
        type: 'camera',
        properties: {
          fov: 50,
          near: 0.1,
          far: 1000,
        }
      },
      {
        id: 'lights',
        name: 'Lights',
        type: 'group',
        children: [
          { id: 'ambient', name: 'AmbientLight', type: 'light', properties: { intensity: 0.4 } },
          { id: 'point1', name: 'PointLight', type: 'light', properties: { intensity: 1 } },
        ]
      },
      {
        id: 'meshes',
        name: 'Objects',
        type: 'group',
        children: [
          { id: 'box', name: 'RotatingBox', type: 'mesh', properties: { visible: true, castShadow: true } },
          { id: 'sphere', name: 'FloatingSphere', type: 'mesh', properties: { visible: true, castShadow: true } },
          { id: 'torus', name: 'Torus', type: 'mesh', properties: { visible: true, castShadow: true } },
        ]
      },
      {
        id: 'text',
        name: 'R3F Viewport Text',
        type: 'text',
        properties: { fontSize: 0.2, color: '#ffffff' }
      }
    ]
  }
]

export function InspectorContent() {
  const [selectedNode, setSelectedNode] = useState<SceneNode | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['scene', 'meshes', 'lights']))

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const getNodeIcon = (type: SceneNode['type']) => {
    switch (type) {
      case 'group':
        return <Layers className="w-3 h-3 text-yellow-500" />
      case 'mesh':
        return <Box className="w-3 h-3 text-blue-400" />
      case 'light':
        return <Circle className="w-3 h-3 text-yellow-300" />
      case 'camera':
        return <Box className="w-3 h-3 text-green-400" />
      case 'text':
        return <Type className="w-3 h-3 text-purple-400" />
      default:
        return <Box className="w-3 h-3" />
    }
  }

  const renderNode = (node: SceneNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode?.id === node.id

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-muted/50 transition-colors ${
            isSelected ? 'bg-primary/20 text-primary' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            setSelectedNode(node)
            if (hasChildren) toggleExpand(node.id)
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )
          ) : (
            <span className="w-3" />
          )}
          {getNodeIcon(node.type)}
          <span className="text-xs truncate">{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card text-xs">
      {/* Scene Graph */}
      <div className="flex-1 overflow-auto border-b border-border">
        <div className="px-3 py-2 border-b border-border bg-secondary/50 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Scene Graph
        </div>
        <div className="py-1">
          {sceneGraph.map(node => renderNode(node))}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="h-32 overflow-auto">
        <div className="px-3 py-2 border-b border-border bg-secondary/50 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Properties
        </div>
        {selectedNode ? (
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{selectedNode.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground capitalize">{selectedNode.type}</span>
            </div>
            {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-muted-foreground">{key}</span>
                <span className="text-primary">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Select an object
          </div>
        )}
      </div>
    </div>
  )
}
