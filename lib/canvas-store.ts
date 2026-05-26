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
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  windows: [
    {
      id: 'window-1',
      type: 'code-editor',
      title: 'CodeEditor.tsx',
      position: [-4, 2, 0],
      size: [400, 300],
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      content: `import React from 'react'

export function App() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div className="p-4">
      <h1>Hello World</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  )
}`
    },
    {
      id: 'window-2',
      type: 'r3f',
      title: '3D Viewport',
      position: [1, 2, 0],
      size: [400, 300],
      isMinimized: false,
      isMaximized: false,
      zIndex: 2,
    },
    {
      id: 'window-3',
      type: 'console',
      title: 'Console',
      position: [-4, -2, 0],
      size: [400, 200],
      isMinimized: false,
      isMaximized: false,
      zIndex: 3,
    },
    {
      id: 'window-4',
      type: 'inspector',
      title: 'Inspector',
      position: [1, -2, 0],
      size: [300, 250],
      isMinimized: false,
      isMaximized: false,
      zIndex: 4,
    },
    {
      id: 'window-5',
      type: 'react',
      title: 'Preview',
      position: [5, 0, 0],
      size: [350, 400],
      isMinimized: false,
      isMaximized: false,
      zIndex: 5,
    },
  ],
  activeWindowId: null,
  cameraPosition: [0, 0, 15],
  zoom: 1,
  gridVisible: true,
  snapToGrid: true,
  gridSize: 1,
  maxZIndex: 5,
  isPlaying: false,

  addWindow: (window) => set((state) => ({
    windows: [...state.windows, {
      ...window,
      id: `window-${Date.now()}`,
      zIndex: state.maxZIndex + 1,
    }],
    maxZIndex: state.maxZIndex + 1,
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
}))
