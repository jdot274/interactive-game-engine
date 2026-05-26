'use client'

import { useMemo, useState } from 'react'
import { useCanvasStore, TOOLS, type Tool } from '@/lib/canvas-store'
import { 
  Code, Terminal, Search, Atom, Box, FileBox, Camera, Sun, 
  Clock, Workflow, Sparkles, Activity, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  terminal: Terminal,
  search: Search,
  atom: Atom,
  box: Box,
  cube: FileBox,
  camera: Camera,
  sun: Sun,
  clock: Clock,
  workflow: Workflow,
  sparkles: Sparkles,
  activity: Activity,
}

interface ToolCardProps {
  tool: Tool
  onClick: () => void
}

function ToolCard({ tool, onClick }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = iconMap[tool.icon] || Box

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border bg-card transition-all duration-300",
        "hover:scale-105 hover:shadow-xl",
        isHovered ? "border-primary" : "border-border"
      )}
      style={{
        boxShadow: isHovered ? `0 8px 32px ${tool.color}30` : undefined,
        transform: isHovered ? 'translateY(-4px)' : undefined,
      }}
    >
      {/* Colored accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: tool.color }}
      />
      
      {/* Icon container with glow */}
      <div 
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-3 mt-2 transition-all duration-300",
        )}
        style={{ 
          backgroundColor: `${tool.color}20`,
          boxShadow: isHovered ? `0 0 24px ${tool.color}40` : undefined,
        }}
      >
        <Icon className="w-7 h-7" style={{ color: tool.color }} />
      </div>
      
      {/* Tool name */}
      <h3 className="font-semibold text-sm text-foreground mb-1">{tool.name}</h3>
      
      {/* Description */}
      <p className="text-[11px] text-muted-foreground text-center leading-tight mb-2 line-clamp-2">
        {tool.description}
      </p>
      
      {/* Category badge */}
      <span 
        className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase"
        style={{ 
          backgroundColor: `${tool.color}20`,
          color: tool.color,
        }}
      >
        {tool.category}
      </span>
    </button>
  )
}

export function ToolStore() {
  const { toolStoreOpen, setToolStoreOpen, openTool } = useCanvasStore()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const categories = ['all', 'core', 'graphics', 'animation', 'utility', 'experimental']
  
  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const handleSelectTool = (tool: Tool) => {
    openTool(tool)
  }

  if (!toolStoreOpen) {
    return (
      <Button
        variant="default"
        size="lg"
        onClick={() => setToolStoreOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 gap-2 shadow-lg shadow-primary/20"
      >
        <Box className="w-5 h-5" />
        Open Tool Store
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setToolStoreOpen(false)}
      />
      
      {/* Store Panel */}
      <div className="relative w-full max-w-4xl h-[80vh] mx-4 bg-card/95 backdrop-blur-xl rounded-2xl border border-border overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Tool Store</h2>
              <p className="text-xs text-muted-foreground">Select a tool to add to your canvas</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-sm bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary w-48"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setToolStoreOpen(false)}
              className="hover:bg-destructive/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto bg-secondary/10">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="capitalize whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
        
        {/* Tool Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                onClick={() => handleSelectTool(tool)} 
              />
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Search className="w-10 h-10 mb-2 opacity-50" />
              <p>No tools found</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
          <span className="text-sm text-muted-foreground">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} available
          </span>
          
          {/* Quick access */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Quick add:</span>
            {TOOLS.slice(0, 5).map((tool) => {
              const Icon = iconMap[tool.icon] || Box
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectTool(tool)}
                  className="p-2 h-8 w-8"
                  title={tool.name}
                >
                  <Icon className="w-4 h-4" style={{ color: tool.color }} />
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
