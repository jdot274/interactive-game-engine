'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useCanvasStore } from '@/lib/canvas-store'
import { InfiniteGrid } from './infinite-grid'
import { CanvasWindowComponent } from './canvas-window'

function CameraController() {
  const { camera, gl } = useThree()
  const { setCameraPosition, setZoom, zoom } = useCanvasStore()
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = gl.domElement

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY * 0.001
      const newZoom = Math.max(0.1, Math.min(5, zoom - delta))
      setZoom(newZoom)
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Middle mouse or alt+left mouse for panning
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        isDragging.current = true
        lastMouse.current = { x: e.clientX, y: e.clientY }
        canvas.style.cursor = 'grabbing'
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = (e.clientX - lastMouse.current.x) * 0.05 / zoom
      const deltaY = (e.clientY - lastMouse.current.y) * 0.05 / zoom
      
      camera.position.x -= deltaX
      camera.position.y += deltaY
      
      setCameraPosition([camera.position.x, camera.position.y, camera.position.z])
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      canvas.style.cursor = 'default'
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [camera, gl.domElement, setCameraPosition, setZoom, zoom])

  useFrame(() => {
    // Apply zoom smoothly
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom * 50, 0.1)
    camera.updateProjectionMatrix()
  })

  return null
}

function SceneContent() {
  const { windows } = useCanvasStore()

  return (
    <>
      <CameraController />
      <InfiniteGrid />
      
      {/* Ambient scene lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Stars background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Render all windows */}
      {windows.map((window) => (
        <CanvasWindowComponent key={window.id} window={window} />
      ))}
    </>
  )
}

export function InfiniteCanvas() {
  const { cameraPosition } = useCanvasStore()

  return (
    <div className="w-full h-full">
      <Canvas
        orthographic
        camera={{
          zoom: 50,
          position: cameraPosition,
          near: 0.1,
          far: 1000,
        }}
        style={{ 
          background: 'linear-gradient(180deg, #0a0a14 0%, #12121f 50%, #0a0a14 100%)'
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
