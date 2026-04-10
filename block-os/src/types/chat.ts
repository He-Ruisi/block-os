// AI 对话消息
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  editorContent?: string
  insertedToEditor?: boolean
}

// AI 对话 Session
export interface Session {
  id: string
  title: string          // 自动取第一条用户消息前 20 字
  date: string           // "2026-04-10"
  createdAt: Date
  updatedAt: Date
  systemPrompt: string
  messages: Message[]
}

// 右侧面板标签页类型
export type PanelTab = 'chat' | 'blocks' | 'structure' | 'session'
