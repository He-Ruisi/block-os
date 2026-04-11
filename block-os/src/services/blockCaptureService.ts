import type { Block } from '../types/block'
import { generateUUID } from '../utils/uuid'
import { blockStore } from '../storage/blockStore'

export interface CaptureResult {
  success: boolean
  blockId?: string
  error?: string
}

// 手动捕获 AI 消息为显式 Block
// 如果该消息已有隐式 Block（id = messageId），先删除它，再创建显式 Block
export async function captureMessageAsBlock(
  messageId: string,
  content: string
): Promise<CaptureResult> {
  try {
    if (!blockStore.isInitialized()) {
      await blockStore.init()
    }

    // 删除同一消息的隐式 Block（id 与 messageId 相同）
    const existing = await blockStore.getBlock(messageId)
    if (existing?.implicit) {
      await blockStore.deleteBlock(messageId)
    }

    const block: Block = {
      id: generateUUID(),
      content,
      type: 'ai-generated',
      implicit: false,
      source: {
        type: 'ai',
        aiMessageId: messageId,
        capturedAt: new Date(),
      },
      editHistory: [],
      style: {
        aiBlockTreatment: 'accent-border',
        showSourceLabel: true,
      },
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
      // 自动创建 release v1
      releases: [
        {
          version: 1,
          content,
          title: '原始版本',
          releasedAt: new Date(),
        },
      ],
    }

    await blockStore.saveBlock(block)
    window.dispatchEvent(new Event('blockUpdated'))

    return { success: true, blockId: block.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return { success: false, error: errorMessage }
  }
}
