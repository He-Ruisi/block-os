import type { Message } from '../types/chat'
import { generateUUID } from '../utils/uuid'
import { blockStore } from '../storage/blockStore'
import type { Block } from '../types/block'

const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions'

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

  const response = await fetch(MIMO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'mimo-v2-flash',
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
      temperature: 0.8,
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

  const response = await fetch(MIMO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': req.apiKey,
    },
    body: JSON.stringify({
      model: 'mimo-v2-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: req.mode === 'translate' ? 0.3 : 0.7,
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
