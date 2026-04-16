import { isSupabaseEnabled } from '../lib/supabase'
import {
  syncProjectToSupabase,
  syncDocumentToSupabase,
  syncBlockToSupabase,
  syncOCRPhotoRecordToSupabase,
  deleteProjectFromSupabase,
  deleteDocumentFromSupabase,
  deleteBlockFromSupabase,
  deleteOCRPhotoRecordFromSupabase,
  fetchProjectsFromSupabase,
  fetchDocumentsFromSupabase,
  fetchBlocksFromSupabase,
  fetchOCRPhotoRecordsFromSupabase,
} from './syncService'
import { projectStore } from '../storage/projectStore'
import { documentStore } from '../storage/documentStore'
import { blockStore } from '../storage/blockStore'
import { ocrPhotoStore } from '../storage/ocrPhotoStore'
import type { Project } from '../types/project'
import type { Document } from '../types/document'
import type { Block } from '../types/block'
import type { OCRPhotoRecord } from '../types/ocr'

// 同步状态管理
interface SyncState {
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingChanges: {
    projects: Set<string>
    documents: Set<string>
    blocks: Set<string>
    ocrPhotoRecords: Set<string>
    deletedProjects: Set<string>
    deletedDocuments: Set<string>
    deletedBlocks: Set<string>
    deletedOCRPhotoRecords: Set<string>
  }
  isOnline: boolean
}

interface PersistedSyncQueue {
  projects: string[]
  documents: string[]
  blocks: string[]
  ocrPhotoRecords: string[]
  deletedProjects: string[]
  deletedDocuments: string[]
  deletedBlocks: string[]
  deletedOCRPhotoRecords: string[]
}

const SYNC_QUEUE_STORAGE_KEY = 'blockos-sync-queue'

class AutoSyncService {
  private state: SyncState = {
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: {
      projects: new Set(),
      documents: new Set(),
      blocks: new Set(),
      ocrPhotoRecords: new Set(),
      deletedProjects: new Set(),
      deletedDocuments: new Set(),
      deletedBlocks: new Set(),
      deletedOCRPhotoRecords: new Set(),
    },
    isOnline: navigator.onLine,
  }

  private syncInterval: number | null = null
  private readonly SYNC_INTERVAL_MS = 30000 // 30 秒自动同步一次
  private listeners: Array<(state: SyncState) => void> = []

