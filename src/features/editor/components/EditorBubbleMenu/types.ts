import type { AIToolbarMode, AIActionViewModel, ToolbarButtonViewModel } from '../types'

export interface EditorBubbleMenuViewProps {
  aiLoading: AIToolbarMode | null
  customPrompt: string
  onCustomPromptChange: (value: string) => void
  onCustomPromptSubmit: () => void
  paragraphButtons: ToolbarButtonViewModel[]
  formatButtons: ToolbarButtonViewModel[]
  listButtons: ToolbarButtonViewModel[]
  aiActions: AIActionViewModel[]
  onOpenAIChat: () => void
  onAIAction: (mode: AIToolbarMode) => void
  onCapture: () => void
}
