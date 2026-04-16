import type { Block } from '../../types/models/block'
import type { OCRPhotoRecord } from '../../types/common/ocr'
import { generateUUID } from '../../utils/uuid'
import { blockStore } from '../../storage/blockStore'

function buildOCRTags(record: OCRPhotoRecord): string[] {
  return ['OCR识别', record.mimeType.startsWith('image/') ? '图片识别' : 'OCR导入']
}

function buildOCRTitle(record: OCRPhotoRecord): string {
  return `${record.fileName} OCR 结果`
}

export async function upsertImplicitBlockFromOCR(record: OCRPhotoRecord): Promise<{
  blockId: string
  version: number
}> {
  if (!record.ocrText?.trim()) {
    throw new Error('OCR 结果为空，无法创建隐式 Block')
  }

  if (!blockStore.isInitialized()) {
    await blockStore.init()
  }

  const existingBlock = record.implicitBlockId
    ? await blockStore.getBlock(record.implicitBlockId)
    : null

  if (existingBlock?.implicit) {
    const nextVersion = (existingBlock.releases?.length ?? 0) + 1
    const updatedBlock: Block = {
      ...existingBlock,
      content: record.ocrText,
      source: {
        ...existingBlock.source,
        capturedAt: new Date(record.updatedAt),
      },
      metadata: {
        ...existingBlock.metadata,
        title: buildOCRTitle(record),
        tags: buildOCRTags(record),
        updatedAt: new Date(record.updatedAt),
      },
      releases: [
        ...(existingBlock.releases ?? []),
        {
          version: nextVersion,
          content: record.ocrText,
          title: `OCR 识别版本 ${nextVersion}`,
          releasedAt: new Date(record.updatedAt),
        },
      ],
    }

    await blockStore.saveBlock(updatedBlock)
    return { blockId: updatedBlock.id, version: nextVersion }
  }

  const blockId = record.implicitBlockId || `ocr-${record.id}`
  const block: Block = {
    id: blockId,
    content: record.ocrText,
    type: 'text',
    implicit: true,
    source: {
      type: 'import',
      capturedAt: new Date(record.updatedAt),
    },
    editHistory: [],
    style: {
      showSourceLabel: false,
    },
    template: {
      role: 'paragraph',
      exportStrategy: 'merge-as-paragraph',
    },
    metadata: {
      title: buildOCRTitle(record),
      tags: buildOCRTags(record),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    },
    releases: [
      {
        version: 1,
        content: record.ocrText,
        title: 'OCR 原始版本',
        releasedAt: new Date(record.updatedAt),
      },
    ],
  }

  await blockStore.saveBlock(block)
  return { blockId, version: 1 }
}

export async function captureOCRRecordAsExplicitBlock(record: OCRPhotoRecord): Promise<Block> {
  if (!record.ocrText?.trim()) {
    throw new Error('OCR 结果为空，无法保存为 Block')
  }

  if (!blockStore.isInitialized()) {
    await blockStore.init()
  }

  const block: Block = {
    id: generateUUID(),
    content: record.ocrText,
    type: 'text',
    implicit: false,
    source: {
      type: 'import',
      capturedAt: new Date(),
    },
    editHistory: [],
    style: {
      showSourceLabel: true,
    },
    template: {
      role: 'paragraph',
      exportStrategy: 'merge-as-paragraph',
    },
    metadata: {
      title: buildOCRTitle(record),
      tags: [...buildOCRTags(record), '显式Block'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    derivation: record.implicitBlockId
      ? {
          isDerivative: true,
          sourceBlockId: record.implicitBlockId,
          derivedFrom: record.implicitBlockId,
          modifications: '从 OCR 隐式 Block 捕获为显式 Block',
        }
      : undefined,
    releases: [
      {
        version: 1,
        content: record.ocrText,
        title: 'OCR 捕获版本',
        releasedAt: new Date(),
      },
    ],
  }

  await blockStore.saveBlock(block)
  window.dispatchEvent(new Event('blockUpdated'))
  return block
}
