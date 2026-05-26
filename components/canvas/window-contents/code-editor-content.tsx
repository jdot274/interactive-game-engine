'use client'

import { useState, useCallback } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'

interface CodeEditorContentProps {
  content: string
  windowId: string
}

export function CodeEditorContent({ content, windowId }: CodeEditorContentProps) {
  const { updateWindow } = useCanvasStore()
  const [code, setCode] = useState(content)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    updateWindow(windowId, { content: newCode })
  }, [updateWindow, windowId])

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    const lines = code.split('\n')
    return lines.map((line, i) => (
      <div key={i} className="flex">
        <span className="w-8 text-right pr-3 text-muted-foreground select-none text-xs">
          {i + 1}
        </span>
        <span className="flex-1">
          {highlightLine(line)}
        </span>
      </div>
    ))
  }

  const highlightLine = (line: string) => {
    // Simple keyword highlighting
    const keywords = ['import', 'export', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'from', 'default']
    const stringRegex = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g
    const commentRegex = /\/\/.*/g
    
    let result = line
    
    // Highlight comments
    result = result.replace(commentRegex, '<span class="token-comment">$&</span>')
    
    // Highlight strings
    result = result.replace(stringRegex, '<span class="token-string">$&</span>')
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
      result = result.replace(regex, '<span class="token-keyword">$1</span>')
    })
    
    // Highlight numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>')
    
    // Highlight function calls
    result = result.replace(/(\w+)(?=\()/g, '<span class="token-function">$1</span>')
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  return (
    <div className="h-full flex flex-col bg-[var(--code-bg)] font-mono text-xs">
      {/* Editor Tabs */}
      <div className="flex items-center border-b border-border px-2 py-1 bg-card/50">
        <div className="px-3 py-1 bg-primary/10 border-b-2 border-primary rounded-t text-xs text-foreground">
          main.tsx
        </div>
        <div className="px-3 py-1 text-muted-foreground text-xs hover:text-foreground cursor-pointer">
          styles.css
        </div>
      </div>
      
      {/* Code Area */}
      <div className="flex-1 overflow-auto p-2 relative">
        {/* Highlighted code overlay */}
        <pre className="absolute inset-0 p-2 pointer-events-none text-foreground leading-5 whitespace-pre-wrap">
          {highlightCode(code)}
        </pre>
        
        {/* Actual textarea */}
        <textarea
          value={code}
          onChange={handleChange}
          className="w-full h-full bg-transparent text-transparent caret-primary resize-none outline-none leading-5 pl-8"
          spellCheck={false}
          style={{ 
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-card/50 text-[10px] text-muted-foreground">
        <span>TypeScript React</span>
        <span>Ln {code.split('\n').length}, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
