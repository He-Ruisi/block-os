import type { Block, BlockStyle, BlockTemplate, BlockRelease, BlockAnnotation, AnnotationType } from '../types/block'
import { generateUUID } from '../utils/uuid'
import { initDatabase, getDatabase, isDatabaseInitialized } from './database'

export type { Block }
export { generateUUID }

const STORE_NAME = 'blocks'

interface BlockStoreOptions {
  skipSyncMark?: boolean
}

export class BlockStore {
  async init(): Promise<void> {
    await initDatabase()
  }

  isInitialized(): boolean {
    return isDatabaseInitialized()
  }

  async saveBlock(block: Block, options: BlockStoreOptions = {}): Promise<string> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(block)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          // 标记 Block 已变更，等待同步
          import('../services/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markBlockChanged(block.id)
          })
        }
        resolve(block.id)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getBlock(id: string): Promise<Block | null> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async getAllBlocks(): Promise<Block[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => {
        const blocks: Block[] = req.result
        blocks.sort((a, b) =>
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        )
        resolve(blocks)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async searchBlocks(query: string): Promise<Block[]> {
    const allBlocks = await this.getAllBlocks()
    const lowerQuery = query.toLowerCase()
    return allBlocks.filter(block =>
      block.content.toLowerCase().includes(lowerQuery) ||
      block.metadata.title?.toLowerCase().includes(lowerQuery) ||
      block.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getBlocksByTag(tag: string): Promise<Block[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).index('tags').getAll(tag)
      req.onsuccess = () => {
        const blocks: Block[] = req.result
        blocks.sort((a, b) =>
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        )
        resolve(blocks)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getAllTags(): Promise<string[]> {
    const allBlocks = await this.getAllBlocks()
    const tagsSet = new Set<string>()
    allBlocks.forEach(block => block.metadata.tags.forEach(tag => tagsSet.add(tag)))
    return Array.from(tagsSet).sort()
  }

  async deleteBlock(id: string, options: BlockStoreOptions = {}): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          import('../services/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markBlockDeleted(id)
          })
        }
        resolve()
      }
      req.onerror = () => reject(req.error)
    })
  }

  async updateBlock(id: string, updates: Partial<Block>): Promise<void> {
    const block = await this.getBlock(id)
    if (!block) throw new Error('Block not found')
    const updatedBlock: Block = {
      ...block,
      ...updates,
      metadata: { ...block.metadata, ...updates.metadata, updatedAt: new Date() },
    }
    await this.saveBlock(updatedBlock)
  }

  async addLink(fromBlockId: string, toBlockId: string): Promise<void> {
    const fromBlock = await this.getBlock(fromBlockId)
    const toBlock = await this.getBlock(toBlockId)
    if (!fromBlock || !toBlock) throw new Error('Block not found')

    if (!fromBlock.links) fromBlock.links = { outgoing: [], incoming: [] }
    if (!toBlock.links) toBlock.links = { outgoing: [], incoming: [] }

    if (!fromBlock.links.outgoing.includes(toBlockId)) fromBlock.links.outgoing.push(toBlockId)
    if (!toBlock.links.incoming.includes(fromBlockId)) toBlock.links.incoming.push(fromBlockId)

    await this.saveBlock(fromBlock)
    await this.saveBlock(toBlock)
  }

  async removeLink(fromBlockId: string, toBlockId: string): Promise<void> {
    const fromBlock = await this.getBlock(fromBlockId)
    const toBlock = await this.getBlock(toBlockId)
    if (!fromBlock || !toBlock) return

    if (fromBlock.links) fromBlock.links.outgoing = fromBlock.links.outgoing.filter(id => id !== toBlockId)
    if (toBlock.links) toBlock.links.incoming = toBlock.links.incoming.filter(id => id !== fromBlockId)

    await this.saveBlock(fromBlock)
    await this.saveBlock(toBlock)
  }

  async getBlockLinks(blockId: string): Promise<{ outgoing: Block[]; incoming: Block[] }> {
    const block = await this.getBlock(blockId)
    if (!block?.links) return { outgoing: [], incoming: [] }

    const outgoing = await Promise.all(block.links.outgoing.map(id => this.getBlock(id)))
    const incoming = await Promise.all(block.links.incoming.map(id => this.getBlock(id)))

    return {
      outgoing: outgoing.filter((b): b is Block => b !== null),
      incoming: incoming.filter((b): b is Block => b !== null),
    }
  }

  async createDerivative(
    sourceBlockId: string,
    modifiedContent: string,
    contextDocumentId: string,
    contextTitle: string,
    modifications = '用户修改'
  ): Promise<Block> {
    const sourceBlock = await this.getBlock(sourceBlockId)
    if (!sourceBlock) throw new Error('Source block not found')

    const derivative: Block = {
      id: generateUUID(),
      content: modifiedContent,
      type: sourceBlock.type,
      // 内容层：继承源 Block 的来源信息，记录派生上下文
      source: {
        type: 'editor',
        documentId: contextDocumentId,
        capturedAt: new Date(),
      },
      editHistory: [
        { editedAt: new Date(), editedBy: 'user', summary: modifications },
      ],
      // 样式层：继承源 Block 的样式
      style: sourceBlock.style ? { ...sourceBlock.style } : undefined,
      // 模板层：继承源 Block 的模板
      template: sourceBlock.template ? { ...sourceBlock.template } : undefined,
      metadata: {
        title: sourceBlock.metadata.title,
        tags: [...sourceBlock.metadata.tags, '派生版本'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      derivation: {
        isDerivative: true,
        sourceBlockId,
        derivedFrom: sourceBlockId,
        contextDocumentId,
        contextTitle,
        modifications,
      },
    }

    await this.saveBlock(derivative)
    return derivative
  }

  async getDerivatives(sourceBlockId: string): Promise<Block[]> {
    const allBlocks = await this.getAllBlocks()
    return allBlocks.filter(
      block => block.derivation?.isDerivative && block.derivation.sourceBlockId === sourceBlockId
    )
  }

  async getDerivativeTree(blockId: string): Promise<{ source: Block | null; derivatives: Block[] }> {
    const block = await this.getBlock(blockId)
    if (!block) return { source: null, derivatives: [] }

    const sourceBlockId = block.derivation?.sourceBlockId || blockId
    const sourceBlock = await this.getBlock(sourceBlockId)
    const derivatives = await this.getDerivatives(sourceBlockId)

    return { source: sourceBlock, derivatives }
  }

  isContentModified(original: string, modified: string): boolean {
    return original.trim() !== modified.trim()
  }

  async autoCreateDerivativeIfModified(
    sourceBlockId: string,
    currentContent: string,
    contextDocumentId: string,
    contextTitle: string
  ): Promise<Block | null> {
    const sourceBlock = await this.getBlock(sourceBlockId)
    if (!sourceBlock) return null

    if (this.isContentModified(sourceBlock.content, currentContent)) {
      return this.createDerivative(sourceBlockId, currentContent, contextDocumentId, contextTitle, '自动检测到内容修改')
    }
    return null
  }

  // ---------- 样式层操作 ----------

  /** 更新 Block 的样式属性（合并，不覆盖未传入的字段） */
  async updateBlockStyle(id: string, style: Partial<BlockStyle>): Promise<void> {
    const block = await this.getBlock(id)
    if (!block) throw new Error('Block not found')
    block.style = { ...block.style, ...style }
    block.metadata.updatedAt = new Date()
    await this.saveBlock(block)
  }

  // ---------- 模板层操作 ----------

  /** 更新 Block 的模板属性（合并，不覆盖未传入的字段） */
  async updateBlockTemplate(id: string, template: Partial<BlockTemplate>): Promise<void> {
    const block = await this.getBlock(id)
    if (!block) throw new Error('Block not found')
    block.template = { ...block.template, role: block.template?.role ?? 'paragraph', ...template }
    block.metadata.updatedAt = new Date()
    await this.saveBlock(block)
  }

  // ---------- 编辑历史 ----------

  /** 追加编辑记录（用户改写 AI 内容时调用） */
  async appendEditRecord(id: string, editedBy: 'user' | 'ai', summary?: string): Promise<void> {
    const block = await this.getBlock(id)
    if (!block) throw new Error('Block not found')
    if (!block.editHistory) block.editHistory = []
    block.editHistory.push({ editedAt: new Date(), editedBy, summary })
    block.metadata.updatedAt = new Date()
    await this.saveBlock(block)
  }

  // ---------- Release 版本管理 ----------

  /** 将当前 content 快照为新 release */
  async createRelease(blockId: string, title: string): Promise<BlockRelease> {
    const block = await this.getBlock(blockId)
    if (!block) throw new Error('Block not found')
    if (!block.releases) block.releases = []

    const nextVersion = block.releases.length > 0
      ? Math.max(...block.releases.map(r => r.version)) + 1
      : 1

    const release: BlockRelease = {
      version: nextVersion,
      content: block.content,
      title,
      releasedAt: new Date(),
    }

    block.releases.push(release)
    block.metadata.updatedAt = new Date()
    await this.saveBlock(block)
    return release
  }

  /** 获取 Block 的所有 release 版本 */
  async getReleases(blockId: string): Promise<BlockRelease[]> {
    const block = await this.getBlock(blockId)
    if (!block) return []
    return block.releases ?? []
  }

  /** 获取指定版本的 release */
  async getRelease(blockId: string, version: number): Promise<BlockRelease | null> {
    const releases = await this.getReleases(blockId)
    return releases.find(r => r.version === version) ?? null
  }

  // ---------- 附属层（Annotations）操作 ----------

  /** 追加一条附属记录（append-only） */
  async addAnnotation(blockId: string, annotation: BlockAnnotation): Promise<void> {
    const block = await this.getBlock(blockId)
    if (!block) throw new Error('Block not found')
    if (!block.annotations) block.annotations = {}

    const key = annotation.type as keyof typeof block.annotations
    if (!block.annotations[key]) block.annotations[key] = []
    block.annotations[key]!.push(annotation)
    block.metadata.updatedAt = new Date()
    await this.saveBlock(block)
  }

  /** 获取某类型的所有附属记录 */
  async getAnnotations(blockId: string, type: AnnotationType): Promise<BlockAnnotation[]> {
    const block = await this.getBlock(blockId)
    if (!block?.annotations) return []
    return block.annotations[type] ?? []
  }

  /** 获取某类型的最新一条附属记录 */
  async getLatestAnnotation(blockId: string, type: AnnotationType): Promise<BlockAnnotation | null> {
    const annotations = await this.getAnnotations(blockId, type)
    if (annotations.length === 0) return null
    return annotations[annotations.length - 1]
  }

  /** 获取某类型在指定时间点之前的最新记录 */
  async getAnnotationAt(blockId: string, type: AnnotationType, before: Date): Promise<BlockAnnotation | null> {
    const annotations = await this.getAnnotations(blockId, type)
    const beforeTime = before.getTime()
    const filtered = annotations.filter(a => new Date(a.createdAt).getTime() <= beforeTime)
    if (filtered.length === 0) return null
    return filtered[filtered.length - 1]
  }

  /** 获取 Block 的所有附属层摘要（每种类型的最新记录） */
  async getAnnotationsSummary(blockId: string): Promise<Record<AnnotationType, BlockAnnotation | null>> {
    const block = await this.getBlock(blockId)
    const types: AnnotationType[] = ['translation', 'explanation', 'comment', 'footnote']
    const result = {} as Record<AnnotationType, BlockAnnotation | null>
    for (const type of types) {
      const list = block?.annotations?.[type]
      result[type] = list && list.length > 0 ? list[list.length - 1] : null
    }
    return result
  }
}

export const blockStore = new BlockStore()
