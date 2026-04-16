import type { OCRPhotoRecord } from '../types/ocr'
import { getDatabase, initDatabase, isDatabaseInitialized } from './database'

const STORE_NAME = 'ocrPhotoRecords'
const MAX_RECORDS = 100

export class OCRPhotoStore {
  async init(): Promise<void> {
    await initDatabase()
  }

  isInitialized(): boolean {
    return isDatabaseInitialized()
  }

  async getAllRecords(): Promise<OCRPhotoRecord[]> {
    const db = getDatabase()

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()

      req.onsuccess = () => {
        const records = (req.result as OCRPhotoRecord[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        resolve(records)
      }

      req.onerror = () => reject(req.error)
    })
  }

  async saveRecord(record: OCRPhotoRecord): Promise<void> {
    const db = getDatabase()

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(record)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })

    await this.trimToLimit()
  }

  async deleteRecord(recordId: string): Promise<void> {
    const db = getDatabase()

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(recordId)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  private async trimToLimit(): Promise<void> {
    const records = await this.getAllRecords()
    if (records.length <= MAX_RECORDS) {
      return
    }

    const overflowRecords = records.slice(MAX_RECORDS)
    await Promise.all(overflowRecords.map((record) => this.deleteRecord(record.id)))
  }
}

export const ocrPhotoStore = new OCRPhotoStore()
