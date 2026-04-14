import type { BlockRelease } from '../types/block'
import { blockStore } from '../storage/blockStore'
import { documentStore } from '../storage/documentStore'
import { usageStore } from '../storage/usageStore'
import { gitIntegration } from './gitIntegration'

function defaultReleaseTitle(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `版本 ${y}-${m}-${d} ${hh}:${mm}`
}

export async function publishBlockRelease(
  blockId: string,
  title?: string,
  contentOverride?: string
): Promise<BlockRelease> {
  const normalizedTitle = title?.trim() || defaultReleaseTitle()

  if (typeof contentOverride === 'string') {
    await blockStore.updateBlock(blockId, { content: contentOverride })
    gitIntegration.trackChange(`blocks/${blockId}.md`)
  }

  const release = await blockStore.createRelease(blockId, normalizedTitle)
  await gitIntegration.commitBlockRelease(blockId, release)
  return release
}

export function trackBlockWorkingCopyChange(blockId: string): void {
  gitIntegration.trackChange(`blocks/${blockId}.md`)
}

export async function recordBlockUsage(blockId: string, releaseVersion: number): Promise<void> {
  const documentId = documentStore.getCurrentDocumentId()
  if (!documentId) return

  const doc = await documentStore.getDocument(documentId)
  if (!doc) return

  const existingUsages = await usageStore.getUsagesByDocument(documentId)
  const exists = existingUsages.some(
    usage => usage.blockId === blockId && usage.releaseVersion === releaseVersion
  )
  if (exists) return

  await usageStore.addUsage(blockId, releaseVersion, documentId, doc.title)
}
