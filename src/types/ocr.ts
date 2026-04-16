export type OCRPhotoStatus = 'idle' | 'processing' | 'done' | 'error'

export interface OCRPhotoRecord {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  imageDataUrl: string
  thumbnailDataUrl?: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  ocrStatus: OCRPhotoStatus
  ocrText?: string
  ocrRawText?: string
  ocrError?: string
}
