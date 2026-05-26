'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

function RotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#22c55e" 
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </Float>
  )
}

function FloatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[1.5, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color="#3b82f6" 
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  )
}

function Torus() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.z += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[-1.5, 0, 0]}>
      <torusGeometry args={[0.4, 0.15, 16, 32]} />
      <meshStandardMaterial 
        color="#f97316" 
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  )
}

export function R3FViewportContent() {
  return (
    <div className="w-full h-full bg-black/20">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
        
        <RotatingBox />
        <FloatingSphere />
        <Torus />
        
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Regular.ttf"
        >
          R3F Viewport
        </Text>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />
        
        <Environment preset="city" />
      </Canvas>
      
      {/* Viewport Controls Overlay */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="px-2 py-1 bg-black/50 rounded text-[10px] text-white/70">
          Orbit: LMB | Pan: RMB | Zoom: Scroll
        </div>
      </div>
    </div>
  )
}
