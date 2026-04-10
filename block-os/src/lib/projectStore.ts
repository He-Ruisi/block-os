import type { Project, Tab } from '../types/project'
import { generateUUID } from '../utils/uuid'

// 重新导出类型，保持向后兼容
export type { Project, Tab }

// 项目存储类
export class ProjectStore {
  private dbName = 'blockos-db'
  private storeName = 'projects'
  private version = 3 // 升级到 version 3 以创建 projects store
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

        // 创建 projects store（如果不存在）
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('createdAt', 'metadata.createdAt', { unique: false })
          store.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
        }

        // 确保其他 stores 存在
        if (!db.objectStoreNames.contains('blocks')) {
          const blockStore = db.createObjectStore('blocks', { keyPath: 'id' })
          blockStore.createIndex('tags', 'metadata.tags', { multiEntry: true })
          blockStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
          blockStore.createIndex('type', 'type', { unique: false })
        }

        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' })
          docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
        }
      }
    })
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.db !== null
  }

  // 创建项目
  async createProject(name: string, description?: string): Promise<Project> {
    if (!this.db) throw new Error('Database not initialized')

    const project: Project = {
      id: generateUUID(),
      name,
      description,
      documents: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(project)

      request.onsuccess = () => resolve(project)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有项目
  async getAllProjects(): Promise<Project[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const projects = request.result
        // 按更新时间倒序排序
        projects.sort((a, b) => 
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        )
        resolve(projects)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 获取单个项目
  async getProject(id: string): Promise<Project | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // 更新项目
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const project = await this.getProject(id)
    if (!project) throw new Error('Project not found')

    const updatedProject: Project = {
      ...project,
      ...updates,
      metadata: {
        ...project.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(updatedProject)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 删除项目
  async deleteProject(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 添加文档到项目
  async addDocumentToProject(projectId: string, documentId: string): Promise<void> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error('Project not found')

    if (!project.documents.includes(documentId)) {
      project.documents.push(documentId)
      await this.updateProject(projectId, { documents: project.documents })
    }
  }

  // 从项目移除文档
  async removeDocumentFromProject(projectId: string, documentId: string): Promise<void> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error('Project not found')

    project.documents = project.documents.filter(id => id !== documentId)
    await this.updateProject(projectId, { documents: project.documents })
  }
}

// 单例实例
export const projectStore = new ProjectStore()
