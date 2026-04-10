// AI 对话消息
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  editorContent?: string
  insertedToEditor?: boolean
}

// 右侧面板标签页类型
export type PanelTab = 'chat' | 'blocks' | 'structure' | 'session'
