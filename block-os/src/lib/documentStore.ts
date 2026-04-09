import { blockStore, generateUUID } from './blockStore'

// 文档数据模型
export interface Document {
  id: string
  title: string
  content: string // JSON 格式的编辑器内容
  blocks: DocumentBlock[] // 文档中的隐式 Block
  projectId?: string // 所属项目 ID（可选）
  metadata: {
    createdAt: Date
    updatedAt: Date
  }
}

// 文档中的隐式 Block
export interface DocumentBlock {
  id: string // Block ID
  nodeType: string // paragraph, heading, listItem 等
  content: string // 纯文本内容
  position: number // 在文档中的位置
  links: string[] // 该段落中的链接
}

// 文档存储类
export class DocumentStore {
  private dbName = 'blockos-db'
  private storeName = 'documents'
  private version = 2 // 升级版本
  private db: IDBDatabase | null = null
  private currentDocumentId: string | null = null

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

        // 创建 blocks store（如果不存在）- 确保与 blockStore 兼容
        if (!db.objectStoreNames.contains('blocks')) {
          const blockStore = db.createObjectStore('blocks', { keyPath: 'id' })
          blockStore.createIndex('tags', 'metadata.tags', { multiEntry: true })
          blockStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
          blockStore.createIndex('type', 'type', { unique: false })
        }

        // 创建 documents store（如果不存在）
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
        }
      }
    })
  }

  // 保存文档
  async saveDocument(doc: Document): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(doc)

      request.onsuccess = () => resolve(doc.id)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取文档
  async getDocument(id: string): Promise<Document | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // 设置当前文档
  setCurrentDocument(id: string) {
    this.currentDocumentId = id
  }

  // 获取当前文档 ID
  getCurrentDocumentId(): string | null {
    return this.currentDocumentId
  }

  // 从编辑器内容提取隐式 Block
  extractImplicitBlocks(editorJSON: any): DocumentBlock[] {
    const blocks: DocumentBlock[] = []
    let position = 0

    const traverse = (node: any) => {
      // 处理段落、标题等块级节点
      if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem') {
        const content = this.extractTextContent(node)
        const links = this.extractLinks(node)
        
        if (content.trim()) {
          blocks.push({
            id: generateUUID(),
            nodeType: node.type,
            content: content.trim(),
            position: position++,
            links,
          })
        }
      }

      // 递归处理子节点
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => traverse(child))
      }
    }

    if (editorJSON.content) {
      editorJSON.content.forEach((node: any) => traverse(node))
    }

    return blocks
  }

  // 提取文本内容
  private extractTextContent(node: any): string {
    if (node.type === 'text') {
      return node.text || ''
    }

    if (node.content && Array.isArray(node.content)) {
      return node.content.map((child: any) => this.extractTextContent(child)).join('')
    }

    return ''
  }

  // 提取链接
  private extractLinks(node: any): string[] {
    const links: string[] = []

    const traverse = (n: any) => {
      if (n.type === 'blockLink' && n.attrs?.blockId) {
        links.push(n.attrs.blockId)
      }

      if (n.content && Array.isArray(n.content)) {
        n.content.forEach((child: any) => traverse(child))
      }
    }

    traverse(node)
    return links
  }

  // 更新文档的隐式 Block
  async updateDocumentBlocks(documentId: string, editorJSON: any): Promise<void> {
    const doc = await this.getDocument(documentId)
    if (!doc) return

    const oldBlocks = doc.blocks
    const newBlocks = this.extractImplicitBlocks(editorJSON)

    // 检测链接变化并更新关系
    await this.updateLinkRelations(documentId, oldBlocks, newBlocks)

    // 更新文档
    doc.blocks = newBlocks
    doc.content = JSON.stringify(editorJSON)
    doc.metadata.updatedAt = new Date()

    await this.saveDocument(doc)
  }

  // 更新链接关系
  private async updateLinkRelations(
    documentId: string,
    oldBlocks: DocumentBlock[],
    newBlocks: DocumentBlock[]
  ): Promise<void> {
    // 收集旧的和新的链接
    const oldLinks = new Set<string>()
    const newLinks = new Set<string>()

    oldBlocks.forEach(block => {
      block.links.forEach(link => oldLinks.add(link))
    })

    newBlocks.forEach(block => {
      block.links.forEach(link => newLinks.add(link))
    })

    // 找出新增的链接
    const addedLinks = Array.from(newLinks).filter(link => !oldLinks.has(link))
    
    // 找出删除的链接
    const removedLinks = Array.from(oldLinks).filter(link => !newLinks.has(link))

    // 添加新链接关系
    for (const targetBlockId of addedLinks) {
      try {
        await blockStore.addLink(documentId, targetBlockId)
      } catch (error) {
        console.error('Failed to add link:', error)
      }
    }

    // 移除旧链接关系
    for (const targetBlockId of removedLinks) {
      try {
        await blockStore.removeLink(documentId, targetBlockId)
      } catch (error) {
        console.error('Failed to remove link:', error)
      }
    }
  }

  // 创建新文档
  async createDocument(title: string = '无标题文档', projectId?: string): Promise<Document> {
    const doc: Document = {
      id: generateUUID(),
      title,
      content: '',
      blocks: [],
      projectId,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    await this.saveDocument(doc)
    return doc
  }

  // 获取所有文档
  async getAllDocuments(): Promise<Document[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const docs = request.result
        docs.sort((a, b) => 
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        )
        resolve(docs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 获取项目下的所有文档
  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    const allDocs = await this.getAllDocuments()
    return allDocs.filter(doc => doc.projectId === projectId)
  }

  // 获取今日文档（今天创建或修改的）
  async getTodayDocuments(): Promise<Document[]> {
    const allDocs = await this.getAllDocuments()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return allDocs.filter(doc => {
      const updatedAt = new Date(doc.metadata.updatedAt)
      updatedAt.setHours(0, 0, 0, 0)
      return updatedAt.getTime() === today.getTime()
    })
  }

  // 更新文档的项目归属
  async updateDocumentProject(documentId: string, projectId: string | undefined): Promise<void> {
    const doc = await this.getDocument(documentId)
    if (!doc) throw new Error('Document not found')
    
    doc.projectId = projectId
    doc.metadata.updatedAt = new Date()
    await this.saveDocument(doc)
  }
}

// 单例实例
export const documentStore = new DocumentStore()

// 导出 generateUUID 供其他模块使用
export { generateUUID } from './blockStore'
