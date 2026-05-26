'use client'

import { useRef, useState, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  TransformControls,
  PerspectiveCamera,
  OrthographicCamera,
  useGLTF,
  Html,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Center,
  Bounds,
} from '@react-three/drei'
import * as THREE from 'three'
import { 
  Box as BoxIcon, 
  Circle, 
  Cylinder, 
  Cone, 
  Triangle,
  Camera as CameraIcon,
  Move, 
  RotateCw, 
  Maximize2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Code2,
  FileJson,
  Sparkles,
  Layers,
  Sun,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

type SceneSource = 'r3f' | 'glb' | 'code' | 'json' | 'glsl' | 'css3d' | 'spline'
type TransformMode = 'translate' | 'rotate' | 'scale'
type GeometryType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'tetrahedron'

interface SceneObjectData {
  id: string
  name: string
  type: GeometryType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  opacity: number
  metalness: number
  roughness: number
  wireframe: boolean
  visible: boolean
}

// ============================================================================
// DEFAULT SCENES
// ============================================================================

const defaultObjects: SceneObjectData[] = [
  {
    id: 'obj-1',
    name: 'Cube',
    type: 'box',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: '#22c55e',
    opacity: 1,
    metalness: 0.3,
    roughness: 0.4,
    wireframe: false,
    visible: true,
  },
  {
    id: 'obj-2',
    name: 'Sphere',
    type: 'sphere',
    position: [2, 0, 0],
    rotation: [0, 0, 0],
    scale: [0.7, 0.7, 0.7],
    color: '#3b82f6',
    opacity: 1,
    metalness: 0.5,
    roughness: 0.2,
    wireframe: false,
    visible: true,
  },
  {
    id: 'obj-3',
    name: 'Torus',
    type: 'torus',
    position: [-2, 0, 0],
    rotation: [0, 0, 0],
    scale: [0.7, 0.7, 0.7],
    color: '#f97316',
    opacity: 1,
    metalness: 0.4,
    roughness: 0.3,
    wireframe: false,
    visible: true,
  },
]

const defaultJSONScene = JSON.stringify({
  objects: [
    { type: 'box', position: [0, 0, 0], color: '#22c55e' },
    { type: 'sphere', position: [2, 0, 0], color: '#3b82f6' },
    { type: 'cone', position: [-2, 0, 0], color: '#f43f5e' },
  ]
}, null, 2)

const defaultCodeScene = `// React Three Fiber scene
// Edit and click "Run" to update
function Scene() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[2, 0, 0]} rotation={[0, 0.5, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} />
      </mesh>
    </group>
  )
}`

const defaultGLSLShader = `// Fragment shader
uniform float uTime;
varying vec2 vUv;

void main() {
  vec3 color = 0.5 + 0.5 * cos(
    uTime + vUv.xyx + vec3(0.0, 2.0, 4.0)
  );
  gl_FragColor = vec4(color, 1.0);
}`

const defaultCSS3DContent = `<div style="
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #22c55e, #3b82f6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: sans-serif;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
">
  CSS3D
</div>`

// ============================================================================
// GEOMETRY HELPERS
// ============================================================================

function getGeometry(type: GeometryType) {
  switch (type) {
    case 'box': return <boxGeometry args={[1, 1, 1]} />
    case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />
    case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
    case 'cone': return <coneGeometry args={[0.5, 1, 32]} />
    case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />
    case 'plane': return <planeGeometry args={[1, 1]} />
    case 'tetrahedron': return <tetrahedronGeometry args={[0.7]} />
    default: return <boxGeometry args={[1, 1, 1]} />
  }
}

// ============================================================================
// SCENE OBJECTS
// ============================================================================

interface SceneMeshProps {
  data: SceneObjectData
  isSelected: boolean
  onSelect: () => void
}

function SceneMesh({ data, isSelected, onSelect }: SceneMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  if (!data.visible) return null

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      userData={{ id: data.id }}
    >
      {getGeometry(data.type)}
      <meshStandardMaterial
        color={data.color}
        opacity={data.opacity}
        transparent={data.opacity < 1}
        metalness={data.metalness}
        roughness={data.roughness}
        wireframe={data.wireframe}
        emissive={isSelected ? data.color : '#000000'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    </mesh>
  )
}

// ============================================================================
// GLB LOADER
// ============================================================================

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return (
    <Center>
      <Bounds fit clip observe margin={1.2}>
        <primitive object={scene.clone()} />
      </Bounds>
    </Center>
  )
}

