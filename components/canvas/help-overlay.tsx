'use client'

import { Keyboard, Mouse } from 'lucide-react'

export function HelpOverlay() {
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-card/90 backdrop-blur-lg rounded-lg border border-border shadow-lg max-w-xs">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Keyboard className="w-4 h-4 text-primary" />
        3D Navigation
      </h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Orbit</span>
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">Right-Drag</kbd>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Pan</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">Alt</kbd>
            <span className="text-muted-foreground">+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">Drag</kbd>
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Dolly</span>
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">Scroll</kbd>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Move window</span>
          <span className="text-muted-foreground">Drag header</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Resize</span>
          <span className="text-muted-foreground">Drag corner</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Mouse className="w-3 h-3" />
          <span>Middle-click to pan in 3D</span>
        </div>
      </div>
    </div>
  )
}
