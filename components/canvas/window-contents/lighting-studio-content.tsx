'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text, Sphere, Box } from '@react-three/drei'
import * as THREE from 'three'
import { useCanvasStore, type LightSettings } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { Sun, Lightbulb, Globe, Plus, Trash2 } from 'lucide-react'

const environmentPresets = [
  'apartment', 'city', 'dawn', 'forest', 'lobby', 
  'night', 'park', 'studio', 'sunset', 'warehouse'
] as const

function LightingScene({ settings }: { settings: LightSettings }) {
  return (
    <>
      <ambientLight intensity={settings.ambient.intensity} color={settings.ambient.color} />
      <directionalLight 
        position={settings.directional.position} 
        intensity={settings.directional.intensity} 
        color={settings.directional.color}
        castShadow
      />
      {settings.point.map((light, i) => (
        <pointLight 
          key={i}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
        />
      ))}
      
      {/* Sample objects to show lighting */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      </Float>
      
      <Box args={[0.8, 0.8, 0.8]} position={[-1.5, -0.2, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
      </Box>
      
      <Box args={[0.8, 0.8, 0.8]} position={[1.5, -0.2, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
      </Box>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      <OrbitControls />
      <Environment preset={settings.environment as typeof environmentPresets[number]} />
    </>
  )
}

export function LightingStudioContent() {
  const { lightSettings, setLightSettings } = useCanvasStore()
  const [activeTab, setActiveTab] = useState<'ambient' | 'directional' | 'point' | 'environment'>('ambient')

  const updateAmbient = (updates: Partial<typeof lightSettings.ambient>) => {
    setLightSettings({ ambient: { ...lightSettings.ambient, ...updates } })
  }

  const updateDirectional = (updates: Partial<typeof lightSettings.directional>) => {
    setLightSettings({ directional: { ...lightSettings.directional, ...updates } })
  }

  const addPointLight = () => {
    setLightSettings({
      point: [...lightSettings.point, { 
        intensity: 0.5, 
        color: '#ffffff', 
        position: [Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2] 
      }]
    })
  }

  const removePointLight = (index: number) => {
    setLightSettings({
      point: lightSettings.point.filter((_, i) => i !== index)
    })
  }

  const updatePointLight = (index: number, updates: Partial<typeof lightSettings.point[0]>) => {
    setLightSettings({
      point: lightSettings.point.map((light, i) => 
        i === index ? { ...light, ...updates } : light
      )
    })
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/20">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/50">
        {(['ambient', 'directional', 'point', 'environment'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="text-xs capitalize"
          >
            {tab === 'ambient' && <Sun className="w-3 h-3 mr-1" />}
            {tab === 'directional' && <Sun className="w-3 h-3 mr-1" />}
            {tab === 'point' && <Lightbulb className="w-3 h-3 mr-1" />}
            {tab === 'environment' && <Globe className="w-3 h-3 mr-1" />}
            {tab}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-border bg-card space-y-3 max-h-40 overflow-y-auto">
        {activeTab === 'ambient' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Intensity:</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightSettings.ambient.intensity}
                onChange={(e) => updateAmbient({ intensity: Number(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs w-8">{lightSettings.ambient.intensity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Color:</span>
              <input
                type="color"
                value={lightSettings.ambient.color}
                onChange={(e) => updateAmbient({ color: e.target.value })}
                className="w-8 h-6 rounded border-none cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">{lightSettings.ambient.color}</span>
            </div>
          </>
        )}

        {activeTab === 'directional' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Intensity:</span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={lightSettings.directional.intensity}
                onChange={(e) => updateDirectional({ intensity: Number(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs w-8">{lightSettings.directional.intensity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Color:</span>
              <input
                type="color"
                value={lightSettings.directional.color}
                onChange={(e) => updateDirectional({ color: e.target.value })}
                className="w-8 h-6 rounded border-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Position X:</span>
              <input
                type="range"
                min="-20"
                max="20"
                value={lightSettings.directional.position[0]}
                onChange={(e) => updateDirectional({ 
                  position: [Number(e.target.value), lightSettings.directional.position[1], lightSettings.directional.position[2]]
                })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs w-8">{lightSettings.directional.position[0]}</span>
            </div>
          </>
        )}

        {activeTab === 'point' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{lightSettings.point.length} point lights</span>
              <Button variant="outline" size="sm" onClick={addPointLight} className="text-xs gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            {lightSettings.point.map((light, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <input
                  type="color"
                  value={light.color}
                  onChange={(e) => updatePointLight(i, { color: e.target.value })}
                  className="w-6 h-5 rounded border-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={light.intensity}
                  onChange={(e) => updatePointLight(i, { intensity: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs w-6">{light.intensity.toFixed(1)}</span>
                <Button variant="ghost" size="sm" onClick={() => removePointLight(i)} className="p-1 h-auto">
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </>
        )}

        {activeTab === 'environment' && (
          <div className="grid grid-cols-2 gap-1">
            {environmentPresets.map((preset) => (
              <Button
                key={preset}
                variant={lightSettings.environment === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLightSettings({ environment: preset })}
                className="text-xs capitalize"
              >
                {preset}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1">
        <Canvas 
          shadows
          camera={{ position: [4, 4, 4], fov: 45 }}
          style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}
        >
          <LightingScene settings={lightSettings} />
        </Canvas>
      </div>
    </div>
  )
}
