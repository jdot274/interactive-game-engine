'use client'

import { useCanvasStore } from '@/lib/canvas-store'
import { 
  Minimize2,
  X,
  Code,
  Box,
  Terminal,
  Eye,
  Atom
} from 'lucide-react'

export function MinimizedWindows() {
  const { windows, updateWindow, removeWindow, bringToFront } = useCanvasStore()
  const minimizedWindows = windows.filter(w => w.isMinimized)

  if (minimizedWindows.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'code-editor':
        return <Code className="w-3 h-3" />
      case 'r3f':
      case 'drei':
      case 'threejs':
        return <Box className="w-3 h-3" />
      case 'console':
        return <Terminal className="w-3 h-3" />
      case 'inspector':
        return <Eye className="w-3 h-3" />
      case 'react':
        return <Atom className="w-3 h-3" />
      default:
        return <Box className="w-3 h-3" />
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-lg rounded-lg border border-border shadow-lg">
      {minimizedWindows.map((window) => (
        <button
          key={window.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors group"
          onClick={() => {
            updateWindow(window.id, { isMinimized: false })
            bringToFront(window.id)
          }}
        >
          {getIcon(window.type)}
          <span className="text-xs text-foreground">{window.title}</span>
          <button
            className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              removeWindow(window.id)
            }}
          >
            <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </button>
      ))}
    </div>
  )
}
