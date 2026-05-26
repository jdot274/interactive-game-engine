'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useCanvasStore } from '@/lib/canvas-store'
import { InfiniteGrid } from './infinite-grid'
import { CanvasWindowComponent } from './canvas-window'

/**
 * Full 3D camera controller.
 * - Right mouse drag        -> orbit around target
 * - Middle mouse / Alt+drag -> pan target
 * - Wheel                   -> dolly (zoom toward/away from target)
 */
function CameraController() {
  const { camera, gl } = useThree()
  const { setCameraPosition } = useCanvasStore()

  // Spherical coords around a moving target
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const spherical = useRef(new THREE.Spherical(20, Math.PI / 2.4, 0))
  const desiredSpherical = useRef(new THREE.Spherical(20, Math.PI / 2.4, 0))
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0))

  const mode = useRef<'idle' | 'orbit' | 'pan'>('idle')
  const last = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const dom = gl.domElement

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = Math.exp(e.deltaY * 0.001)
      desiredSpherical.current.radius = THREE.MathUtils.clamp(
        desiredSpherical.current.radius * factor,
        2,
        200
      )
    }

    const onDown = (e: MouseEvent) => {
      if (e.button === 2) {
        mode.current = 'orbit'
      } else if (e.button === 1 || (e.button === 0 && e.altKey)) {
        mode.current = 'pan'
      } else {
        return
      }
      last.current = { x: e.clientX, y: e.clientY }
      dom.style.cursor = mode.current === 'orbit' ? 'grab' : 'grabbing'
    }

    const onMove = (e: MouseEvent) => {
      if (mode.current === 'idle') return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }

      if (mode.current === 'orbit') {
        desiredSpherical.current.theta -= dx * 0.005
        desiredSpherical.current.phi = THREE.MathUtils.clamp(
          desiredSpherical.current.phi - dy * 0.005,
          0.1,
          Math.PI - 0.1
        )
      } else if (mode.current === 'pan') {
        const panSpeed = desiredSpherical.current.radius * 0.0015
        const right = new THREE.Vector3()
        const up = new THREE.Vector3()
        camera.matrix.extractBasis(right, up, new THREE.Vector3())
        desiredTarget.current.addScaledVector(right, -dx * panSpeed)
        desiredTarget.current.addScaledVector(up, dy * panSpeed)
      }
    }

    const onUp = () => {
      mode.current = 'idle'
      dom.style.cursor = 'default'
    }

    const onContext = (e: MouseEvent) => e.preventDefault()

    dom.addEventListener('wheel', onWheel, { passive: false })
    dom.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    dom.addEventListener('contextmenu', onContext)

    return () => {
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      dom.removeEventListener('contextmenu', onContext)
    }
  }, [camera, gl.domElement])

  useFrame(() => {
    // Smoothly approach desired spherical/target
    spherical.current.radius = THREE.MathUtils.lerp(
      spherical.current.radius,
      desiredSpherical.current.radius,
      0.15
    )
    spherical.current.theta = THREE.MathUtils.lerp(
      spherical.current.theta,
      desiredSpherical.current.theta,
      0.2
    )
    spherical.current.phi = THREE.MathUtils.lerp(
      spherical.current.phi,
      desiredSpherical.current.phi,
      0.2
    )
    target.current.lerp(desiredTarget.current, 0.2)

    const offset = new THREE.Vector3().setFromSpherical(spherical.current)
    camera.position.copy(target.current).add(offset)
    camera.lookAt(target.current)

    setCameraPosition([camera.position.x, camera.position.y, camera.position.z])
  })

  return null
}

function SceneContent() {
  const { windows } = useCanvasStore()

  return (
    <>
      <PerspectiveCamera makeDefault fov={45} position={[0, 0, 20]} near={0.1} far={500} />
      <CameraController />
      <InfiniteGrid />

      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-15, -10, -10]} intensity={0.3} color="#6366f1" />

      <Stars
        radius={150}
        depth={80}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Render all windows - they billboard toward the camera and layer in Z */}
      {windows.map((window) => (
        <CanvasWindowComponent key={window.id} window={window} />
      ))}
    </>
  )
}

export function InfiniteCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas
        style={{
          background:
            'radial-gradient(ellipse at center, #12121f 0%, #0a0a14 60%, #050509 100%)',
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
