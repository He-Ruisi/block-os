import type { OCRPhotoRecord } from '../../types/ocr'
import { generateUUID } from '../../utils/uuid'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error('仅支持图片文件')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('图片不能超过 5MB')
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result as string)
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('读取图片失败'))
    }

    reader.readAsDataURL(file)
  })
}

export function createPhotoRecord(params: {
  dataUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}): OCRPhotoRecord {
  const now = new Date().toISOString()

  return {
    id: generateUUID(),
    fileName: params.fileName,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
    imageDataUrl: params.dataUrl,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    ocrStatus: 'idle',
  }
}

export function dataUrlToBase64(dataUrl: string): string {
  const parts = dataUrl.split(',')
  return parts[1] ?? ''
}

export function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) {
    return `${fileSize}B`
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)}KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)}MB`
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays} 天前`
  }

  return formatDateTime(isoString)
}

export function createCapturedFileName(): string {
  const now = new Date()
  const pad = (value: number): string => value.toString().padStart(2, '0')

  return `拍照_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.jpg`
}
