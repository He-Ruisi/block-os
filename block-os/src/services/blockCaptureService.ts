import type { Block } from '../types/block'
import { generateUUID } from '../utils/uuid'
import { blockStore } from '../storage/blockStore'

export interface CaptureResult {
  success: boolean
  blockId?: string
  error?: string
}

// 手动捕获 AI 消息为 Block
export async function captureMessageAsBlock(
  messageId: string,
  content: string
): Promise<CaptureResult> {
  try {
    if (!blockStore.isInitialized()) {
      await blockStore.init()
    }

    const block: Block = {
      id: generateUUID(),
      content,
      type: 'ai-generated',
      source: { type: 'ai', aiMessageId: messageId, capturedAt: new Date() },
      metadata: {
        title: `AI 回复 - ${new Date().toLocaleString()}`,
        tags: ['AI回复', '手动捕获'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    await blockStore.saveBlock(block)
    window.dispatchEvent(new Event('blockUpdated'))

    return { success: true, blockId: block.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return { success: false, error: errorMessage }
  }
}
