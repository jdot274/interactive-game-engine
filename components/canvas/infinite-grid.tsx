'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCanvasStore } from '@/lib/canvas-store'

export function InfiniteGrid() {
  const gridRef = useRef<THREE.GridHelper>(null)
  const { gridVisible, gridSize } = useCanvasStore()

  useFrame(({ camera }) => {
    if (gridRef.current) {
      // Follow camera but stay at y=0
      gridRef.current.position.x = Math.round(camera.position.x / gridSize) * gridSize
      gridRef.current.position.z = Math.round(camera.position.z / gridSize) * gridSize
    }
  })

  const gridMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0x2a2a3e,
      transparent: true,
      opacity: 0.4,
    })
  }, [])

  if (!gridVisible) return null

  return (
    <group>
      {/* Main grid */}
      <gridHelper
        ref={gridRef}
        args={[100, 100, 0x3a3a4e, 0x1a1a2e]}
        position={[0, -5, 0]}
        rotation={[0, 0, 0]}
      />
      {/* Subtle glow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.01, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial 
          color={0x0a0a14} 
          transparent 
          opacity={0.95}
        />
      </mesh>
    </group>
  )
}
