'use client'

import { useState, useRef, useCallback } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { 
  Play, Pause, SkipBack, SkipForward, Plus, 
  ChevronRight, Diamond, Circle, Square 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Keyframe {
  time: number
  value: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

interface Track {
  id: string
  name: string
  property: string
  color: string
  keyframes: Keyframe[]
  expanded: boolean
}

const defaultTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Cube',
    property: 'rotation.y',
    color: '#3b82f6',
    keyframes: [
      { time: 0, value: 0, easing: 'ease-in-out' },
      { time: 2, value: 3.14, easing: 'ease-in-out' },
      { time: 4, value: 6.28, easing: 'ease-in-out' },
    ],
    expanded: true,
  },
  {
    id: 'track-2',
    name: 'Sphere',
    property: 'position.y',
    color: '#22c55e',
    keyframes: [
      { time: 0, value: 0, easing: 'ease-out' },
      { time: 1, value: 1.5, easing: 'ease-in' },
      { time: 2, value: 0, easing: 'ease-out' },
      { time: 3, value: 1.5, easing: 'ease-in' },
      { time: 4, value: 0, easing: 'linear' },
    ],
    expanded: true,
  },
  {
    id: 'track-3',
    name: 'Camera',
    property: 'fov',
    color: '#f97316',
    keyframes: [
      { time: 0, value: 50, easing: 'linear' },
      { time: 2, value: 35, easing: 'ease-in-out' },
      { time: 4, value: 50, easing: 'ease-in-out' },
    ],
    expanded: false,
  },
]

