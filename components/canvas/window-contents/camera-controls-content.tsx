'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Environment, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { Camera, Video, Focus, Move3d } from 'lucide-react'

function SceneContent({ cameraType, fov, zoom }: { cameraType: 'perspective' | 'orthographic', fov: number, zoom: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Sample scene objects */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.5} />
      </mesh>
      
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.3} />
      </mesh>
      
      <mesh position={[-2, 0, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.4} />
      </mesh>
      
      <Grid
        position={[0, -0.5, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#333"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#555"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid
      />
      
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        font="/fonts/Geist-Regular.ttf"
      >
        {cameraType === 'perspective' ? `Perspective (FOV: ${fov})` : `Orthographic (Zoom: ${zoom}x)`}
      </Text>
      
      <OrbitControls makeDefault />
      <Environment preset="city" />
    </>
  )
}

export function CameraControlsContent() {
  const { cameraSettings, setCameraSettings } = useCanvasStore()
  const [localFov, setLocalFov] = useState(cameraSettings.fov)
  const [localZoom, setLocalZoom] = useState(cameraSettings.zoom)

  const handleCameraTypeChange = (type: 'perspective' | 'orthographic') => {
    setCameraSettings({ type })
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/20">
      {/* Controls Panel */}
      <div className="p-3 border-b border-border bg-secondary/50 space-y-3">
        {/* Camera Type Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Camera:</span>
          <div className="flex gap-1 flex-1">
            <Button
              variant={cameraSettings.type === 'perspective' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleCameraTypeChange('perspective')}
              className="flex-1 gap-1 text-xs"
            >
              <Video className="w-3 h-3" />
              Perspective
            </Button>
            <Button
              variant={cameraSettings.type === 'orthographic' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleCameraTypeChange('orthographic')}
              className="flex-1 gap-1 text-xs"
            >
              <Move3d className="w-3 h-3" />
              Orthographic
            </Button>
          </div>
        </div>

        {/* FOV / Zoom Control */}
        {cameraSettings.type === 'perspective' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">FOV:</span>
            <input
              type="range"
              min="20"
              max="120"
              value={localFov}
              onChange={(e) => {
                const val = Number(e.target.value)
                setLocalFov(val)
                setCameraSettings({ fov: val })
              }}
              className="flex-1 accent-primary"
            />
            <span className="text-xs text-foreground w-10">{localFov}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">Zoom:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={localZoom}
              onChange={(e) => {
                const val = Number(e.target.value)
                setLocalZoom(val)
                setCameraSettings({ zoom: val })
              }}
              className="flex-1 accent-primary"
            />
            <span className="text-xs text-foreground w-10">{localZoom.toFixed(1)}x</span>
          </div>
        )}

        {/* Near/Far Clipping */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Near:</span>
          <input
            type="range"
            min="0.01"
            max="10"
            step="0.01"
            value={cameraSettings.near}
            onChange={(e) => setCameraSettings({ near: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="text-xs text-foreground w-10">{cameraSettings.near.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Far:</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="10"
            value={cameraSettings.far}
            onChange={(e) => setCameraSettings({ far: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="text-xs text-foreground w-10">{cameraSettings.far}</span>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Presets:</span>
          <div className="flex gap-1 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCameraSettings({ type: 'perspective', fov: 50, near: 0.1, far: 1000 })
                setLocalFov(50)
              }}
              className="text-xs"
            >
              Default
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCameraSettings({ type: 'perspective', fov: 24, near: 0.1, far: 1000 })
                setLocalFov(24)
              }}
              className="text-xs"
            >
              Cinematic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCameraSettings({ type: 'orthographic', zoom: 2, near: 0.1, far: 1000 })
                setLocalZoom(2)
              }}
              className="text-xs"
            >
              Isometric
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 relative">
        <Canvas style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
          {cameraSettings.type === 'perspective' ? (
            <PerspectiveCamera
              makeDefault
              position={[5, 5, 5]}
              fov={localFov}
              near={cameraSettings.near}
              far={cameraSettings.far}
            />
          ) : (
            <OrthographicCamera
              makeDefault
              position={[5, 5, 5]}
              zoom={localZoom * 50}
              near={cameraSettings.near}
              far={cameraSettings.far}
            />
          )}
          <SceneContent cameraType={cameraSettings.type} fov={localFov} zoom={localZoom} />
        </Canvas>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 border-t border-border text-xs text-muted-foreground">
        <span>
          <Camera className="w-3 h-3 inline mr-1" />
          {cameraSettings.type === 'perspective' ? 'Perspective' : 'Orthographic'}
        </span>
        <span>Clipping: {cameraSettings.near} - {cameraSettings.far}</span>
      </div>
    </div>
  )
}
