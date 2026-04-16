import type { Message } from '@/types/models/chat'
import { generateUUID } from '@/utils/uuid'
import { blockStore } from '@/storage/blockStore'
import type { Block } from '@/types/models/block'

// AI 提供商类型
export type AIProvider = 'mimo' | 'deepseek'

// AI 提供商配置
interface AIProviderConfig {
  name: string
  apiUrl: string
  defaultModel: string
  supportedModels: string[]
  headerKey: string // API Key 的 header 名称
}

const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  mimo: {
    name: '小米 MiMo',
    apiUrl: 'https://api.xiaomimimo.com/v1/chat/completions',
    defaultModel: 'mimo-v2-flash',
    supportedModels: ['mimo-v2-flash'],
    headerKey: 'api-key',
  },
  deepseek: {
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    supportedModels: ['deepseek-chat', 'deepseek-reasoner'],
    headerKey: 'Authorization', // Bearer token
  },
}

// 获取当前使用的 AI 提供商（从 localStorage 读取，默认 mimo）
export function getCurrentProvider(): AIProvider {
  const saved = localStorage.getItem('blockos-ai-provider')
  return (saved as AIProvider) || 'mimo'
}

// 设置当前使用的 AI 提供商
export function setCurrentProvider(provider: AIProvider): void {
  localStorage.setItem('blockos-ai-provider', provider)
}

// 获取当前提供商的配置
export function getProviderConfig(provider?: AIProvider): AIProviderConfig {
  return AI_PROVIDERS[provider || getCurrentProvider()]
}

// 获取当前提供商的 API Key
export function getProviderApiKey(provider?: AIProvider): string {
  const p = provider || getCurrentProvider()
  if (p === 'mimo') {
    return import.meta.env.VITE_MIMO_API_KEY || ''
  } else if (p === 'deepseek') {
    return import.meta.env.VITE_DEEPSEEK_API_KEY || ''
  }
  return ''
}

// 获取当前使用的模型（从 localStorage 读取）
export function getCurrentModel(): string {
  const provider = getCurrentProvider()
  const saved = localStorage.getItem('blockos-ai-model')
  if (saved && AI_PROVIDERS[provider].supportedModels.includes(saved)) {
    return saved
  }
  return AI_PROVIDERS[provider].defaultModel
}

// 设置当前使用的模型
export function setCurrentModel(model: string): void {
  localStorage.setItem('blockos-ai-model', model)
}

export interface SendMessageOptions {
  input: string
  history: Message[]
  systemPrompt: string
  apiKey: string
  onToken: (assistantId: string, reply: string, editorContent?: string) => void
}

export interface SendMessageResult {
  assistantId: string
  fullResponse: string
}

// 解析 AI 回复，分离对话内容和编辑器内容
export function parseAIResponse(fullResponse: string): { reply: string; editorContent?: string } {
  try {
    const parsed = JSON.parse(fullResponse)
    if (parsed.reply && parsed.content) {
      return { reply: parsed.reply, editorContent: parsed.content }
    }
  } catch {
    // Not JSON
  }

  const separators = ['---CONTENT---', '【写入内容】', '[CONTENT]']
  for (const sep of separators) {
    if (fullResponse.includes(sep)) {
      const parts = fullResponse.split(sep)
      return { reply: parts[0].trim(), editorContent: parts[1].trim() }
    }
  }

  return { reply: fullResponse }
}

// 发送消息并处理流式响应
export async function sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
  const { input, history, systemPrompt, apiKey, onToken } = options

  const provider = getCurrentProvider()
  const config = getProviderConfig(provider)
  const model = getCurrentModel()
  
  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (config.headerKey === 'Authorization') {
    headers[config.headerKey] = `Bearer ${apiKey}`
  } else {
    headers[config.headerKey] = apiKey
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            systemPrompt +
            '\n\n如果用户需要写入编辑器的内容，请用以下格式回复：\n简短回复用户\n---CONTENT---\n要写入编辑器的内容',
        },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input },
      ],
      temperature: provider === 'deepseek' ? 1.0 : 0.8,
      top_p: 0.95,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let assistantMessage = ''
  const assistantId = generateUUID()

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

    for (const line of lines) {
      const data = line.replace(/^data:\s*/, '')
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) {
          assistantMessage += content
          const { reply, editorContent } = parseAIResponse(assistantMessage)
          onToken(assistantId, reply, editorContent)
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  return { assistantId, fullResponse: assistantMessage }
}

