import type { Session, Message } from '@/types/models/chat'
import {
  getProviderApiKey,
  getProviderConfig,
  type AIProvider,
} from '../../services/aiService'
import type {
  AIMessageViewModel,
  AIModelOptionViewModel,
  AIProviderOptionViewModel,
  AISessionViewModel,
} from '../types'

export function toAIMessageViewModels(messages: Message[]): AIMessageViewModel[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    editorContent: message.editorContent,
    insertedToEditor: message.insertedToEditor,
  }))
}

export function toAISessionViewModels(sessions: Session[]): AISessionViewModel[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    updatedAtLabel: new Date(session.updatedAt).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    messageCount: session.messages.length,
  }))
}

export function toAIProviderOptions(): AIProviderOptionViewModel[] {
  return [
    {
      value: 'mimo',
      label: 'Xiaomi MiMo',
      connected: Boolean(getProviderApiKey('mimo')),
    },
    {
      value: 'deepseek',
      label: 'DeepSeek',
      connected: Boolean(getProviderApiKey('deepseek')),
    },
  ]
}

export function toAIModelOptions(provider: AIProvider): AIModelOptionViewModel[] {
  return getProviderConfig(provider).supportedModels.map((model) => ({
    value: model,
    label: formatModelLabel(model),
  }))
}

export function formatModelLabel(model: string): string {
  if (model === 'deepseek-chat') return 'deepseek-chat'
  if (model === 'deepseek-reasoner') return 'deepseek-reasoner'
  if (model === 'mimo-v2-flash') return 'MiMo Flash'
  return model
}
