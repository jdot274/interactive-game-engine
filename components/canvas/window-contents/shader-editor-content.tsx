'use client'

import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, Copy, Check } from 'lucide-react'

const defaultVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const defaultFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec2 uv = vUv;
  
  // Animated gradient
  vec3 color1 = vec3(0.1, 0.4, 0.8);
  vec3 color2 = vec3(0.8, 0.2, 0.5);
  
  float wave = sin(uv.x * 10.0 + uTime) * 0.5 + 0.5;
  vec3 color = mix(color1, color2, wave * uv.y);
  
  gl_FragColor = vec4(color, 1.0);
}
`

function ShaderPreview({ vertexShader, fragmentShader }: { vertexShader: string; fragmentShader: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 3, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
      />
    </mesh>
  )
}

export function ShaderEditorContent() {
  const [activeTab, setActiveTab] = useState<'vertex' | 'fragment'>('fragment')
  const [vertexShader, setVertexShader] = useState(defaultVertexShader.trim())
  const [fragmentShader, setFragmentShader] = useState(defaultFragmentShader.trim())
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const code = activeTab === 'vertex' ? vertexShader : fragmentShader
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetShaders = () => {
    setVertexShader(defaultVertexShader.trim())
    setFragmentShader(defaultFragmentShader.trim())
    setError(null)
  }

  const loadPreset = (preset: string) => {
    switch (preset) {
      case 'noise':
        setFragmentShader(`
uniform float uTime;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv * 5.0;
  float n = noise(uv + uTime * 0.5);
  vec3 color = vec3(n * 0.5, n * 0.8, n);
  gl_FragColor = vec4(color, 1.0);
}`.trim())
        break
      case 'plasma':
        setFragmentShader(`
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float t = uTime * 0.5;
  
  float v1 = sin(uv.x * 5.0 + t);
  float v2 = sin((uv.y * 5.0 + t) * 0.7);
  float v3 = sin((uv.x + uv.y) * 5.0 + t);
  float v4 = sin(length(uv) * 7.0 - t);
  
  float v = (v1 + v2 + v3 + v4) * 0.25;
  
  vec3 color = vec3(
    sin(v * 3.14159 + 0.0) * 0.5 + 0.5,
    sin(v * 3.14159 + 2.094) * 0.5 + 0.5,
    sin(v * 3.14159 + 4.188) * 0.5 + 0.5
  );
  
  gl_FragColor = vec4(color, 1.0);
}`.trim())
        break
      case 'circles':
        setFragmentShader(`
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float d = length(uv);
  float rings = sin(d * 20.0 - uTime * 3.0) * 0.5 + 0.5;
  vec3 color = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.8, 1.0), rings);
  gl_FragColor = vec4(color, 1.0);
}`.trim())
        break
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/50">
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'vertex' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('vertex')}
            className="text-xs"
          >
            Vertex
          </Button>
          <Button
            variant={activeTab === 'fragment' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('fragment')}
            className="text-xs"
          >
            Fragment
          </Button>
        </div>
        <div className="w-px h-5 bg-border" />
        <span className="text-xs text-muted-foreground">Presets:</span>
        <Button variant="outline" size="sm" onClick={() => loadPreset('noise')} className="text-xs h-6">
          Noise
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadPreset('plasma')} className="text-xs h-6">
          Plasma
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadPreset('circles')} className="text-xs h-6">
          Circles
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs gap-1">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="ghost" size="sm" onClick={resetShaders} className="text-xs gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          <textarea
            value={activeTab === 'vertex' ? vertexShader : fragmentShader}
            onChange={(e) => {
              if (activeTab === 'vertex') {
                setVertexShader(e.target.value)
              } else {
                setFragmentShader(e.target.value)
              }
            }}
            className="flex-1 p-3 bg-[#0a0a14] text-[#e0e0e0] font-mono text-xs resize-none focus:outline-none"
            spellCheck={false}
          />
          {error && (
            <div className="p-2 bg-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="w-48 flex-shrink-0 bg-black">
          <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
            <ShaderPreview vertexShader={vertexShader} fragmentShader={fragmentShader} />
          </Canvas>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 border-t border-border text-xs text-muted-foreground">
        <span>GLSL {activeTab === 'vertex' ? 'Vertex' : 'Fragment'} Shader</span>
        <span>uniforms: uTime, uResolution</span>
      </div>
    </div>
  )
}