// ============================================================
// Inline AI — 选中文字后的 AI 操作（续写/改写/缩写/扩写/翻译/解释）
// ============================================================

export type InlineAIMode = 'continue' | 'rewrite' | 'shorten' | 'expand' | 'translate' | 'explain'

export interface InlineAIRequest {
  mode: InlineAIMode
  selectedText: string
  context?: string          // 选中文字的前后段落
  targetLanguage?: string   // 翻译目标语言
  apiKey: string
  onToken: (content: string) => void
  signal?: AbortSignal      // 用于取消请求
}

export interface InlineAIResult {
  content: string
  mode: InlineAIMode
}

/** 每种模式的 system prompt */
const INLINE_PROMPTS: Record<InlineAIMode, (req: InlineAIRequest) => string> = {
  continue: () =>
    '你是一个写作助手。用户会给你一段文字，请续写下一段。' +
    '直接输出续写内容，不要加任何前缀、解释或引号。保持原文的语气和风格。',
  rewrite: () =>
    '你是一个写作助手。用户会给你一段文字，请改写这段文字。' +
    '保持原意不变，换一种表达方式。直接输出改写结果，不要加前缀或解释。输出长度应接近原文。',
  shorten: () =>
    '你是一个写作助手。用户会给你一段文字，请缩写这段文字。' +
    '保留核心意思，删减冗余。直接输出缩写结果，不要加前缀或解释。输出必须比原文短。',
  expand: () =>
    '你是一个写作助手。用户会给你一段文字，请扩写这段文字。' +
    '丰富细节和表达，保持原意。直接输出扩写结果，不要加前缀或解释。输出必须比原文长。',
  translate: (req) => {
    const lang = req.targetLanguage || '英文'
    return `你是一个翻译助手。请将用户给出的文字翻译为${lang}。` +
      '直接输出翻译结果，不要加前缀、解释或原文。'
  },
  explain: () =>
    '你是一个知识助手。用户会给你一段文字，请用简洁的语言解释这段文字的含义。' +
    '输出简短的解释（1-3句话），适合作为行内批注。不要加前缀。',
}

/** 发送 inline AI 请求（选中文字操作） */
export async function sendInlineAIRequest(req: InlineAIRequest): Promise<InlineAIResult> {
  const systemPrompt = INLINE_PROMPTS[req.mode](req)
  const userContent = req.context
    ? `上下文：\n${req.context}\n\n选中文字：\n${req.selectedText}`
    : req.selectedText

  const provider = getCurrentProvider()
  const config = getProviderConfig(provider)
  const model = getCurrentModel()
  
  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (config.headerKey === 'Authorization') {
    headers[config.headerKey] = `Bearer ${req.apiKey}`
  } else {
    headers[config.headerKey] = req.apiKey
  }

  // DeepSeek 针对不同任务的温度建议
  let temperature = 0.7
  if (provider === 'deepseek') {
    if (req.mode === 'translate') {
      temperature = 1.3
    } else if (req.mode === 'continue' || req.mode === 'expand') {
      temperature = 1.5 // 创作类任务
    } else {
      temperature = 1.0 // 通用对话
    }
  } else {
    temperature = req.mode === 'translate' ? 0.3 : 0.7
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature,
      top_p: 0.95,
      stream: true,
    }),
    signal: req.signal,
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

    for (const line of lines) {
      const data = line.replace(/^data:\s*/, '')
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) {
          fullContent += content
          req.onToken(fullContent)
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  return { content: fullContent, mode: req.mode }
}

// AI 回复完成后自动创建隐式 Block（不显示在 Block 空间）
export async function createImplicitBlockFromAI(
  assistantId: string,
  content: string
): Promise<void> {
  if (!content.trim()) return

  const aiBlock: Block = {
    id: assistantId,
    content,
    type: 'ai-generated',
    implicit: true,  // 隐式，不在 Block 空间显示
    // 内容层：来源可追溯
    source: {
      type: 'ai',
      aiMessageId: assistantId,
      capturedAt: new Date(),
    },
    editHistory: [],
    // 样式层：隐式块默认不显示标签
    style: {
      aiBlockTreatment: 'accent-border',
      showSourceLabel: false,
    },
    // 模板层：默认段落
    template: {
      role: 'paragraph',
      exportStrategy: 'merge-as-paragraph',
    },
    metadata: {
      title: `AI 回复 - ${new Date().toLocaleString()}`,
      tags: ['AI回复'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }

  await blockStore.saveBlock(aiBlock)
  // 隐式 Block 不触发 blockUpdated，避免 Block 空间刷新
}
