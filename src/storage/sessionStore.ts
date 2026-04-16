import type { Session } from '../types/models/chat'
import { generateUUID } from '../utils/uuid'
import { initDatabase, getDatabase } from './database'

export type { Session }

const STORE_NAME = 'sessions'

function todayString(): string {
  return new Date().toISOString().slice(0, 10) // "2026-04-10"
}

export class SessionStore {
  async init(): Promise<void> {
    await initDatabase()
  }

  async saveSession(session: Session): Promise<string> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).put(session)
      req.onsuccess = () => resolve(session.id)
      req.onerror = () => reject(req.error)
    })
  }

  async getSession(id: string): Promise<Session | null> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async getAllSessions(): Promise<Session[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => {
        const sessions: Session[] = req.result
        sessions.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        resolve(sessions)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async getSessionsByDate(date: string): Promise<Session[]> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).index('date').getAll(date)
      req.onsuccess = () => {
        const sessions: Session[] = req.result
        sessions.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        resolve(sessions)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async deleteSession(id: string): Promise<void> {
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // 创建新 Session
  createNew(systemPrompt: string): Session {
    return {
      id: generateUUID(),
      title: '新对话',
      date: todayString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      systemPrompt,
      messages: [],
    }
  }

  // 根据第一条用户消息自动生成标题
  generateTitle(messages: Session['messages']): string {
    const firstUser = messages.find(m => m.role === 'user')
    if (!firstUser) return '新对话'
    return firstUser.content.slice(0, 20) + (firstUser.content.length > 20 ? '...' : '')
  }
}

export const sessionStore = new SessionStore()