// ============================================================================
// JSON SCENE
// ============================================================================

function JSONScene({ json }: { json: string }) {
  const objects = useMemo(() => {
    try {
      const parsed = JSON.parse(json)
      return parsed.objects || []
    } catch {
      return []
    }
  }, [json])

  return (
    <>
      {objects.map((obj: any, i: number) => (
        <mesh key={i} position={obj.position || [0, 0, 0]} rotation={obj.rotation || [0, 0, 0]}>
          {getGeometry(obj.type || 'box')}
          <meshStandardMaterial 
            color={obj.color || '#888'} 
            metalness={obj.metalness || 0.3}
            roughness={obj.roughness || 0.4}
          />
        </mesh>
      ))}
    </>
  )
}

// ============================================================================
// GLSL SHADER SCENE
// ============================================================================

function GLSLScene({ fragmentShader }: { fragmentShader: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const cleanShader = useMemo(() => {
    return fragmentShader.replace(/\/\/.*$/gm, '').trim()
  }, [fragmentShader])

  const shaderMaterial = useMemo(() => {
    try {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: cleanShader || `
          void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }
        `,
      })
    } catch {
      return new THREE.MeshBasicMaterial({ color: 'red' })
    }
  }, [cleanShader])

  useFrame((state) => {
    if (shaderMaterial instanceof THREE.ShaderMaterial && shaderMaterial.uniforms.uTime) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[1.2, 64, 64]} />
    </mesh>
  )
}

// ============================================================================
// CODE SCENE (parses simple R3F-like declarations)
// ============================================================================