  constructor() {
    this.loadPendingChanges()
    // 监听网络状态变化
    window.addEventListener('online', () => this.handleOnlineStatusChange(true))
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false))
  }

  // ---------- 状态管理 ----------

  getState(): SyncState {
    return { ...this.state }
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()))
  }

  private persistPendingChanges(): void {
    const payload: PersistedSyncQueue = {
      projects: Array.from(this.state.pendingChanges.projects),
      documents: Array.from(this.state.pendingChanges.documents),
      blocks: Array.from(this.state.pendingChanges.blocks),
      ocrPhotoRecords: Array.from(this.state.pendingChanges.ocrPhotoRecords),
      deletedProjects: Array.from(this.state.pendingChanges.deletedProjects),
      deletedDocuments: Array.from(this.state.pendingChanges.deletedDocuments),
      deletedBlocks: Array.from(this.state.pendingChanges.deletedBlocks),
      deletedOCRPhotoRecords: Array.from(this.state.pendingChanges.deletedOCRPhotoRecords),
    }
    localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(payload))
  }

  private loadPendingChanges(): void {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_STORAGE_KEY)
      if (!raw) return
      const persisted = JSON.parse(raw) as Partial<PersistedSyncQueue>
      this.state.pendingChanges.projects = new Set(persisted.projects || [])
      this.state.pendingChanges.documents = new Set(persisted.documents || [])
      this.state.pendingChanges.blocks = new Set(persisted.blocks || [])
      this.state.pendingChanges.ocrPhotoRecords = new Set(persisted.ocrPhotoRecords || [])
      this.state.pendingChanges.deletedProjects = new Set(persisted.deletedProjects || [])
      this.state.pendingChanges.deletedDocuments = new Set(persisted.deletedDocuments || [])
      this.state.pendingChanges.deletedBlocks = new Set(persisted.deletedBlocks || [])
      this.state.pendingChanges.deletedOCRPhotoRecords = new Set(persisted.deletedOCRPhotoRecords || [])
    } catch (error) {
      console.error('[AutoSync] 加载待同步队列失败:', error)
    }
  }

  private handleOnlineStatusChange(isOnline: boolean): void {
    console.log(`[AutoSync] 网络状态变更: ${isOnline ? '在线' : '离线'}`)
    this.state.isOnline = isOnline
    this.notifyListeners()

    // 重新上线时立即同步待处理的变更
    if (isOnline && this.hasPendingChanges()) {
      console.log('[AutoSync] 检测到网络恢复，开始同步待处理变更')
      this.syncPendingChanges()
    }
  }

  // ---------- 待处理变更管理 ----------

  markProjectChanged(projectId: string): void {
    this.state.pendingChanges.deletedProjects.delete(projectId)
    this.state.pendingChanges.projects.add(projectId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markDocumentChanged(documentId: string): void {
    this.state.pendingChanges.deletedDocuments.delete(documentId)
    this.state.pendingChanges.documents.add(documentId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markBlockChanged(blockId: string): void {
    this.state.pendingChanges.deletedBlocks.delete(blockId)
    this.state.pendingChanges.blocks.add(blockId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markOCRPhotoRecordChanged(recordId: string): void {
    this.state.pendingChanges.deletedOCRPhotoRecords.delete(recordId)
    this.state.pendingChanges.ocrPhotoRecords.add(recordId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markProjectDeleted(projectId: string): void {
    this.state.pendingChanges.projects.delete(projectId)
    this.state.pendingChanges.deletedProjects.add(projectId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markDocumentDeleted(documentId: string): void {
    this.state.pendingChanges.documents.delete(documentId)
    this.state.pendingChanges.deletedDocuments.add(documentId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markBlockDeleted(blockId: string): void {
    this.state.pendingChanges.blocks.delete(blockId)
    this.state.pendingChanges.deletedBlocks.add(blockId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  markOCRPhotoRecordDeleted(recordId: string): void {
    this.state.pendingChanges.ocrPhotoRecords.delete(recordId)
    this.state.pendingChanges.deletedOCRPhotoRecords.add(recordId)
    this.persistPendingChanges()
    this.notifyListeners()
  }

  hasPendingChanges(): boolean {
    return (
      this.state.pendingChanges.projects.size > 0 ||
      this.state.pendingChanges.documents.size > 0 ||
      this.state.pendingChanges.blocks.size > 0 ||
      this.state.pendingChanges.ocrPhotoRecords.size > 0 ||
      this.state.pendingChanges.deletedProjects.size > 0 ||
      this.state.pendingChanges.deletedDocuments.size > 0 ||
      this.state.pendingChanges.deletedBlocks.size > 0 ||
      this.state.pendingChanges.deletedOCRPhotoRecords.size > 0
    )
  }

  // ---------- 自动同步 ----------

  /** 启动自动同步（登录后调用） */
  startAutoSync(userId: string): void {
    if (!isSupabaseEnabled) {
      console.log('[AutoSync] Supabase 未启用，跳过自动同步')
      return
    }

    if (this.syncInterval !== null) {
      console.log('[AutoSync] 自动同步已在运行')
      return
    }

    console.log('[AutoSync] 启动自动同步')
    this.syncInterval = window.setInterval(() => {
      if (this.state.isOnline && this.hasPendingChanges()) {
        this.syncPendingChanges(userId)
      }
    }, this.SYNC_INTERVAL_MS)
  }

  /** 停止自动同步（登出后调用） */
  stopAutoSync(): void {
    if (this.syncInterval !== null) {
      console.log('[AutoSync] 停止自动同步')
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /** 同步待处理的变更到云端 */
  async syncPendingChanges(userId?: string): Promise<void> {
    if (!isSupabaseEnabled || !this.state.isOnline) {
      console.log('[AutoSync] 无法同步：Supabase 未启用或网络离线')
      return
    }

    if (this.state.isSyncing) {
      console.log('[AutoSync] 同步正在进行中，跳过')
      return
    }

    if (!this.hasPendingChanges()) {
      return
    }

    // 如果没有传入 userId，尝试从当前认证状态获取
    if (!userId) {
      const { getCurrentUser } = await import('./authService')
      const user = await getCurrentUser()
      if (!user) {
        console.warn('[AutoSync] 未登录，无法同步')
        return
      }
      userId = user.id
    }

    this.state.isSyncing = true
    this.notifyListeners()

    try {
      console.log('[AutoSync] 开始同步待处理变更')

      // 先同步删除，避免同一对象出现“先更新后删除”的状态竞争
      for (const blockId of Array.from(this.state.pendingChanges.deletedBlocks)) {
        try {
          await deleteBlockFromSupabase(blockId)
          this.state.pendingChanges.deletedBlocks.delete(blockId)
        } catch (error) {
          console.error(`[AutoSync] 删除 Block 失败 ${blockId}:`, error)
        }
      }

      for (const recordId of Array.from(this.state.pendingChanges.deletedOCRPhotoRecords)) {
        try {
          await deleteOCRPhotoRecordFromSupabase(recordId)
          this.state.pendingChanges.deletedOCRPhotoRecords.delete(recordId)
        } catch (error) {
          console.error(`[AutoSync] 删除 OCR 记录失败 ${recordId}:`, error)
        }
      }

      for (const documentId of Array.from(this.state.pendingChanges.deletedDocuments)) {
        try {
          await deleteDocumentFromSupabase(documentId)
          this.state.pendingChanges.deletedDocuments.delete(documentId)
        } catch (error) {
          console.error(`[AutoSync] 删除文档失败 ${documentId}:`, error)
        }
      }

      for (const projectId of Array.from(this.state.pendingChanges.deletedProjects)) {
        try {
          await deleteProjectFromSupabase(projectId)
          this.state.pendingChanges.deletedProjects.delete(projectId)
        } catch (error) {
          console.error(`[AutoSync] 删除项目失败 ${projectId}:`, error)
        }
      }

      // 同步 Projects
      for (const projectId of Array.from(this.state.pendingChanges.projects)) {
        try {
          const project = await projectStore.getProject(projectId)
          if (project) {
            await syncProjectToSupabase(project, userId)
            this.state.pendingChanges.projects.delete(projectId)
          } else {
            this.state.pendingChanges.projects.delete(projectId)
          }
        } catch (error) {
          console.error(`[AutoSync] 同步项目失败 ${projectId}:`, error)
        }
      }

      // 同步 Documents
      for (const documentId of Array.from(this.state.pendingChanges.documents)) {
        try {
          const document = await documentStore.getDocument(documentId)
          if (document) {
            await syncDocumentToSupabase(document, userId)
            this.state.pendingChanges.documents.delete(documentId)
          } else {
            this.state.pendingChanges.documents.delete(documentId)
          }
        } catch (error) {
          console.error(`[AutoSync] 同步文档失败 ${documentId}:`, error)
        }
      }

      // 同步 Blocks
      for (const blockId of Array.from(this.state.pendingChanges.blocks)) {
        try {
          const block = await blockStore.getBlock(blockId)
          if (block) {
            await syncBlockToSupabase(block, userId)
            this.state.pendingChanges.blocks.delete(blockId)
          } else {
            this.state.pendingChanges.blocks.delete(blockId)
          }
        } catch (error) {
          console.error(`[AutoSync] 同步 Block 失败 ${blockId}:`, error)
        }
      }

      for (const recordId of Array.from(this.state.pendingChanges.ocrPhotoRecords)) {
        try {
          const record = await ocrPhotoStore.getRecord(recordId)
          if (record) {
            await syncOCRPhotoRecordToSupabase(record, userId)
            this.state.pendingChanges.ocrPhotoRecords.delete(recordId)
          } else {
            this.state.pendingChanges.ocrPhotoRecords.delete(recordId)
          }
        } catch (error) {
          console.error(`[AutoSync] 同步 OCR 记录失败 ${recordId}:`, error)
        }
      }

      this.state.lastSyncTime = new Date()
      this.persistPendingChanges()
      console.log('[AutoSync] 同步完成')
    } catch (error) {
      console.error('[AutoSync] 同步过程出错:', error)
    } finally {
      this.state.isSyncing = false
      this.notifyListeners()
    }
  }

  /** 手动触发立即同步 */
  async syncNow(userId: string): Promise<void> {
    await this.syncPendingChanges(userId)
  }

  // ---------- 首次登录拉取数据 ----------

  /** 首次登录时从云端拉取所有数据 */
  async pullFromCloud(userId: string): Promise<{
    projects: number
    documents: number
    blocks: number
    ocrPhotoRecords: number
  }> {
    if (!isSupabaseEnabled) {
      console.log('[AutoSync] Supabase 未启用，跳过云端拉取')
      return { projects: 0, documents: 0, blocks: 0, ocrPhotoRecords: 0 }
    }

    if (!this.state.isOnline) {
      throw new Error('网络离线，无法从云端拉取数据')
    }

    console.log('[AutoSync] 开始从云端拉取数据')

    try {
      // 拉取 Projects
        const cloudProjects = await fetchProjectsFromSupabase(userId)
        for (const project of cloudProjects) {
        await projectStore.updateProject(project.id, project, { skipSyncMark: true }).catch(async () => {
          // 如果不存在则创建
          const db = (await import('../storage/database')).getDatabase()
          await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(['projects'], 'readwrite')
            const req = tx.objectStore('projects').add(project)
            req.onsuccess = () => resolve()
            req.onerror = () => reject(req.error)
          })
        })
      }

      // 拉取 Documents
      const cloudDocuments = await fetchDocumentsFromSupabase(userId)
      for (const document of cloudDocuments) {
        await documentStore.saveDocument(document, { skipSyncMark: true })
      }

      // 拉取 Blocks
      const cloudBlocks = await fetchBlocksFromSupabase(userId)
      for (const block of cloudBlocks) {
        await blockStore.saveBlock(block, { skipSyncMark: true })
      }

      const cloudOCRPhotoRecords = await fetchOCRPhotoRecordsFromSupabase(userId)
      for (const record of cloudOCRPhotoRecords) {
        await ocrPhotoStore.saveRecord(record, { skipSyncMark: true })
      }

      console.log('[AutoSync] 云端数据拉取完成', {
        projects: cloudProjects.length,
        documents: cloudDocuments.length,
        blocks: cloudBlocks.length,
        ocrPhotoRecords: cloudOCRPhotoRecords.length,
      })

      return {
        projects: cloudProjects.length,
        documents: cloudDocuments.length,
        blocks: cloudBlocks.length,
        ocrPhotoRecords: cloudOCRPhotoRecords.length,
      }
    } catch (error) {
      console.error('[AutoSync] 云端数据拉取失败:', error)
      throw error
    }
  }

  // ---------- 离线模式支持 ----------

  /** 检查是否处于离线模式 */
  isOffline(): boolean {
    return !this.state.isOnline
  }

  /** 获取离线状态下的待同步数量 */
  getPendingChangesCount(): number {
    return (
      this.state.pendingChanges.projects.size +
      this.state.pendingChanges.documents.size +
      this.state.pendingChanges.blocks.size +
      this.state.pendingChanges.ocrPhotoRecords.size +
      this.state.pendingChanges.deletedProjects.size +
      this.state.pendingChanges.deletedDocuments.size +
      this.state.pendingChanges.deletedBlocks.size +
      this.state.pendingChanges.deletedOCRPhotoRecords.size
    )
  }
}

// 单例导出
export const autoSyncService = new AutoSyncService()

// 便捷方法：包装 store 操作，自动标记变更
export async function saveProjectWithSync(project: Project): Promise<void> {
  await projectStore.updateProject(project.id, project).catch(async () => {
    // 如果不存在则创建
    const db = (await import('../storage/database')).getDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['projects'], 'readwrite')
      const req = tx.objectStore('projects').add(project)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  })
  autoSyncService.markProjectChanged(project.id)
}

export async function saveDocumentWithSync(document: Document): Promise<void> {
  await documentStore.saveDocument(document)
  autoSyncService.markDocumentChanged(document.id)
}

export async function saveBlockWithSync(block: Block): Promise<void> {
  await blockStore.saveBlock(block)
  autoSyncService.markBlockChanged(block.id)
}

export async function saveOCRPhotoRecordWithSync(record: OCRPhotoRecord): Promise<void> {
  await ocrPhotoStore.saveRecord(record)
  autoSyncService.markOCRPhotoRecordChanged(record.id)
}
