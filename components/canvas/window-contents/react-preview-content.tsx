'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Play, Pause } from 'lucide-react'

export function ReactPreviewContent() {
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="h-full flex flex-col bg-white text-gray-900">
      {/* Preview Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          {isRunning ? (
            <Pause className="w-3 h-3 text-gray-600" />
          ) : (
            <Play className="w-3 h-3 text-gray-600" />
          )}
        </button>
        <button
          onClick={() => setCount(0)}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-gray-600" />
        </button>
        <span className="text-[10px] text-gray-500">
          Last update: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      {/* Live Preview */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Hello World</h1>
            <p className="text-sm text-gray-500 mt-1">Live React Preview</p>
          </div>

          {/* Counter Demo */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-3">{count}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCount(c => Math.max(0, c - 1))}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  -
                </button>
                <button
                  onClick={() => setCount(c => c + 1)}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-[10px] text-blue-600 font-medium uppercase">Status</div>
              <div className="text-sm font-semibold text-blue-800">
                {isRunning ? 'Running' : 'Paused'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-[10px] text-purple-600 font-medium uppercase">Count</div>
              <div className="text-sm font-semibold text-purple-800">{count}</div>
            </div>
          </div>

          {/* Interactive Element */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <input
              type="text"
              placeholder="Type something..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500">
        <span>React 19</span>
        <span className={isRunning ? 'text-green-500' : 'text-gray-400'}>
          {isRunning ? '● Live' : '○ Paused'}
        </span>
      </div>
    </div>
  )
}
