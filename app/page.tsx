'use client'

import dynamic from 'next/dynamic'
import { Toolbar } from '@/components/canvas/toolbar'
import { MinimizedWindows } from '@/components/canvas/minimized-windows'
import { HelpOverlay } from '@/components/canvas/help-overlay'
import { ToolStore } from '@/components/canvas/tool-store'

// Dynamic import to avoid SSR issues with Three.js
const InfiniteCanvas = dynamic(
  () => import('@/components/canvas/infinite-canvas').then(mod => ({ default: mod.InfiniteCanvas })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading Canvas Engine...</p>
        </div>
      </div>
    )
  }
)

export default function CanvasEnginePage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-background">
      <Toolbar />
      <div className="w-full h-full pt-14">
        <InfiniteCanvas />
      </div>
      <MinimizedWindows />
      <HelpOverlay />
      <ToolStore />
    </main>
  )
}
