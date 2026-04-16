import type { Document, DocumentBlock } from '../types/models/document'
import { generateUUID } from '../utils/uuid'
import { initDatabase, getDatabase } from './database'
import { blockStore } from './blockStore'

export type { Document, DocumentBlock }

const STORE_NAME = 'documents'

interface DocumentStoreOptions {
  skipSyncMark?: boolean
}

export class DocumentStore {
  private currentDocumentId: string | null = null

  async init(): Promise<void> {
    await initDatabase()
  }

  setCurrentDocument(id: string): void {
    this.currentDocumentId = id
  }

  getCurrentDocumentId(): string | null {
    return this.currentDocumentId
  }

  async saveDocument(doc: Document, options: DocumentStoreOptions = {}): Promise<string> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).put(doc)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          // 标记文档已变更，等待同步
          import('../services/integration/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markDocumentChanged(doc.id)
          })
        }
        resolve(doc.id)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getDocument(id: string): Promise<Document | null> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async getAllDocuments(): Promise<Document[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => {
        const docs: Document[] = req.result
        docs.sort((a, b) =>
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        )
        resolve(docs)
      }
      req.onerror = () => reject(req.error)
    })
  }

  /**
   * 生成唯一的文档标题，如果标题已存在则自动添加数字后缀
   * @param baseTitle 基础标题
   * @returns 唯一的文档标题
   */
  async generateUniqueDocumentTitle(baseTitle: string): Promise<string> {
    const allDocs = await this.getAllDocuments()
    const existingTitles = new Set(allDocs.map(doc => doc.title))
    
    // 如果标题不存在，直接返回
    if (!existingTitles.has(baseTitle)) {
      return baseTitle
    }
    
    // 如果标题已存在，添加数字后缀
    let counter = 1
    let newTitle = `${baseTitle}${counter}`
    
    while (existingTitles.has(newTitle)) {
      counter++
      newTitle = `${baseTitle}${counter}`
    }
    
    return newTitle
  }

  async createDocument(title = '无标题文档', projectId?: string): Promise<Document> {
    // 生成唯一标题
    const uniqueTitle = await this.generateUniqueDocumentTitle(title)
    
    const doc: Document = {
      id: generateUUID(),
      title: uniqueTitle,
      content: '',
      blocks: [],
      projectId,
      metadata: { createdAt: new Date(), updatedAt: new Date() },
    }
    await this.saveDocument(doc)
    return doc
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    const allDocs = await this.getAllDocuments()
    return allDocs.filter(doc => doc.projectId === projectId)
  }

  async deleteDocument(id: string, options: DocumentStoreOptions = {}): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          import('../services/integration/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markDocumentDeleted(id)
          })
        }
        resolve()
      }
      req.onerror = () => reject(req.error)
    })
  }

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

  async updateDocumentProject(documentId: string, projectId: string | undefined): Promise<void> {
    const doc = await this.getDocument(documentId)
    if (!doc) throw new Error('Document not found')
    doc.projectId = projectId
    doc.metadata.updatedAt = new Date()
    await this.saveDocument(doc)
  }

  extractImplicitBlocks(editorJSON: unknown): DocumentBlock[] {
    const blocks: DocumentBlock[] = []
    let position = 0

    const extractText = (node: unknown): string => {
      const n = node as Record<string, unknown>
      if (n.type === 'text') return (n.text as string) || ''
      if (Array.isArray(n.content)) {
        return (n.content as unknown[]).map(extractText).join('')
      }
      return ''
    }

    const extractLinks = (node: unknown): string[] => {
      const links: string[] = []
      const traverse = (n: unknown) => {
        const obj = n as Record<string, unknown>
        if (obj.type === 'blockLink' && (obj.attrs as Record<string, unknown>)?.blockId) {
          links.push((obj.attrs as Record<string, unknown>).blockId as string)
        }
        if (Array.isArray(obj.content)) (obj.content as unknown[]).forEach(traverse)
      }
      traverse(node)
      return links
    }

    const traverse = (node: unknown) => {
      const n = node as Record<string, unknown>
      if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'listItem') {
        const content = extractText(n)
        const links = extractLinks(n)
        if (content.trim()) {
          blocks.push({ id: generateUUID(), nodeType: n.type as string, content: content.trim(), position: position++, links })
        }
      }
      if (Array.isArray(n.content)) (n.content as unknown[]).forEach(traverse)
    }

    const json = editorJSON as Record<string, unknown>
    if (Array.isArray(json.content)) (json.content as unknown[]).forEach(traverse)

    return blocks
  }

  async updateDocumentBlocks(documentId: string, editorJSON: unknown): Promise<void> {
    const doc = await this.getDocument(documentId)
    if (!doc) return

    const oldBlocks = doc.blocks
    const newBlocks = this.extractImplicitBlocks(editorJSON)

    await this.updateLinkRelations(documentId, oldBlocks, newBlocks)

    doc.blocks = newBlocks
    doc.content = JSON.stringify(editorJSON)
    doc.metadata.updatedAt = new Date()
    await this.saveDocument(doc)
  }

  private async updateLinkRelations(
    documentId: string,
    oldBlocks: DocumentBlock[],
    newBlocks: DocumentBlock[]
  ): Promise<void> {
    const oldLinks = new Set<string>()
    const newLinks = new Set<string>()

    oldBlocks.forEach(b => b.links.forEach(l => oldLinks.add(l)))
    newBlocks.forEach(b => b.links.forEach(l => newLinks.add(l)))

    const addedLinks = Array.from(newLinks).filter(l => !oldLinks.has(l))
    const removedLinks = Array.from(oldLinks).filter(l => !newLinks.has(l))

    for (const targetBlockId of addedLinks) {
      try { await blockStore.addLink(documentId, targetBlockId) } catch (e) { console.error('Failed to add link:', e) }
    }
    for (const targetBlockId of removedLinks) {
      try { await blockStore.removeLink(documentId, targetBlockId) } catch (e) { console.error('Failed to remove link:', e) }
    }
  }
}

export const documentStore = new DocumentStore()
