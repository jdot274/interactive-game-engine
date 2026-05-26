'use client'

import { useState } from 'react'
import { Terminal, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface LogEntry {
  id: number
  type: 'log' | 'error' | 'warn' | 'info'
  message: string
  timestamp: string
}

const initialLogs: LogEntry[] = [
  { id: 1, type: 'info', message: 'Canvas Engine initialized', timestamp: '10:23:45' },
  { id: 2, type: 'log', message: 'Loading modules...', timestamp: '10:23:46' },
  { id: 3, type: 'log', message: 'R3F Viewport mounted', timestamp: '10:23:47' },
  { id: 4, type: 'log', message: 'Code Editor ready', timestamp: '10:23:48' },
  { id: 5, type: 'info', message: 'All systems operational', timestamp: '10:23:49' },
  { id: 6, type: 'warn', message: 'Performance: 60 FPS', timestamp: '10:23:50' },
]

export function ConsoleContent() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all')

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const newLog: LogEntry = {
        id: Date.now(),
        type: 'log',
        message: `> ${input}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      }
      
      // Simulate command execution
      const resultLog: LogEntry = {
        id: Date.now() + 1,
        type: input.toLowerCase().includes('error') ? 'error' : 'info',
        message: `Executed: ${input}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      }
      
      setLogs([...logs, newLog, resultLog])
      setInput('')
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-3 h-3 text-destructive" />
      case 'warn':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />
      case 'info':
        return <Info className="w-3 h-3 text-blue-400" />
      default:
        return <CheckCircle className="w-3 h-3 text-muted-foreground" />
    }
  }

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter)

  return (
    <div className="h-full flex flex-col bg-[var(--code-bg)] font-mono text-xs">
      {/* Console Header */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-card/50">
        <Terminal className="w-3 h-3 text-primary" />
        <span className="text-muted-foreground">Console</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {(['all', 'log', 'error', 'warn', 'info'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                filter === f 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setLogs([])}
          className="px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Log Output */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={`flex items-start gap-2 py-0.5 ${
              log.type === 'error' ? 'text-destructive' :
              log.type === 'warn' ? 'text-yellow-500' :
              log.type === 'info' ? 'text-blue-400' :
              'text-foreground/80'
            }`}
          >
            {getLogIcon(log.type)}
            <span className="text-muted-foreground">[{log.timestamp}]</span>
            <span className="flex-1">{log.message}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-card/30">
        <span className="text-primary">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Enter command..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
