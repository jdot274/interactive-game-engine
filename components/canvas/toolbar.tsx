'use client'

import { useCanvasStore, type WindowType } from '@/lib/canvas-store'
import { 
  Play, 
  Pause, 
  Plus, 
  Grid3X3, 
  Magnet, 
  ZoomIn, 
  ZoomOut,
  Code,
  Box,
  Terminal,
  Eye,
  Atom,
  Layers,
  Settings,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const windowTypes: { type: WindowType; label: string; icon: React.ReactNode }[] = [
  { type: 'code-editor', label: 'Code Editor', icon: <Code className="w-4 h-4" /> },
  { type: 'r3f', label: '3D Viewport', icon: <Box className="w-4 h-4" /> },
  { type: 'react', label: 'React Preview', icon: <Atom className="w-4 h-4" /> },
  { type: 'console', label: 'Console', icon: <Terminal className="w-4 h-4" /> },
  { type: 'inspector', label: 'Inspector', icon: <Eye className="w-4 h-4" /> },
]

export function Toolbar() {
  const { 
    isPlaying, 
    togglePlay, 
    gridVisible, 
    toggleGrid, 
    snapToGrid, 
    toggleSnapToGrid,
    zoom,
    setZoom,
    addWindow,
    windows
  } = useCanvasStore()

  const handleAddWindow = (type: WindowType, label: string) => {
    // Calculate a position that doesn't overlap existing windows
    const offset = windows.length * 0.5
    addWindow({
      type,
      title: label,
      position: [offset, offset, 0],
      size: type === 'console' ? [400, 200] : [400, 300],
      isMinimized: false,
      isMaximized: false,
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-lg border-b border-border">
      {/* Left Section - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Canvas Engine</h1>
            <p className="text-[10px] text-muted-foreground">WebGL Runtime</p>
          </div>
        </div>
      </div>

      {/* Center Section - Play Controls & Tools */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant={isPlaying ? 'default' : 'secondary'}
          size="sm"
          onClick={togglePlay}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-xs">Stop</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="text-xs">Play</span>
            </>
          )}
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Add Window */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-xs">Add Window</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {windowTypes.map((item) => (
              <DropdownMenuItem
                key={item.type}
                onClick={() => handleAddWindow(item.type, item.label)}
                className="gap-2"
              >
                {item.icon}
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Grid Toggle */}
        <Button
          variant={gridVisible ? 'default' : 'ghost'}
          size="icon"
          onClick={toggleGrid}
          className="h-8 w-8"
          title="Toggle Grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        {/* Snap Toggle */}
        <Button
          variant={snapToGrid ? 'default' : 'ghost'}
          size="icon"
          onClick={toggleSnapToGrid}
          className="h-8 w-8"
          title="Snap to Grid"
        >
          <Magnet className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-secondary rounded-md px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(zoom - 0.1)}
            className="h-7 w-7"
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(zoom + 0.1)}
            className="h-7 w-7"
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Right Section - Settings */}
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">
          {windows.length} window{windows.length !== 1 ? 's' : ''}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
