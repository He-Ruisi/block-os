import type React from 'react'
import type { SuggestionItemViewModel } from '../types'

export interface EditorContentAreaViewProps {
  documentTitle: string
  tags: string[]
  className?: string
  editorContent: React.ReactNode
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  suggestion: {
    visible: boolean
    items: SuggestionItemViewModel[]
    position: { top: number; left: number }
    onSelect: (item: SuggestionItemViewModel) => void
    onClose: () => void
  }
}
