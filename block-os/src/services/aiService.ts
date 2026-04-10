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

// AI 回复完成后自动创建隐式 Block
export async function createImplicitBlockFromAI(
  assistantId: string,
  content: string
): Promise<void> {
  if (!content.trim()) return

  const aiBlock: Block = {
    id: assistantId,
    content,
    type: 'ai-generated',
    source: { type: 'ai', aiMessageId: assistantId, capturedAt: new Date() },
    metadata: {
      title: `AI 回复 - ${new Date().toLocaleString()}`,
      tags: ['AI回复', '自动生成'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }

  await blockStore.saveBlock(aiBlock)
  window.dispatchEvent(new Event('blockUpdated'))
}
