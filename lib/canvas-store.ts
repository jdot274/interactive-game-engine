import { create } from 'zustand'

export type WindowType = 
  | 'react' 
  | 'r3f' 
  | 'drei' 
  | 'threejs' 
  | 'code-editor'
  | 'console'
  | 'inspector'
  | 'scene-graph'
  | 'assets'
  | 'glb-viewer'
  | 'camera-controls'
  | 'lighting-studio'
  | 'animation-timeline'
  | 'node-editor'
  | 'shader-editor'
  | 'performance-monitor'

export interface Tool {
  id: string
  type: WindowType
  name: string
  description: string
  category: 'core' | 'graphics' | 'animation' | 'utility' | 'experimental'
  icon: string
  color: string
  defaultSize: [number, number]
}

export const TOOLS: Tool[] = [
  // Core Tools
  {
    id: 'code-editor',
    type: 'code-editor',
    name: 'Code Editor',
    description: 'TypeScript/React code editor with syntax highlighting',
    category: 'core',
    icon: 'code',
    color: '#3b82f6',
    defaultSize: [450, 350],
  },
  {
    id: 'console',
    type: 'console',
    name: 'Console',
    description: 'Runtime console with logs and command input',
    category: 'core',
    icon: 'terminal',
    color: '#22c55e',
    defaultSize: [400, 220],
  },
  {
    id: 'inspector',
    type: 'inspector',
    name: 'Inspector',
    description: 'Scene graph inspector and property editor',
    category: 'core',
    icon: 'search',
    color: '#a855f7',
    defaultSize: [320, 280],
  },
  {
    id: 'react-preview',
    type: 'react',
    name: 'React Preview',
    description: 'Live React component preview',
    category: 'core',
    icon: 'atom',
    color: '#06b6d4',
    defaultSize: [380, 420],
  },
  // Graphics Tools
  {
    id: 'r3f-viewport',
    type: 'r3f',
    name: '3D Viewport',
    description: 'React Three Fiber 3D scene viewport',
    category: 'graphics',
    icon: 'box',
    color: '#f97316',
    defaultSize: [450, 350],
  },
  {
    id: 'glb-viewer',
    type: 'glb-viewer',
    name: 'GLB Viewer',
    description: 'Import and view GLB/GLTF 3D models',
    category: 'graphics',
    icon: 'cube',
    color: '#ec4899',
    defaultSize: [450, 400],
  },
  {
    id: 'camera-controls',
    type: 'camera-controls',
    name: 'Camera Studio',
    description: 'Perspective/Orthographic camera controls',
    category: 'graphics',
    icon: 'camera',
    color: '#8b5cf6',
    defaultSize: [400, 450],
  },
  {
    id: 'lighting-studio',
    type: 'lighting-studio',
    name: 'Lighting Studio',
    description: 'Advanced lighting and environment controls',
    category: 'graphics',
    icon: 'sun',
    color: '#eab308',
    defaultSize: [380, 480],
  },
  // Animation Tools
  {
    id: 'animation-timeline',
    type: 'animation-timeline',
    name: 'Timeline',
    description: 'Keyframe animation timeline editor',
    category: 'animation',
    icon: 'clock',
    color: '#14b8a6',
    defaultSize: [600, 280],
  },
  // Utility Tools
  {
    id: 'node-editor',
    type: 'node-editor',
    name: 'Node Editor',
    description: 'Visual node-based programming',
    category: 'utility',
    icon: 'workflow',
    color: '#f43f5e',
    defaultSize: [550, 400],
  },
  {
    id: 'shader-editor',
    type: 'shader-editor',
    name: 'Shader Lab',
    description: 'GLSL/WebGPU shader editor',
    category: 'experimental',
    icon: 'sparkles',
    color: '#6366f1',
    defaultSize: [500, 400],
  },
  {
    id: 'performance-monitor',
    type: 'performance-monitor',
    name: 'Performance',
    description: 'FPS, memory, and draw call monitoring',
    category: 'utility',
    icon: 'activity',
    color: '#10b981',
    defaultSize: [350, 250],
  },
]

export interface CanvasWindow {
  id: string
  type: WindowType
  title: string
  position: [number, number, number]
  size: [number, number]
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  content?: string
  componentId?: string
  toolId?: string
}

export interface SceneObject {
  id: string
  name: string
  type: 'mesh' | 'light' | 'camera' | 'group'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  visible: boolean
  children: SceneObject[]
}

export interface LightSettings {
  ambient: { intensity: number; color: string }
  directional: { intensity: number; color: string; position: [number, number, number] }
  point: { intensity: number; color: string; position: [number, number, number] }[]
  environment: string
}

export interface CameraSettings {
  type: 'perspective' | 'orthographic'
  fov: number
  zoom: number
  near: number
  far: number
  position: [number, number, number]
  target: [number, number, number]
}