export function AnimationTimelineContent() {
  const { isPlaying, togglePlay, currentTime, setCurrentTime } = useCanvasStore()
  const [tracks, setTracks] = useState<Track[]>(defaultTracks)
  const [duration, setDuration] = useState(4)
  const [zoom, setZoom] = useState(1)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [selectedKeyframe, setSelectedKeyframe] = useState<{trackId: string, keyframeIndex: number} | null>(null)

  const pixelsPerSecond = 100 * zoom

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = Math.max(0, Math.min(duration, x / pixelsPerSecond))
    setCurrentTime(time)
  }, [duration, pixelsPerSecond, setCurrentTime])

  const toggleTrackExpanded = (trackId: string) => {
    setTracks(tracks.map(t => 
      t.id === trackId ? { ...t, expanded: !t.expanded } : t
    ))
  }

  const addKeyframe = (trackId: string) => {
    setTracks(tracks.map(t => {
      if (t.id !== trackId) return t
      const newKeyframe: Keyframe = {
        time: currentTime,
        value: 0,
        easing: 'ease-in-out',
      }
      return {
        ...t,
        keyframes: [...t.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
      }
    }))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const frames = Math.floor((time % 1) * 30)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full h-full flex flex-col bg-card">
      {/* Transport Controls */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setCurrentTime(0)} className="p-1 h-7 w-7">
            <SkipBack className="w-3 h-3" />
          </Button>
          <Button 
            variant={isPlaying ? 'default' : 'secondary'} 
            size="sm" 
            onClick={togglePlay}
            className="p-1 h-7 w-7"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentTime(duration)} className="p-1 h-7 w-7">
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
            {formatTime(currentTime)}
          </span>
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Duration:</span>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            className="w-12 bg-secondary px-2 py-0.5 rounded text-center"
          />
          <span className="text-muted-foreground">s</span>
        </div>

        <div className="flex-1" />
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20 accent-primary"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Labels */}
        <div className="w-36 flex-shrink-0 border-r border-border bg-card">
          {/* Time ruler header */}
          <div className="h-6 border-b border-border bg-secondary/30" />
          
          {/* Track labels */}
          {tracks.map((track) => (
            <div key={track.id}>
              <div 
                className="h-8 flex items-center gap-1 px-2 border-b border-border hover:bg-secondary/30 cursor-pointer"
                onClick={() => toggleTrackExpanded(track.id)}
              >
                <ChevronRight className={cn(
                  "w-3 h-3 text-muted-foreground transition-transform",
                  track.expanded && "rotate-90"
                )} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }} />
                <span className="text-xs truncate flex-1">{track.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation()
                    addKeyframe(track.id)
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              {track.expanded && (
                <div className="h-6 flex items-center px-6 border-b border-border bg-secondary/10">
                  <span className="text-[10px] text-muted-foreground">{track.property}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-x-auto">
          <div 
            ref={timelineRef}
            className="relative min-h-full"
            style={{ width: duration * pixelsPerSecond }}
            onClick={handleTimelineClick}
          >
            {/* Time Ruler */}
            <div className="h-6 border-b border-border bg-secondary/30 relative">
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex flex-col justify-end"
                  style={{ left: i * pixelsPerSecond }}
                >
                  <div className="w-px h-2 bg-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground ml-1">{i}s</span>
                </div>
              ))}
            </div>

            {/* Tracks */}
            {tracks.map((track) => (
              <div key={track.id}>
                <div className="h-8 border-b border-border relative">
                  {/* Keyframes */}
                  {track.keyframes.map((kf, i) => (
                    <div
                      key={i}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-transform hover:scale-125",
                        selectedKeyframe?.trackId === track.id && selectedKeyframe.keyframeIndex === i && "scale-150"
                      )}
                      style={{ left: kf.time * pixelsPerSecond }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedKeyframe({ trackId: track.id, keyframeIndex: i })
                      }}
                    >
                      <Diamond 
                        className="w-3 h-3" 
                        fill={track.color} 
                        color={track.color}
                      />
                    </div>
                  ))}
                  
                  {/* Connections */}
                  {track.keyframes.slice(0, -1).map((kf, i) => {
                    const next = track.keyframes[i + 1]
                    return (
                      <div
                        key={`line-${i}`}
                        className="absolute top-1/2 h-px"
                        style={{
                          left: kf.time * pixelsPerSecond,
                          width: (next.time - kf.time) * pixelsPerSecond,
                          backgroundColor: track.color,
                          opacity: 0.5,
                        }}
                      />
                    )
                  })}
                </div>
                {track.expanded && (
                  <div className="h-6 border-b border-border bg-secondary/5" />
                )}
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
              style={{ left: currentTime * pixelsPerSecond }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe Properties */}
      {selectedKeyframe && (
        <div className="flex items-center gap-4 p-2 border-t border-border bg-secondary/30 text-xs">
          <span className="text-muted-foreground">Keyframe:</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Time:</span>
            <input
              type="number"
              step="0.1"
              value={tracks.find(t => t.id === selectedKeyframe.trackId)?.keyframes[selectedKeyframe.keyframeIndex]?.time ?? 0}
              className="w-16 bg-secondary px-2 py-0.5 rounded"
              onChange={(e) => {
                setTracks(tracks.map(t => {
                  if (t.id !== selectedKeyframe.trackId) return t
                  const newKeyframes = [...t.keyframes]
                  newKeyframes[selectedKeyframe.keyframeIndex] = {
                    ...newKeyframes[selectedKeyframe.keyframeIndex],
                    time: Number(e.target.value)
                  }
                  return { ...t, keyframes: newKeyframes.sort((a, b) => a.time - b.time) }
                }))
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Easing:</span>
            <select
              className="bg-secondary px-2 py-0.5 rounded"
              value={tracks.find(t => t.id === selectedKeyframe.trackId)?.keyframes[selectedKeyframe.keyframeIndex]?.easing ?? 'linear'}
              onChange={(e) => {
                setTracks(tracks.map(t => {
                  if (t.id !== selectedKeyframe.trackId) return t
                  const newKeyframes = [...t.keyframes]
                  newKeyframes[selectedKeyframe.keyframeIndex] = {
                    ...newKeyframes[selectedKeyframe.keyframeIndex],
                    easing: e.target.value as Keyframe['easing']
                  }
                  return { ...t, keyframes: newKeyframes }
                }))
              }}
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
