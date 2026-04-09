// Block 数据模型
export interface Block {
  id: string
  content: string
  type: 'text' | 'ai-generated' | 'heading' | 'list' | 'code'
  source: {
    type: 'editor' | 'ai'
    documentId?: string
    aiMessageId?: string
    capturedAt: Date
  }
  metadata: {
    title?: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }
  links?: {
    outgoing: string[]  // 引用的其他 blocks
    incoming: string[]  // 被哪些 blocks 引用
  }
}

// IndexedDB 封装类
export class BlockStore {
  private dbName = 'blockos-db'
  private storeName = 'blocks'
  private version = 1
  private db: IDBDatabase | null = null

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建 blocks store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          
          // 创建索引
          store.createIndex('tags', 'metadata.tags', { multiEntry: true })
          store.createIndex('createdAt', 'metadata.createdAt', { unique: false })
          store.createIndex('type', 'type', { unique: false })
        }
      }
    })
  }

  // 保存 Block
  async saveBlock(block: Block): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(block)

      request.onsuccess = () => resolve(block.id)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取单个 Block
  async getBlock(id: string): Promise<Block | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有 Blocks
  async getAllBlocks(): Promise<Block[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const blocks = request.result
        // 按创建时间倒序排序
        blocks.sort((a, b) => 
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        )
        resolve(blocks)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 搜索 Blocks（内容搜索）
  async searchBlocks(query: string): Promise<Block[]> {
    const allBlocks = await this.getAllBlocks()
    const lowerQuery = query.toLowerCase()

    return allBlocks.filter(block => 
      block.content.toLowerCase().includes(lowerQuery) ||
      block.metadata.title?.toLowerCase().includes(lowerQuery) ||
      block.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // 按标签获取 Blocks
  async getBlocksByTag(tag: string): Promise<Block[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('tags')
      const request = index.getAll(tag)

      request.onsuccess = () => {
        const blocks = request.result
        blocks.sort((a, b) => 
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        )
        resolve(blocks)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    const allBlocks = await this.getAllBlocks()
    const tagsSet = new Set<string>()
    
    allBlocks.forEach(block => {
      block.metadata.tags.forEach(tag => tagsSet.add(tag))
    })
    
    return Array.from(tagsSet).sort()
  }

  // 删除 Block
  async deleteBlock(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 更新 Block
  async updateBlock(id: string, updates: Partial<Block>): Promise<void> {
    const block = await this.getBlock(id)
    if (!block) throw new Error('Block not found')

    const updatedBlock: Block = {
      ...block,
      ...updates,
      metadata: {
        ...block.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }

    await this.saveBlock(updatedBlock)
  }

  // 添加链接关系
  async addLink(fromBlockId: string, toBlockId: string): Promise<void> {
    const fromBlock = await this.getBlock(fromBlockId)
    const toBlock = await this.getBlock(toBlockId)
    
    if (!fromBlock || !toBlock) throw new Error('Block not found')

    // 初始化 links 对象
    if (!fromBlock.links) {
      fromBlock.links = { outgoing: [], incoming: [] }
    }
    if (!toBlock.links) {
      toBlock.links = { outgoing: [], incoming: [] }
    }

    // 添加链接（避免重复）
    if (!fromBlock.links.outgoing.includes(toBlockId)) {
      fromBlock.links.outgoing.push(toBlockId)
    }
    if (!toBlock.links.incoming.includes(fromBlockId)) {
      toBlock.links.incoming.push(fromBlockId)
    }

    // 保存更新
    await this.saveBlock(fromBlock)
    await this.saveBlock(toBlock)
  }

  // 移除链接关系
  async removeLink(fromBlockId: string, toBlockId: string): Promise<void> {
    const fromBlock = await this.getBlock(fromBlockId)
    const toBlock = await this.getBlock(toBlockId)
    
    if (!fromBlock || !toBlock) return

    if (fromBlock.links) {
      fromBlock.links.outgoing = fromBlock.links.outgoing.filter(id => id !== toBlockId)
    }
    if (toBlock.links) {
      toBlock.links.incoming = toBlock.links.incoming.filter(id => id !== fromBlockId)
    }

    await this.saveBlock(fromBlock)
    await this.saveBlock(toBlock)
  }

  // 获取 Block 的所有链接
  async getBlockLinks(blockId: string): Promise<{ outgoing: Block[]; incoming: Block[] }> {
    const block = await this.getBlock(blockId)
    if (!block || !block.links) {
      return { outgoing: [], incoming: [] }
    }

    const outgoing = await Promise.all(
      block.links.outgoing.map(id => this.getBlock(id))
    )
    const incoming = await Promise.all(
      block.links.incoming.map(id => this.getBlock(id))
    )

    return {
      outgoing: outgoing.filter((b): b is Block => b !== null),
      incoming: incoming.filter((b): b is Block => b !== null)
    }
  }
}

// 生成 UUID
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 单例实例
export const blockStore = new BlockStore()
