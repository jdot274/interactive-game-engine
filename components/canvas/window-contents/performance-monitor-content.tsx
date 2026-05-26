'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Activity, Cpu, HardDrive, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceData {
  fps: number
  frameTime: number
  memory: number
  drawCalls: number
  triangles: number
  textures: number
}

function MetricCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  color,
  warning 
}: { 
  label: string
  value: number | string
  unit: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  warning?: boolean
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      warning ? "border-destructive/50 bg-destructive/10" : "border-border bg-secondary/30"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function FPSGraph({ data }: { data: number[] }) {
  const maxFps = 120
  const graphHeight = 60

  return (
    <div className="relative h-16 bg-secondary/30 rounded overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d={`M 0 ${graphHeight} ${data.map((fps, i) => 
            `L ${(i / (data.length - 1)) * 100}% ${graphHeight - (fps / maxFps) * graphHeight}`
          ).join(' ')} L 100% ${graphHeight} Z`}
          fill="url(#fpsGradient)"
        />
        {/* Line */}
        <path
          d={`M ${data.map((fps, i) => 
            `${(i / (data.length - 1)) * 100}% ${graphHeight - (fps / maxFps) * graphHeight}`
          ).join(' L ')}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
        />
      </svg>
      {/* Reference lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-1 px-2 pointer-events-none">
        <span className="text-[8px] text-muted-foreground">120</span>
        <span className="text-[8px] text-muted-foreground">60</span>
        <span className="text-[8px] text-muted-foreground">0</span>
      </div>
    </div>
  )
}

export function PerformanceMonitorContent() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    frameTime: 16.67,
    memory: 45,
    drawCalls: 24,
    triangles: 12500,
    textures: 8,
  })
  const [fpsHistory, setFpsHistory] = useState<number[]>(Array(60).fill(60))
  const [isRecording, setIsRecording] = useState(true)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    if (!isRecording) return

    let animationFrameId: number

    const measurePerformance = () => {
      frameCountRef.current++
      const now = performance.now()
      const elapsed = now - lastTimeRef.current

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed)
        const frameTime = elapsed / frameCountRef.current

        // Simulate some variation
        const variation = (Math.random() - 0.5) * 10
        const simulatedFps = Math.max(30, Math.min(120, fps + variation))

        setPerformanceData(prev => ({
          ...prev,
          fps: Math.round(simulatedFps),
          frameTime: parseFloat((1000 / simulatedFps).toFixed(2)),
          memory: Math.round(40 + Math.random() * 20),
          drawCalls: Math.round(20 + Math.random() * 10),
          triangles: Math.round(10000 + Math.random() * 5000),
        }))

        setFpsHistory(prev => [...prev.slice(1), Math.round(simulatedFps)])

        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      animationFrameId = requestAnimationFrame(measurePerformance)
    }

    animationFrameId = requestAnimationFrame(measurePerformance)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isRecording])

  const avgFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length)
  const minFps = Math.min(...fpsHistory)
  const maxFps = Math.max(...fpsHistory)

  return (
    <div className="w-full h-full flex flex-col bg-card p-3 gap-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Performance Monitor</span>
        </div>
        <Button
          variant={isRecording ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setIsRecording(!isRecording)}
          className="text-xs gap-1"
        >
          {isRecording ? (
            <>
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              Recording
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              Paused
            </>
          )}
        </Button>
      </div>

      {/* FPS Graph */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Frame Rate</span>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Min: {minFps}</span>
            <span>Avg: {avgFps}</span>
            <span>Max: {maxFps}</span>
          </div>
        </div>
        <FPSGraph data={fpsHistory} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="FPS"
          value={performanceData.fps}
          unit="fps"
          icon={Zap}
          color="#22c55e"
          warning={performanceData.fps < 30}
        />
        <MetricCard
          label="Frame Time"
          value={performanceData.frameTime}
          unit="ms"
          icon={Activity}
          color="#3b82f6"
          warning={performanceData.frameTime > 33}
        />
        <MetricCard
          label="Memory"
          value={performanceData.memory}
          unit="MB"
          icon={HardDrive}
          color="#f97316"
        />
        <MetricCard
          label="Draw Calls"
          value={performanceData.drawCalls}
          unit="calls"
          icon={Cpu}
          color="#8b5cf6"
        />
      </div>

      {/* Detailed Stats */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Geometry</span>
        <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-xs">
          <span className="text-muted-foreground">Triangles</span>
          <span className="font-mono">{performanceData.triangles.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-secondary/30 rounded text-xs">
          <span className="text-muted-foreground">Textures</span>
          <span className="font-mono">{performanceData.textures}</span>
        </div>
      </div>

      {/* Status */}
      <div className={cn(
        "flex items-center gap-2 p-2 rounded text-xs",
        performanceData.fps >= 55 
          ? "bg-primary/10 text-primary" 
          : performanceData.fps >= 30 
            ? "bg-yellow-500/10 text-yellow-500"
            : "bg-destructive/10 text-destructive"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          performanceData.fps >= 55 
            ? "bg-primary" 
            : performanceData.fps >= 30 
              ? "bg-yellow-500"
              : "bg-destructive"
        )} />
        {performanceData.fps >= 55 
          ? "Performance: Excellent" 
          : performanceData.fps >= 30 
            ? "Performance: Acceptable"
            : "Performance: Low"}
      </div>
    </div>
  )
}
