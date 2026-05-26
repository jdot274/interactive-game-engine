'use client'

import { useCanvasStore, TOOLS, type Tool } from '@/lib/canvas-store'
import { 
  Play, 
  Pause, 
  Grid3X3, 
  Magnet, 
  ZoomIn, 
  ZoomOut,
  Box,
  Layers,
  Settings,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    windows,
    setToolStoreOpen,
    toolStoreOpen
  } = useCanvasStore()

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
            <p className="text-[10px] text-muted-foreground">WebGL Runtime Platform</p>
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

        {/* Tool Store Button */}
        <Button 
          variant={toolStoreOpen ? 'default' : 'outline'} 
          size="sm" 
          className="gap-2"
          onClick={() => setToolStoreOpen(true)}
        >
          <Store className="w-4 h-4" />
          <span className="text-xs">Tool Store</span>
        </Button>

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

      {/* Right Section - Status & Settings */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-md">
          <Box className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {windows.length} tool{windows.length !== 1 ? 's' : ''} active
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