function CodeScene({ code }: { code: string }) {
  // Parse simple mesh declarations from code
  const meshes = useMemo(() => {
    const results: any[] = []
    const meshRegex = /<mesh[^>]*position=\{?\[([^\]]+)\][^>]*>[\s\S]*?<(\w+Geometry)[^/>]*\/>[\s\S]*?color="([^"]+)"/g
    let match
    while ((match = meshRegex.exec(code)) !== null) {
      const position = match[1].split(',').map(s => parseFloat(s.trim()))
      const geomType = match[2].replace('Geometry', '').toLowerCase()
      const color = match[3]
      results.push({ position, type: geomType, color })
    }
    return results
  }, [code])

  if (meshes.length === 0) {
    return (
      <Html center>
        <div className="px-3 py-2 rounded bg-card text-card-foreground text-xs border border-border">
          No meshes parsed. Use mesh + geometry + color pattern.
        </div>
      </Html>
    )
  }

  return (
    <>
      {meshes.map((m, i) => (
        <mesh key={i} position={m.position}>
          {getGeometry(m.type as GeometryType)}
          <meshStandardMaterial color={m.color} metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
    </>
  )
}

// ============================================================================
// CSS3D / HTML SCENE
// ============================================================================

function CSS3DScene({ html }: { html: string }) {
  return (
    <Html
      transform
      occlude
      position={[0, 0, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Html>
  )
}

// ============================================================================
// SPLINE PLACEHOLDER
// ============================================================================

function SplineScene() {
  return (
    <Html center>
      <div className="px-4 py-3 rounded-lg bg-card border border-border text-card-foreground text-xs space-y-2 max-w-xs">
        <div className="font-bold text-sm">Spline Scene</div>
        <div className="text-muted-foreground">
          Paste a Spline URL to embed. Spline runtime requires the @splinetool/react-spline package.
        </div>
        <input 
          className="w-full px-2 py-1 rounded bg-input text-foreground text-xs border border-border"
          placeholder="https://prod.spline.design/..."
        />
      </div>
    </Html>
  )
}

// ============================================================================
// CAMERA SWITCHER
// ============================================================================

function ViewportCamera({ 
  type, 
  position 
}: { 
  type: 'perspective' | 'orthographic'
  position: [number, number, number]
}) {
  if (type === 'orthographic') {
    return (
      <OrthographicCamera 
        makeDefault
        position={position}
        zoom={80}
        near={0.1}
        far={1000}
      />
    )
  }
  return (
    <PerspectiveCamera 
      makeDefault
      position={position}
      fov={50}
      near={0.1}
      far={1000}
    />
  )
}

// ============================================================================
// MAIN VIEWPORT
// ============================================================================

export function R3FViewportContent() {
  const [source, setSource] = useState<SceneSource>('r3f')
  const [objects, setObjects] = useState<SceneObjectData[]>(defaultObjects)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [transformMode, setTransformMode] = useState<TransformMode>('translate')
  const [cameraType, setCameraType] = useState<'perspective' | 'orthographic'>('perspective')
  const [showGrid, setShowGrid] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [environment, setEnvironment] = useState<string>('city')
  
  // Source content
  const [glbUrl, setGlbUrl] = useState<string | null>(null)
  const [jsonContent, setJsonContent] = useState(defaultJSONScene)
  const [codeContent, setCodeContent] = useState(defaultCodeScene)
  const [glslContent, setGlslContent] = useState(defaultGLSLShader)
  const [css3dContent, setCss3dContent] = useState(defaultCSS3DContent)
  const [showSourceEditor, setShowSourceEditor] = useState(false)

  const selectedObject = objects.find(o => o.id === selectedId) || null
  const selectedMeshRef = useRef<THREE.Mesh>(null)

  const updateObject = (id: string, updates: Partial<SceneObjectData>) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
  }

  const addPrimitive = (type: GeometryType) => {
    const newObj: SceneObjectData = {
      id: `obj-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objects.length + 1}`,
      type,
      position: [Math.random() * 2 - 1, Math.random() * 2 - 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      opacity: 1,
      metalness: 0.3,
      roughness: 0.4,
      wireframe: false,
      visible: true,
    }
    setObjects(prev => [...prev, newObj])
    setSelectedId(newObj.id)
  }

  const duplicateSelected = () => {
    if (!selectedObject) return
    const newObj: SceneObjectData = {
      ...selectedObject,
      id: `obj-${Date.now()}`,
      name: `${selectedObject.name} Copy`,
      position: [
        selectedObject.position[0] + 0.5,
        selectedObject.position[1],
        selectedObject.position[2],
      ],
    }
    setObjects(prev => [...prev, newObj])
    setSelectedId(newObj.id)
  }

  const deleteSelected = () => {
    if (!selectedObject) return
    setObjects(prev => prev.filter(o => o.id !== selectedObject.id))
    setSelectedId(null)
  }

  const handleGLBUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setGlbUrl(url)
  }

  const sourceTabs: { id: SceneSource; label: string; icon: any }[] = [
    { id: 'r3f', label: 'R3F', icon: BoxIcon },
    { id: 'glb', label: 'GLB', icon: Upload },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'json', label: 'JSON', icon: FileJson },
    { id: 'glsl', label: 'GLSL', icon: Sparkles },
    { id: 'css3d', label: 'CSS3D', icon: Layers },
    { id: 'spline', label: 'Spline', icon: Sun },
  ]

  const renderScene = () => {
    switch (source) {
      case 'r3f':
        return objects.map(obj => (
          <SceneMesh
            key={obj.id}
            data={obj}
            isSelected={obj.id === selectedId}
            onSelect={() => setSelectedId(obj.id)}
          />
        ))
      case 'glb':
        return glbUrl ? (
          <Suspense fallback={null}>
            <GLBModel url={glbUrl} />
          </Suspense>
        ) : (
          <Html center>
            <div className="px-3 py-2 rounded bg-card border border-border text-xs">
              Upload a .glb or .gltf file
            </div>
          </Html>
        )
      case 'code':
        return <CodeScene code={codeContent} />
      case 'json':
        return <JSONScene json={jsonContent} />
      case 'glsl':
        return <GLSLScene fragmentShader={glslContent} />
      case 'css3d':
        return <CSS3DScene html={css3dContent} />
      case 'spline':
        return <SplineScene />
    }
  }

  const getEditorContent = () => {
    switch (source) {
      case 'glb':
        return null
      case 'code':
        return { value: codeContent, set: setCodeContent, lang: 'tsx' }
      case 'json':
        return { value: jsonContent, set: setJsonContent, lang: 'json' }
      case 'glsl':
        return { value: glslContent, set: setGlslContent, lang: 'glsl' }
      case 'css3d':
        return { value: css3dContent, set: setCss3dContent, lang: 'html' }
      default:
        return null
    }
  }

  const editor = getEditorContent()
  const isEditableSource = source !== 'r3f' && source !== 'glb' && source !== 'spline'

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Source Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-card">
        {sourceTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSource(tab.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                source === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          )
        })}
        <div className="flex-1" />
        {source === 'glb' && (
          <label className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
            <Upload className="w-3 h-3" />
            Upload GLB
            <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleGLBUpload} />
          </label>
        )}
        {isEditableSource && (
          <button
            onClick={() => setShowSourceEditor(!showSourceEditor)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
              showSourceEditor 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Code2 className="w-3 h-3" />
            Source
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-card/50">
        {/* Transform modes */}
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-muted">
          <button
            onClick={() => setTransformMode('translate')}
            className={cn(
              "p-1 rounded transition-colors",
              transformMode === 'translate' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Translate"
          >
            <Move className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTransformMode('rotate')}
            className={cn(
              "p-1 rounded transition-colors",
              transformMode === 'rotate' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Rotate"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTransformMode('scale')}
            className={cn(
              "p-1 rounded transition-colors",
              transformMode === 'scale' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Scale"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Camera type */}
        <button
          onClick={() => setCameraType(cameraType === 'perspective' ? 'orthographic' : 'perspective')}
          className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Toggle camera"
        >
          <CameraIcon className="w-3 h-3" />
          {cameraType === 'perspective' ? 'Persp' : 'Ortho'}
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Add primitives (only for R3F mode) */}
        {source === 'r3f' && (
          <>
            <div className="flex items-center gap-0.5">
              <button onClick={() => addPrimitive('box')} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground" title="Add Box">
                <BoxIcon className="w-3 h-3" />
              </button>
              <button onClick={() => addPrimitive('sphere')} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground" title="Add Sphere">
                <Circle className="w-3 h-3" />
              </button>
              <button onClick={() => addPrimitive('cylinder')} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground" title="Add Cylinder">
                <Cylinder className="w-3 h-3" />
              </button>
              <button onClick={() => addPrimitive('cone')} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground" title="Add Cone">
                <Cone className="w-3 h-3" />
              </button>
              <button onClick={() => addPrimitive('torus')} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground" title="Add Torus">
                <Triangle className="w-3 h-3" />
              </button>
            </div>

            <div className="w-px h-4 bg-border mx-1" />

            <button
              onClick={duplicateSelected}
              disabled={!selectedObject}
              className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedObject}
              className="p-1 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            "p-1 rounded transition-colors",
            showGrid ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted"
          )}
          title="Toggle grid"
        >
          <Layers className="w-3 h-3" />
        </button>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={cn(
            "p-1 rounded transition-colors",
            showSidebar ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted"
          )}
          title="Toggle sidebar"
        >
          {showSidebar ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source Editor Panel */}
        {showSourceEditor && editor && (
          <div className="w-1/2 border-r border-border flex flex-col bg-card">
            <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground border-b border-border bg-muted/50">
              {editor.lang.toUpperCase()}
            </div>
            <textarea
              value={editor.value}
              onChange={(e) => editor.set(e.target.value)}
              className="flex-1 p-2 bg-transparent text-foreground font-mono text-[11px] resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Viewport */}
        <div className="flex-1 relative bg-black/40">
          <Canvas
            key={source}
            gl={{ alpha: false, antialias: true }}
            style={{ background: 'linear-gradient(180deg, #0a0a14 0%, #1a1a2e 100%)' }}
          >
            <ViewportCamera type={cameraType} position={[3, 3, 5]} />

            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1} 
            />
            <pointLight position={[-5, 3, -5]} intensity={0.4} color="#22c55e" />

            {showGrid && source !== 'glsl' && source !== 'css3d' && (
              <Grid
                args={[20, 20]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#444"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#666"
                fadeDistance={20}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid
              />
            )}

            <Suspense fallback={null}>
              {renderScene()}
            </Suspense>

            {/* Transform controls for selected object (R3F mode only) */}
            {source === 'r3f' && selectedObject && (
              <TransformControlsWrapper
                object={selectedObject}
                mode={transformMode}
                onUpdate={(updates) => updateObject(selectedObject.id, updates)}
              />
            )}

            <OrbitControls 
              makeDefault
              enableZoom 
              enablePan 
              enableRotate 
              minDistance={1}
              maxDistance={50}
            />

            {source !== 'glsl' && (
              <Suspense fallback={null}>
                <Environment preset={environment as any} />
              </Suspense>
            )}

            <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
              <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
          </Canvas>

          {/* Bottom HUD */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 pointer-events-none">
            <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white/70 font-mono">
              {cameraType.toUpperCase()} | LMB: Orbit | RMB: Pan | Wheel: Zoom
            </div>
          </div>
          <div className="absolute top-2 left-2 pointer-events-none">
            <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white/70 font-mono">
              {source.toUpperCase()} | {source === 'r3f' ? `${objects.length} objects` : 'live source'}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Object list & properties */}
        {showSidebar && source === 'r3f' && (
          <div className="w-48 border-l border-border bg-card flex flex-col">
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground border-b border-border uppercase tracking-wide">
              Scene Graph
            </div>
            <div className="flex-1 overflow-y-auto">
              {objects.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-2 py-1 text-left text-[11px] transition-colors cursor-pointer",
                    obj.id === selectedId 
                      ? "bg-primary/20 text-foreground border-l-2 border-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                  )}
                >
                  <BoxIcon className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="flex-1 truncate">{obj.name}</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateObject(obj.id, { visible: !obj.visible })
                    }}
                    className="p-0.5 cursor-pointer"
                  >
                    {obj.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 opacity-50" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Property editor */}
            {selectedObject && (
              <div className="border-t border-border p-2 space-y-1.5 max-h-72 overflow-y-auto">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Properties
                </div>

                <PropRow label="Name">
                  <input
                    value={selectedObject.name}
                    onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
                    className="w-full px-1 py-0.5 bg-input rounded text-[10px] text-foreground border border-border outline-none focus:border-primary"
                  />
                </PropRow>

                <PropRow label="Color">
                  <input
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
                    className="w-full h-5 rounded cursor-pointer bg-transparent border border-border"
                  />
                </PropRow>

                <Vec3Input
                  label="Position"
                  value={selectedObject.position}
                  onChange={(v) => updateObject(selectedObject.id, { position: v })}
                />
                <Vec3Input
                  label="Rotation"
                  value={selectedObject.rotation}
                  onChange={(v) => updateObject(selectedObject.id, { rotation: v })}
                />
                <Vec3Input
                  label="Scale"
                  value={selectedObject.scale}
                  onChange={(v) => updateObject(selectedObject.id, { scale: v })}
                />

                <SliderRow
                  label="Opacity"
                  value={selectedObject.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateObject(selectedObject.id, { opacity: v })}
                />
                <SliderRow
                  label="Metalness"
                  value={selectedObject.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateObject(selectedObject.id, { metalness: v })}
                />
                <SliderRow
                  label="Roughness"
                  value={selectedObject.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateObject(selectedObject.id, { roughness: v })}
                />

                <PropRow label="Wireframe">
                  <input
                    type="checkbox"
                    checked={selectedObject.wireframe}
                    onChange={(e) => updateObject(selectedObject.id, { wireframe: e.target.checked })}
                    className="ml-auto"
                  />
                </PropRow>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TRANSFORM CONTROLS WRAPPER
// ============================================================================

function TransformControlsWrapper({ 
  object, 
  mode, 
  onUpdate 
}: { 
  object: SceneObjectData
  mode: TransformMode
  onUpdate: (updates: Partial<SceneObjectData>) => void
}) {
  const { scene } = useThree()
  const [target, setTarget] = useState<THREE.Object3D | null>(null)

  useEffect(() => {
    let found: THREE.Object3D | null = null
    scene.traverse((child) => {
      if (child.userData?.id === object.id) {
        found = child
      }
    })
    setTarget(found)
  }, [scene, object.id])

  if (!target) return null

  return (
    <TransformControls
      object={target}
      mode={mode}
      onObjectChange={() => {
        if (!target) return
        onUpdate({
          position: [target.position.x, target.position.y, target.position.z],
          rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
          scale: [target.scale.x, target.scale.y, target.scale.z],
        })
      }}
    />
  )
}

// ============================================================================
// PROPERTY EDITORS
// ============================================================================

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Vec3Input({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: [number, number, number]
  onChange: (v: [number, number, number]) => void
}) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} className="flex items-center gap-1 bg-input rounded px-1 border border-border">
            <span className="text-[9px] text-muted-foreground">{axis}</span>
            <input
              type="number"
              step={0.1}
              value={value[i].toFixed(2)}
              onChange={(e) => {
                const newVal = [...value] as [number, number, number]
                newVal[i] = parseFloat(e.target.value) || 0
                onChange(newVal)
              }}
              className="w-full bg-transparent text-[10px] text-foreground outline-none py-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function SliderRow({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange 
}: { 
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] text-foreground font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary"
      />
    </div>
  )
}
