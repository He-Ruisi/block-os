import type {
  AIMessageViewModel,
  AIModelOptionViewModel,
  AIProviderOptionViewModel,
  AISessionViewModel,
} from '../types'

export interface AIImmersivePanelViewProps {
  title: string
  subtitle: string
  messages: AIMessageViewModel[]
  isLoading: boolean
  input: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onInsertToEditor: (messageId: string) => void
  onClose?: () => void
  onNewSession: () => void
  onToggleHistory: () => void
  onOpenSettings: () => void
  showHistory: boolean
  showSettings: boolean
  historyTitle: string
  historySubtitle: string
  sessions: AISessionViewModel[]
  currentSessionId: string
  onLoadSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onExportSession: (sessionId: string) => void
  selectedProvider: 'mimo' | 'deepseek'
  selectedModel: string
  providerOptions: AIProviderOptionViewModel[]
  modelOptions: AIModelOptionViewModel[]
  systemPrompt: string
  onProviderChange: (provider: 'mimo' | 'deepseek') => void
  onModelChange: (model: string) => void
  onSystemPromptChange: (prompt: string) => void
  onCancelSettings: () => void
  onSaveSettings: () => void
}
