// Git 集成模块
// 注意：浏览器环境无法直接操作 Git，需要通过后端 API 或 Electron 实现
// 这里提供接口定义和模拟实现

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
    commitInterval: 300, // 5 分钟
  }

  private lastCommitTime: Date | null = null
  private pendingChanges: Set<string> = new Set()
  private autoCommitTimer: number | null = null

  // 初始化 Git 集成
  async init(config: Partial<GitConfig>): Promise<void> {
    this.config = { ...this.config, ...config }
    
    if (this.config.enabled && this.config.autoCommit) {
      this.startAutoCommit()
    }
  }

  // 启动自动提交
  private startAutoCommit(): void {
    if (this.autoCommitTimer) {
      clearInterval(this.autoCommitTimer)
    }

    this.autoCommitTimer = window.setInterval(() => {
      if (this.pendingChanges.size > 0) {
        this.commitPendingChanges()
      }
    }, this.config.commitInterval * 1000)
  }

  // 停止自动提交
  stopAutoCommit(): void {
    if (this.autoCommitTimer) {
      clearInterval(this.autoCommitTimer)
      this.autoCommitTimer = null
    }
  }

  // 记录文件变更
  trackChange(filePath: string): void {
    this.pendingChanges.add(filePath)
  }

  // 提交待处理的变更
  private async commitPendingChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return

    const files = Array.from(this.pendingChanges)
    const message = this.generateCommitMessage(files)

    try {
      await this.commit(message, files)
      this.pendingChanges.clear()
      this.lastCommitTime = new Date()
    } catch (error) {
      console.error('Auto commit failed:', error)
    }
  }

  // 生成提交消息
  private generateCommitMessage(files: string[]): string {
    const timestamp = new Date().toISOString()
    const fileCount = files.length
    
    if (fileCount === 1) {
      return `auto: update ${files[0]} at ${timestamp}`
    }
    
    return `auto: update ${fileCount} files at ${timestamp}`
  }

  // 执行 Git 提交
  async commit(message: string, files?: string[]): Promise<GitCommit> {
    if (!this.config.enabled) {
      throw new Error('Git integration is not enabled')
    }

    // 浏览器环境模拟实现
    // 实际应用需要通过后端 API 或 Electron 调用 Git 命令
    console.log('[Git] Commit:', { message, files })

    // 模拟提交
    const commit: GitCommit = {
      hash: this.generateHash(),
      message,
      author: 'BlockOS User',
      date: new Date(),
      files: files || []
    }

    // 触发提交事件
    window.dispatchEvent(new CustomEvent('git:commit', { detail: commit }))

    return commit
  }

  // 手动提交当前变更
  async commitNow(message?: string): Promise<GitCommit | null> {
    if (this.pendingChanges.size === 0) {
      console.log('[Git] No changes to commit')
      return null
    }

    const files = Array.from(this.pendingChanges)
    const commitMessage = message || this.generateCommitMessage(files)

    const commit = await this.commit(commitMessage, files)
    this.pendingChanges.clear()
    this.lastCommitTime = new Date()

    return commit
  }

  // 获取提交历史
  async getHistory(limit: number = 10): Promise<GitCommit[]> {
    // 模拟实现
    console.log('[Git] Get history, limit:', limit)
    return []
  }

  // 获取当前状态
  getStatus(): {
    enabled: boolean
    autoCommit: boolean
    pendingChanges: number
    lastCommit: Date | null
  } {
    return {
      enabled: this.config.enabled,
      autoCommit: this.config.autoCommit,
      pendingChanges: this.pendingChanges.size,
      lastCommit: this.lastCommitTime
    }
  }

  // 生成简单的 hash
  private generateHash(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  // 导出数据到文件系统（用于 Git 提交）
  async exportToFileSystem(data: any, filePath: string): Promise<void> {
    // 浏览器环境使用 File System Access API
    // 或通过后端 API 保存
    console.log('[Git] Export to file system:', { filePath, data })
    
    // 记录变更
    this.trackChange(filePath)
  }

  // 清理
  destroy(): void {
    this.stopAutoCommit()
    this.pendingChanges.clear()
  }
}

// 单例实例
export const gitIntegration = new GitIntegration()

// 辅助函数：将 Block 数据导出为 Markdown
export function blockToMarkdown(block: any): string {
  let markdown = ''
  
  // 标题
  if (block.metadata?.title) {
    markdown += `# ${block.metadata.title}\n\n`
  }
  
  // 内容
  markdown += block.content + '\n\n'
  
  // 元数据
  markdown += '---\n'
  markdown += `ID: ${block.id}\n`
  markdown += `Type: ${block.type}\n`
  markdown += `Created: ${new Date(block.metadata.createdAt).toISOString()}\n`
  
  if (block.metadata.tags && block.metadata.tags.length > 0) {
    markdown += `Tags: ${block.metadata.tags.join(', ')}\n`
  }
  
  // 派生信息
  if (block.derivation?.isDerivative) {
    markdown += `\n## Derivation Info\n`
    markdown += `Source Block: ${block.derivation.sourceBlockId}\n`
    markdown += `Context: ${block.derivation.contextTitle}\n`
    markdown += `Modifications: ${block.derivation.modifications}\n`
  }
  
  return markdown
}

// 辅助函数：将文档导出为 Markdown
export function documentToMarkdown(document: any): string {
  let markdown = `# ${document.title}\n\n`
  
  // 文档内容
  if (document.content) {
    try {
      const content = JSON.parse(document.content)
      // 简化处理：提取文本内容
      markdown += extractTextFromJSON(content) + '\n\n'
    } catch (e) {
      markdown += document.content + '\n\n'
    }
  }
  
  // 元数据
  markdown += '---\n'
  markdown += `Document ID: ${document.id}\n`
  markdown += `Created: ${new Date(document.metadata.createdAt).toISOString()}\n`
  markdown += `Updated: ${new Date(document.metadata.updatedAt).toISOString()}\n`
  
  return markdown
}

// 从 JSON 提取文本
function extractTextFromJSON(json: any): string {
  if (typeof json === 'string') return json
  if (!json) return ''
  
  if (json.type === 'text') {
    return json.text || ''
  }
  
  if (json.content && Array.isArray(json.content)) {
    return json.content.map((child: any) => extractTextFromJSON(child)).join('')
  }
  
  return ''
}
