import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIChat } from '../../hooks/useAIChat'
import { AIFloatPanelView } from './AIFloatPanelView'
import { toAIMessageViewModels } from '../AIImmersivePanel/mappers'
import type { AIMode } from './types'

interface AIFloatPanelContainerProps {
  mode: AIMode
  onModeChange: (mode: AIMode) => void
  initialContext?: string
  onInsertContent?: (content: string) => void
  position?: { top: number; left: number }
  onClose?: () => void
}

export function AIFloatPanelContainer({
  mode,
  onModeChange,
  initialContext,
  onInsertContent,
  position,
  onClose,
}: AIFloatPanelContainerProps) {
  const {
    messages,
    isLoading,
    input,
    setInput,
    handleSend,
    handleNewSession,
    insertToEditor,
  } = useAIChat()
  const [floatPos, setFloatPos] = useState(() => ({
    top: position ? Math.max(60, position.top - 100) : 200,
    left: position ? Math.min(position.left, window.innerWidth - 420) : 300,
  }))
  const [contextText] = useState(initialContext || '')
  const [contextSent, setContextSent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, top: 0, left: 0 })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (mode !== 'float') return
    isDragging.current = true
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      top: floatPos.top,
      left: floatPos.left,
    }
    document.body.style.cursor = 'move'
    document.body.style.userSelect = 'none'
  }, [mode, floatPos])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return
      const dx = event.clientX - dragStart.current.x
      const dy = event.clientY - dragStart.current.y
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

  const handleSendClick = useCallback(async () => {
    if (!contextSent && contextText.trim()) {
      await handleSend(contextText)
      setContextSent(true)
      return
    }

    await handleSend()
  }, [contextSent, contextText, handleSend])

  const handleInsert = useCallback((messageId: string) => {
    insertToEditor(messageId, onInsertContent)
  }, [insertToEditor, onInsertContent])

  return (
    <AIFloatPanelView
      mode={mode}
      messages={toAIMessageViewModels(messages)}
      isLoading={isLoading}
      input={input}
      contextText={contextText}
      contextSent={contextSent}
      position={mode === 'float' ? floatPos : undefined}
      onInputChange={setInput}
      onSend={handleSendClick}
      onInsert={handleInsert}
      onNewSession={() => {
        void handleNewSession()
      }}
      onModeChange={onModeChange}
      onClose={onClose}
      onDragStart={handleDragStart}
      messagesEndRef={messagesEndRef}
      inputRef={inputRef}
    />
  )
}