export interface AnimationKeyframe {
  time: number
  property: string
  value: number | [number, number, number]
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface AnimationTrack {
  id: string
  objectId: string
  keyframes: AnimationKeyframe[]
}

export interface CanvasState {
  windows: CanvasWindow[]
  activeWindowId: string | null
  cameraPosition: [number, number, number]
  zoom: number
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
  maxZIndex: number
  isPlaying: boolean
  toolStoreOpen: boolean
  
  // Scene state
  sceneObjects: SceneObject[]
  lightSettings: LightSettings
  cameraSettings: CameraSettings
  animationTracks: AnimationTrack[]
  currentTime: number
  
  // Actions
  addWindow: (window: Omit<CanvasWindow, 'id' | 'zIndex'>) => void
  removeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<CanvasWindow>) => void
  setActiveWindow: (id: string | null) => void
  bringToFront: (id: string) => void
  setCameraPosition: (position: [number, number, number]) => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  togglePlay: () => void
  setToolStoreOpen: (open: boolean) => void
  
  // Scene actions
  addSceneObject: (object: SceneObject) => void
  updateSceneObject: (id: string, updates: Partial<SceneObject>) => void
  removeSceneObject: (id: string) => void
  setLightSettings: (settings: Partial<LightSettings>) => void
  setCameraSettings: (settings: Partial<CameraSettings>) => void
  addAnimationTrack: (track: AnimationTrack) => void
  setCurrentTime: (time: number) => void
  
  // Tool actions
  openTool: (tool: Tool) => void
}

const defaultSceneObjects: SceneObject[] = [
  {
    id: 'root',
    name: 'Scene',
    type: 'group',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    children: [
      {
        id: 'cube-1',
        name: 'Cube',
        type: 'mesh',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
      },
      {
        id: 'sphere-1',
        name: 'Sphere',
        type: 'mesh',
        position: [1.5, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        children: [],
      },
    ],
  },
]

const defaultLightSettings: LightSettings = {
  ambient: { intensity: 0.4, color: '#ffffff' },
  directional: { intensity: 1, color: '#ffffff', position: [10, 10, 5] },
  point: [
    { intensity: 0.5, color: '#22c55e', position: [-10, -10, -10] },
  ],
  environment: 'city',
}

const defaultCameraSettings: CameraSettings = {
  type: 'perspective',
  fov: 50,
  zoom: 1,
  near: 0.1,
  far: 1000,
  position: [0, 0, 5],
  target: [0, 0, 0],
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  cameraPosition: [0, 0, 15],
  zoom: 1,
  gridVisible: true,
  snapToGrid: true,
  gridSize: 1,
  maxZIndex: 0,
  isPlaying: false,
  toolStoreOpen: true,
  
  // Scene state
  sceneObjects: defaultSceneObjects,
  lightSettings: defaultLightSettings,
  cameraSettings: defaultCameraSettings,
  animationTracks: [],
  currentTime: 0,

  addWindow: (window) => set((state) => ({
    windows: [...state.windows, {
      ...window,
      id: `window-${Date.now()}`,
      zIndex: state.maxZIndex + 1,
    }],
    maxZIndex: state.maxZIndex + 1,
    toolStoreOpen: false,
  })),

  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),

  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ),
  })),

  setActiveWindow: (id) => set({ activeWindowId: id }),

  bringToFront: (id) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, zIndex: state.maxZIndex + 1 } : w
    ),
    maxZIndex: state.maxZIndex + 1,
    activeWindowId: id,
  })),

  setCameraPosition: (position) => set({ cameraPosition: position }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  setGridSize: (size) => set({ gridSize: size }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setToolStoreOpen: (open) => set({ toolStoreOpen: open }),

  // Scene actions
  addSceneObject: (object) => set((state) => ({
    sceneObjects: [...state.sceneObjects, object],
  })),

  updateSceneObject: (id, updates) => set((state) => ({
    sceneObjects: state.sceneObjects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ),
  })),

  removeSceneObject: (id) => set((state) => ({
    sceneObjects: state.sceneObjects.filter(obj => obj.id !== id),
  })),

  setLightSettings: (settings) => set((state) => ({
    lightSettings: { ...state.lightSettings, ...settings },
  })),

  setCameraSettings: (settings) => set((state) => ({
    cameraSettings: { ...state.cameraSettings, ...settings },
  })),

  addAnimationTrack: (track) => set((state) => ({
    animationTracks: [...state.animationTracks, track],
  })),

  setCurrentTime: (time) => set({ currentTime: time }),

  openTool: (tool) => {
    const state = get()
    // Spread windows in a grid pattern
    const count = state.windows.length
    const col = count % 3
    const row = Math.floor(count / 3)
    const baseX = -4 + col * 5
    const baseY = 2 - row * 4
    
    set((s) => ({
      windows: [...s.windows, {
        id: `window-${Date.now()}`,
        type: tool.type,
        title: tool.name,
        position: [baseX, baseY, 0],
        size: tool.defaultSize,
        isMinimized: false,
        isMaximized: false,
        zIndex: s.maxZIndex + 1,
        toolId: tool.id,
      }],
      maxZIndex: s.maxZIndex + 1,
      toolStoreOpen: false,
    }))
  },
}))
