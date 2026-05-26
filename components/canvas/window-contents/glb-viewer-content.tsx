'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Center, useGLTF, Html, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Upload, RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react'

interface ModelProps {
  url: string
  wireframe: boolean
}

function Model({ url, wireframe }: ModelProps) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  // Clone scene and apply wireframe if needed
  const clonedScene = scene.clone()
  if (wireframe) {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: '#22c55e',
          wireframe: true,
        })
      }
    })
  }

  return (
    <Center>
      <primitive ref={modelRef} object={clonedScene} />
    </Center>
  )
}

function Placeholder() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
      <meshStandardMaterial 
        color="#ec4899" 
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground">Loading model...</span>
      </div>
    </Html>
  )
}

export function GLBViewerContent() {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setModelUrl(url)
    }
  }

  const loadSampleModel = () => {
    setModelUrl('/assets/3d/duck.glb')
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/20">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/50">
        <input
          type="file"
          ref={fileInputRef}
          accept=".glb,.gltf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1 text-xs"
        >
          <Upload className="w-3 h-3" />
          Upload GLB
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadSampleModel}
          className="text-xs"
        >
          Load Sample
        </Button>
        <div className="w-px h-5 bg-border" />
        <Button
          variant={wireframe ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setWireframe(!wireframe)}
          className="text-xs gap-1"
        >
          {wireframe ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Wireframe
        </Button>
        <Button
          variant={showGrid ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="text-xs"
        >
          Grid
        </Button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [3, 3, 3], fov: 50 }}
          style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ec4899" />
          
          <Suspense fallback={<LoadingFallback />}>
            {modelUrl ? (
              <Model url={modelUrl} wireframe={wireframe} />
            ) : (
              <Placeholder />
            )}
          </Suspense>
          
          {showGrid && (
            <Grid
              position={[0, -1, 0]}
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#333"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#666"
              fadeDistance={10}
              fadeStrength={1}
              infiniteGrid
            />
          )}
          
          <OrbitControls 
            enableZoom
            enablePan
            enableRotate
            minDistance={1}
            maxDistance={20}
          />
          
          <Environment preset="studio" />
        </Canvas>
        
        {!modelUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Drop a GLB/GLTF file or click Upload
              </p>
              <p className="text-xs text-muted-foreground/60">
                Supports .glb and .gltf formats
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 border-t border-border text-xs text-muted-foreground">
        <span>Orbit: LMB | Pan: RMB | Zoom: Scroll</span>
        {modelUrl && <span className="text-primary">Model loaded</span>}
      </div>
    </div>
  )
}
