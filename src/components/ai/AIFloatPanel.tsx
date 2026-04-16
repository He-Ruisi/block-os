import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Maximize2, Pin, PinOff, Send, Plus, MessageSquare } from 'lucide-react'
import { useAIChat } from '../../hooks/useAIChat'
import '../../styles/components/AIFloatPanel.css'

export type AIMode = 'bubble' | 'float' | 'sidebar'

interface AIFloatPanelProps {
  mode: AIMode
  onModeChange: (mode: AIMode) => void
  initialContext?: string
  onInsertContent?: (content: string) => void
  position?: { top: number; left: number }
  onClose?: () => void
}

export function AIFloatPanel({
  mode,
  onModeChange,
  initialContext,
  onInsertContent,
  position,
  onClose,
}: AIFloatPanelProps) {
  const { messages, isLoading, input, setInput, handleSend, handleNewSession, insertToEditor } = useAIChat()
  const [floatPos, setFloatPos] = useState(() => ({
    top: position ? Math.max(60, position.top - 100) : 200,
    left: position ? Math.min(position.left, window.innerWidth - 420) : 300,
  }))
  const [contextText] = useState(initialContext || '')
  const [contextSent, setContextSent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // drag state
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, top: 0, left: 0 })

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // drag handlers (float mode only)
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (mode !== 'float') return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, top: floatPos.top, left: floatPos.left }
    document.body.style.cursor = 'move'
    document.body.style.userSelect = 'none'
  }, [mode, floatPos])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setFloatPos({
        top: Math.max(0, dragStart.current.top + dy),
        left: Math.max(0, dragStart.current.left + dx),
      })
    }
    const handleMouseUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleSendClick = async () => {
    if (!contextSent && contextText.trim()) {
      await handleSend(contextText)
      setContextSent(true)
    } else {
      await handleSend()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendClick()
    }
  }

  const handleInsert = (messageId: string) => {
    insertToEditor(messageId, onInsertContent)
  }

  // mode switch buttons
  const renderModeButtons = () => (
    <div className="ai-float-panel__modes">
      {mode !== 'bubble' && (
        <button
          className="ai-float-panel__mode-btn"
          onClick={() => onModeChange('bubble')}
          title="气泡模式"
        >
          <MessageSquare size={14} />
        </button>
      )}
      {mode !== 'float' && (
        <button
          className="ai-float-panel__mode-btn"
          onClick={() => onModeChange('float')}
          title="悬浮窗模式"
        >
          <Maximize2 size={14} />
        </button>
      )}
      {mode !== 'sidebar' && (
        <button
          className="ai-float-panel__mode-btn"
          onClick={() => onModeChange('sidebar')}
          title="停靠到侧边"
        >
          <Pin size={14} />
        </button>
      )}
      {mode === 'sidebar' && (
        <button
          className="ai-float-panel__mode-btn"
          onClick={() => onModeChange('float')}
          title="取消停靠"
        >
          <PinOff size={14} />
        </button>
      )}
    </div>
  )

  return (
    <div
      ref={panelRef}
      className={`ai-float-panel ai-float-panel--${mode}`}
      style={mode === 'float' ? { top: floatPos.top, left: floatPos.left } : undefined}
    >
      {/* Header */}
      <div
        className="ai-float-panel__header"
        onMouseDown={handleDragStart}
      >
        <span className="ai-float-panel__title">
          <span className="ai-float-panel__icon">✦</span>
          AI 助手
        </span>
        {renderModeButtons()}
        <div className="ai-float-panel__header-actions">
          <button className="ai-float-panel__header-btn" onClick={handleNewSession} title="新对话">
            <Plus size={14} />
          </button>
          <button className="ai-float-panel__header-btn" onClick={onClose} title="关闭">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-float-panel__messages">
        {contextText && !contextSent && (
          <div className="ai-float-panel__context">
            <div className="ai-float-panel__context-label">上下文</div>
            <div className="ai-float-panel__context-text">{contextText.slice(0, 200)}{contextText.length > 200 ? '...' : ''}</div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`ai-float-panel__msg ai-float-panel__msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="ai-float-panel__msg-actions">
                {!msg.insertedToEditor && (
                  <button
                    className="ai-float-panel__msg-action"
                    onClick={() => handleInsert(msg.id)}
                    title="插入到编辑器"
                  >
                    插入
                  </button>
                )}
              </div>
            )}
            <div className="ai-float-panel__msg-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="ai-float-panel__msg ai-float-panel__msg--assistant ai-float-panel__msg--streaming">
            <span className="ai-float-panel__cursor" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-float-panel__input-area">
        <textarea
          ref={inputRef}
          className="ai-float-panel__input"
          placeholder="输入问题..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={mode === 'bubble' ? 2 : 3}
        />
        <button
          className="ai-float-panel__send"
          onClick={handleSendClick}
          disabled={!input.trim() || isLoading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
