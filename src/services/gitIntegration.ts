// Git 集成模块
// 注意：浏览器环境无法直接操作 Git，需要通过后端 API 或 Electron 实现
import type { Block } from '../types/block'
import type { Document } from '../types/document'

export interface GitConfig {
  enabled: boolean
  autoCommit: boolean
  commitInterval: number // 自动提交间隔（秒）
  repoPath?: string
  branch?: string
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  date: Date
  files: string[]
}

export class GitIntegration {
  private config: GitConfig = {
    enabled: false,
    autoCommit: false,
    commitInterval: 300,
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
      if (this.pendingChanges.size > 0) this.commitPendingChanges()
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

  async commit(message: string, files?: string[]): Promise<GitCommit> {
    if (!this.config.enabled) throw new Error('Git integration is not enabled')

    console.log('[Git] Commit:', { message, files })
    const commit: GitCommit = {
      hash: this.generateHash(),
      message,
      author: 'BlockOS User',
      date: new Date(),
      files: files || [],
    }
    window.dispatchEvent(new CustomEvent('git:commit', { detail: commit }))
    return commit
  }

  async commitNow(message?: string): Promise<GitCommit | null> {
    if (this.pendingChanges.size === 0) {
      console.log('[Git] No changes to commit')
      return null
    }
    const files = Array.from(this.pendingChanges)
    const commit = await this.commit(message || this.generateCommitMessage(files), files)
    this.pendingChanges.clear()
    this.lastCommitTime = new Date()
    return commit
  }

  async getHistory(limit = 10): Promise<GitCommit[]> {
    console.log('[Git] Get history, limit:', limit)
    return []
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

// Block 导出为 Markdown
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
    markdown += `\n## Derivation Info\n`
    markdown += `Source Block: ${block.derivation.sourceBlockId}\n`
    markdown += `Context: ${block.derivation.contextTitle}\n`
    markdown += `Modifications: ${block.derivation.modifications}\n`
  }
  return markdown
}

// Document 导出为 Markdown
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
