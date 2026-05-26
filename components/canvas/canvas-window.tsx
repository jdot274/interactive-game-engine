'use client'

import { useRef, useState, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCanvasStore, type CanvasWindow } from '@/lib/canvas-store'
import { X, Minus, Maximize2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

// Window content components
import { CodeEditorContent } from './window-contents/code-editor-content'
import { R3FViewportContent } from './window-contents/r3f-viewport-content'
import { ConsoleContent } from './window-contents/console-content'
import { InspectorContent } from './window-contents/inspector-content'
import { ReactPreviewContent } from './window-contents/react-preview-content'

interface CanvasWindowProps {
  window: CanvasWindow
}

export function CanvasWindowComponent({ window }: CanvasWindowProps) {
  const { 
    updateWindow, 
    removeWindow, 
    bringToFront, 
    activeWindowId,
    snapToGrid,
    gridSize 
  } = useCanvasStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragStart = useRef<{ x: number; y: number; windowX: number; windowY: number } | null>(null)
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  
  const isActive = activeWindowId === window.id

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    bringToFront(window.id)
  }, [bringToFront, window.id])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    bringToFront(window.id)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: window.position[0],
      windowY: window.position[1],
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return
      
      const deltaX = (e.clientX - dragStart.current.x) * 0.02
      const deltaY = -(e.clientY - dragStart.current.y) * 0.02
      
      let newX = dragStart.current.windowX + deltaX
      let newY = dragStart.current.windowY + deltaY
      
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize
        newY = Math.round(newY / gridSize) * gridSize
      }
      
      updateWindow(window.id, {
        position: [newX, newY, window.position[2]]
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStart.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [bringToFront, window.id, window.position, updateWindow, snapToGrid, gridSize])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: window.size[0],
      height: window.size[1],
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStart.current) return
      
      const deltaX = e.clientX - resizeStart.current.x
      const deltaY = e.clientY - resizeStart.current.y
      
      const newWidth = Math.max(200, resizeStart.current.width + deltaX)
      const newHeight = Math.max(150, resizeStart.current.height + deltaY)
      
      updateWindow(window.id, {
        size: [newWidth, newHeight]
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeStart.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [window.id, window.size, updateWindow])

  const getWindowContent = () => {
    switch (window.type) {
      case 'code-editor':
        return <CodeEditorContent content={window.content || ''} windowId={window.id} />
      case 'r3f':
      case 'drei':
      case 'threejs':
        return <R3FViewportContent />
      case 'console':
        return <ConsoleContent />
      case 'inspector':
        return <InspectorContent />
      case 'react':
        return <ReactPreviewContent />
      default:
        return <div className="p-4 text-muted-foreground">Unknown window type</div>
    }
  }

  const getWindowIcon = () => {
    switch (window.type) {
      case 'code-editor':
        return '📝'
      case 'r3f':
      case 'drei':
      case 'threejs':
        return '🎮'
      case 'console':
        return '⚡'
      case 'inspector':
        return '🔍'
      case 'react':
        return '⚛️'
      default:
        return '📦'
    }
  }

  if (window.isMinimized) return null

  return (
    <Html
      position={window.position}
      style={{
        width: window.size[0],
        height: window.size[1],
        zIndex: window.zIndex,
      }}
      transform
      occlude={false}
      distanceFactor={10}
    >
      <div
        className={cn(
          "flex flex-col rounded-lg overflow-hidden shadow-2xl transition-shadow duration-200",
          "border bg-card",
          isActive ? "border-primary shadow-primary/20" : "border-border",
          isDragging && "cursor-grabbing",
        )}
        style={{
          width: window.size[0],
          height: window.size[1],
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Window Header */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b cursor-grab select-none",
            isActive ? "bg-secondary" : "bg-card",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleDragStart}
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{getWindowIcon()}</span>
          <span className="flex-1 text-sm font-medium truncate text-foreground">
            {window.title}
          </span>
          
          {/* Window Controls */}
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                updateWindow(window.id, { isMinimized: true })
              }}
            >
              <Minus className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                updateWindow(window.id, { isMaximized: !window.isMaximized })
              }}
            >
              <Maximize2 className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              className="p-1 rounded hover:bg-destructive/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                removeWindow(window.id)
              }}
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden bg-card">
          {getWindowContent()}
        </div>

        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <svg
            className="w-4 h-4 text-muted-foreground/50"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>
      </div>
    </Html>
  )
}
