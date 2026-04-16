import type { Project, Tab } from '../types/models/project'
import { generateUUID } from '../utils/uuid'
import { initDatabase, getDatabase, isDatabaseInitialized } from './database'

export type { Project, Tab }

const STORE_NAME = 'projects'

interface ProjectStoreOptions {
  skipSyncMark?: boolean
}

export class ProjectStore {
  async init(): Promise<void> {
    await initDatabase()
  }

  isInitialized(): boolean {
    return isDatabaseInitialized()
  }

  async createProject(name: string, description?: string, options: ProjectStoreOptions = {}): Promise<Project> {
    const db = getDatabase()
    const project: Project = {
      id: generateUUID(),
      name,
      description,
      documents: [],
      metadata: { createdAt: new Date(), updatedAt: new Date() },
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).add(project)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          // 标记项目已变更，等待同步
          import('../services/integration/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markProjectChanged(project.id)
          })
        }
        resolve(project)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getAllProjects(): Promise<Project[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => {
        const projects: Project[] = req.result
        projects.sort((a, b) =>
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        )
        resolve(projects)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getProject(id: string): Promise<Project | null> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async updateProject(id: string, updates: Partial<Project>, options: ProjectStoreOptions = {}): Promise<void> {
    const db = getDatabase()
    const project = await this.getProject(id)
    if (!project) throw new Error('Project not found')

    const updatedProject: Project = {
      ...project,
      ...updates,
      metadata: { ...project.metadata, ...updates.metadata, updatedAt: new Date() },
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).put(updatedProject)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          // 标记项目已变更，等待同步
          import('../services/integration/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markProjectChanged(id)
          })
        }
        resolve()
      }
      req.onerror = () => reject(req.error)
    })
  }

  async deleteProject(id: string, options: ProjectStoreOptions = {}): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => {
        if (!options.skipSyncMark) {
          import('../services/integration/autoSyncService').then(({ autoSyncService }) => {
            autoSyncService.markProjectDeleted(id)
          })
        }
        resolve()
      }
      req.onerror = () => reject(req.error)
    })
  }

  async addDocumentToProject(projectId: string, documentId: string): Promise<void> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error('Project not found')
    if (!project.documents.includes(documentId)) {
      project.documents.push(documentId)
      await this.updateProject(projectId, { documents: project.documents })
    }
  }

  async removeDocumentFromProject(projectId: string, documentId: string): Promise<void> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error('Project not found')
    project.documents = project.documents.filter(id => id !== documentId)
    await this.updateProject(projectId, { documents: project.documents })
  }
}

export const projectStore = new ProjectStore()
