export interface AIMessageViewModel {
  id: string
  role: 'user' | 'assistant'
  content: string
  editorContent?: string
  insertedToEditor?: boolean
}

export interface AISessionViewModel {
  id: string
  title: string
  updatedAtLabel: string
  messageCount: number
}

export interface AIModelOptionViewModel {
  value: string
  label: string
}

export interface AIProviderOptionViewModel {
  value: 'mimo' | 'deepseek'
  label: string
  connected: boolean
}
