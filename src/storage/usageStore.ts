import type { BlockUsage } from '../types/block'
import { generateUUID } from '../utils/uuid'
import { getDatabase } from './database'

const STORE_NAME = 'usages'

export class UsageStore {
  /** 记录 Block 被文档引用 */
  async addUsage(
    blockId: string,
    releaseVersion: number,
    documentId: string,
    documentTitle: string
  ): Promise<BlockUsage> {
    const usage: BlockUsage = {
      id: generateUUID(),
      blockId,
      releaseVersion,
      documentId,
      documentTitle,
      insertedAt: new Date(),
    }
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).put(usage)
      req.onsuccess = () => resolve(usage)
      req.onerror = () => reject(req.error)
    })
  }

  /** 查询 Block 的所有使用记录 */
  async getUsagesByBlock(blockId: string): Promise<BlockUsage[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).index('blockId').getAll(blockId)
      req.onsuccess = () => {
        const usages: BlockUsage[] = req.result
        usages.sort((a, b) => new Date(b.insertedAt).getTime() - new Date(a.insertedAt).getTime())
        resolve(usages)
      }
      req.onerror = () => reject(req.error)
    })
  }

  /** 查询文档中的所有引用 */
  async getUsagesByDocument(documentId: string): Promise<BlockUsage[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).index('documentId').getAll(documentId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  /** 删除单条引用记录 */
  async removeUsage(id: string): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  /** 文档删除时清理所有引用 */
  async removeUsagesByDocument(documentId: string): Promise<void> {
    const usages = await this.getUsagesByDocument(documentId)
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      usages.forEach(u => store.delete(u.id))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export const usageStore = new UsageStore()
