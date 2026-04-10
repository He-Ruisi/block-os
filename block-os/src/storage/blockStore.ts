import type { Block } from '../types/block'
import { generateUUID } from '../utils/uuid'
import { initDatabase, getDatabase, isDatabaseInitialized } from './database'

export type { Block }
export { generateUUID }

const STORE_NAME = 'blocks'

export class BlockStore {
  async init(): Promise<void> {
    await initDatabase()
  }

  isInitialized(): boolean {
    return isDatabaseInitialized()
  }

  async saveBlock(block: Block): Promise<string> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(block)
      req.onsuccess = () => resolve(block.id)
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

  async deleteBlock(id: string): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => resolve()
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
      source: { type: 'editor', documentId: contextDocumentId, capturedAt: new Date() },
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
}

export const blockStore = new BlockStore()
