import type { Block, BlockRelease } from '../../types/models/block'
import type { Document } from '../../types/models/document'
import { blockStore } from '../../storage/blockStore'

const GIT_HISTORY_STORAGE_KEY = 'blockos-git-history'

export interface GitConfig {
  enabled: boolean
  autoCommit: boolean
  commitInterval: number
  repoPath?: string
  branch?: string
}

export interface GitReleaseSnapshot {
  kind: 'block-release'
  blockId: string
  blockTitle: string
  releaseVersion: number
  releaseTitle: string
  content: string
  releasedAt: Date
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: Date
  files: string[]
  snapshot?: GitReleaseSnapshot
}

function normalizeCommit(commit: GitCommit): GitCommit {
  return {
    ...commit,
    date: new Date(commit.date),
    snapshot: commit.snapshot
      ? {
          ...commit.snapshot,
          releasedAt: new Date(commit.snapshot.releasedAt),
        }
      : undefined,
  }
}

export class GitIntegration {
  private config: GitConfig = {
    enabled: true,
    autoCommit: false,
    commitInterval: 300,
    branch: 'main',
  }

  private lastCommitTime: Date | null = null
  private pendingChanges: Set<string> = new Set()
  private autoCommitTimer: number | null = null

  async init(config: Partial<GitConfig>): Promise<void> {
    this.config = { ...this.config, ...config }
    if (this.config.enabled && this.config.autoCommit) {
      this.startAutoCommit()
    }
  }

  private startAutoCommit(): void {
    if (this.autoCommitTimer) clearInterval(this.autoCommitTimer)
    this.autoCommitTimer = window.setInterval(() => {
      if (this.pendingChanges.size > 0) {
        void this.commitPendingChanges()
      }
    }, this.config.commitInterval * 1000)
  }

  stopAutoCommit(): void {
    if (this.autoCommitTimer) {
      clearInterval(this.autoCommitTimer)
      this.autoCommitTimer = null
    }
  }

  trackChange(filePath: string): void {
    this.pendingChanges.add(filePath)
    window.dispatchEvent(new CustomEvent('git:pending-changes', {
      detail: { files: Array.from(this.pendingChanges) },
    }))
  }

  private loadHistoryFromStorage(): GitCommit[] {
    try {
      const raw = localStorage.getItem(GIT_HISTORY_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as GitCommit[]
      return parsed.map(normalizeCommit)
    } catch (error) {
      console.error('[Git] Failed to load history:', error)
      return []
    }
  }

  private saveHistoryToStorage(history: GitCommit[]): void {
    localStorage.setItem(GIT_HISTORY_STORAGE_KEY, JSON.stringify(history))
  }

  private async commitPendingChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return
    const files = Array.from(this.pendingChanges)
    try {
      await this.commit(this.generateCommitMessage(files), files)
      this.pendingChanges.clear()
      this.lastCommitTime = new Date()
    } catch (error) {
      console.error('Auto commit failed:', error)
    }
  }

  private generateCommitMessage(files: string[]): string {
    const timestamp = new Date().toISOString()
    return files.length === 1
      ? `auto: update ${files[0]} at ${timestamp}`
      : `auto: update ${files.length} files at ${timestamp}`
  }

  async commit(message: string, files?: string[], snapshot?: GitReleaseSnapshot): Promise<GitCommit> {
    if (!this.config.enabled) {
      throw new Error('Git integration is not enabled')
    }

    const commit: GitCommit = {
      hash: this.generateHash(),
      message,
      author: 'BlockOS User',
      date: new Date(),
      files: files || [],
      snapshot,
    }

    const history = this.loadHistoryFromStorage()
    history.unshift(commit)
    this.saveHistoryToStorage(history)

    window.dispatchEvent(new CustomEvent('git:commit', { detail: commit }))
    return commit
  }

  async commitNow(message?: string): Promise<GitCommit | null> {
    if (this.pendingChanges.size === 0) {
      return null
    }
    const files = Array.from(this.pendingChanges)
    const commit = await this.commit(message || this.generateCommitMessage(files), files)
    this.pendingChanges.clear()
    this.lastCommitTime = new Date()
    return commit
  }

  async commitBlockRelease(blockId: string, release: BlockRelease): Promise<GitCommit> {
    const block = await blockStore.getBlock(blockId)
    if (!block) {
      throw new Error('Block not found')
    }

    const filePath = `blocks/${blockId}.md`
    const snapshot: GitReleaseSnapshot = {
      kind: 'block-release',
      blockId,
      blockTitle: block.metadata.title || block.content.slice(0, 30) || 'Untitled Block',
      releaseVersion: release.version,
      releaseTitle: release.title,
      content: release.content,
      releasedAt: new Date(release.releasedAt),
    }

    const commit = await this.commit(
      `release(block): ${snapshot.blockTitle} v${release.version} - ${release.title}`,
      [filePath],
      snapshot
    )

    this.pendingChanges.delete(filePath)
    this.lastCommitTime = new Date()
    return commit
  }

  async getHistory(limit = 10): Promise<GitCommit[]> {
    return this.loadHistoryFromStorage().slice(0, limit)
  }

  getStatus(): { enabled: boolean; autoCommit: boolean; pendingChanges: number; lastCommit: Date | null } {
    return {
      enabled: this.config.enabled,
      autoCommit: this.config.autoCommit,
      pendingChanges: this.pendingChanges.size,
      lastCommit: this.lastCommitTime,
    }
  }

  private generateHash(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async exportToFileSystem(data: unknown, filePath: string): Promise<void> {
    console.log('[Git] Export to file system:', { filePath, data })
    this.trackChange(filePath)
  }

  destroy(): void {
    this.stopAutoCommit()
    this.pendingChanges.clear()
  }
}

export const gitIntegration = new GitIntegration()

export function blockToMarkdown(block: Block): string {
  let markdown = ''
  if (block.metadata?.title) markdown += `# ${block.metadata.title}\n\n`
  markdown += block.content + '\n\n'
  markdown += '---\n'
  markdown += `ID: ${block.id}\n`
  markdown += `Type: ${block.type}\n`
  markdown += `Created: ${new Date(block.metadata.createdAt).toISOString()}\n`
  if (block.metadata.tags?.length > 0) markdown += `Tags: ${block.metadata.tags.join(', ')}\n`
  if (block.derivation?.isDerivative) {
    markdown += '\n## Derivation Info\n'
    markdown += `Source Block: ${block.derivation.sourceBlockId}\n`
    markdown += `Context: ${block.derivation.contextTitle}\n`
    markdown += `Modifications: ${block.derivation.modifications}\n`
  }
  return markdown
}

export function documentToMarkdown(document: Document): string {
  let markdown = `# ${document.title}\n\n`
  if (document.content) {
    try {
      markdown += extractTextFromJSON(JSON.parse(document.content)) + '\n\n'
    } catch {
      markdown += document.content + '\n\n'
    }
  }
  markdown += '---\n'
  markdown += `Document ID: ${document.id}\n`
  markdown += `Created: ${new Date(document.metadata.createdAt).toISOString()}\n`
  markdown += `Updated: ${new Date(document.metadata.updatedAt).toISOString()}\n`
  return markdown
}

function extractTextFromJSON(json: unknown): string {
  if (typeof json === 'string') return json
  if (!json) return ''
  const node = json as Record<string, unknown>
  if (node.type === 'text') return (node.text as string) || ''
  if (Array.isArray(node.content)) {
    return (node.content as unknown[]).map(extractTextFromJSON).join('')
  }
  return ''
}
