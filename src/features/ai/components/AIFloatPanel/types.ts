import type React from 'react'
import type { AIMessageViewModel } from '../types'

export type AIMode = 'bubble' | 'float' | 'sidebar'

export interface AIFloatPanelViewProps {
  mode: AIMode
  messages: AIMessageViewModel[]
  isLoading: boolean
  input: string
  contextText: string
  contextSent: boolean
  position?: { top: number; left: number }
  onInputChange: (value: string) => void
  onSend: () => void
  onInsert: (messageId: string) => void
  onNewSession: () => void
  onModeChange: (mode: AIMode) => void
  onClose?: () => void
  onDragStart: (event: React.MouseEvent) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLTextAreaElement>
}
