// 统一 IndexedDB 初始化 — 单例，所有 Store 共享同一个连接
const DB_NAME = 'blockos-db'
const DB_VERSION = 5  // 升级到 5，添加 usages store

let db: IDBDatabase | null = null
let initPromise: Promise<IDBDatabase> | null = null

export async function initDatabase(): Promise<IDBDatabase> {
  if (db) return db
  if (initPromise) return initPromise

  initPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      if (!database.objectStoreNames.contains('blocks')) {
        const blockStore = database.createObjectStore('blocks', { keyPath: 'id' })
        blockStore.createIndex('tags', 'metadata.tags', { multiEntry: true })
        blockStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
        blockStore.createIndex('type', 'type', { unique: false })
      }

      if (!database.objectStoreNames.contains('documents')) {
        const docStore = database.createObjectStore('documents', { keyPath: 'id' })
        docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
      }

      if (!database.objectStoreNames.contains('projects')) {
        const projStore = database.createObjectStore('projects', { keyPath: 'id' })
        projStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
        projStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
      }

      if (!database.objectStoreNames.contains('sessions')) {
        const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('date', 'date', { unique: false })
        sessionStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // v5: usages store（Block 使用记录）
      if (!database.objectStoreNames.contains('usages')) {
        const usageStore = database.createObjectStore('usages', { keyPath: 'id' })
        usageStore.createIndex('blockId', 'blockId', { unique: false })
        usageStore.createIndex('documentId', 'documentId', { unique: false })
      }
    }
  })

  return initPromise
}

export function getDatabase(): IDBDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

export function isDatabaseInitialized(): boolean {
  return db !== null
}
