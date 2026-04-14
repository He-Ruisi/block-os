import { useState, useEffect, useCallback } from 'react'
import type { Block, BlockRelease, BlockUsage } from '../../types/block'
import { blockStore } from '../../storage/blockStore'
import { usageStore } from '../../storage/usageStore'
import { publishBlockRelease } from '../../services/blockReleaseService'
import { formatRelativeTime } from '../../utils/date'
import './BlockDetailPanel.css'

interface BlockDetailPanelProps {
  blockId: string
  onClose: () => void
  onInsertRelease: (block: Block, release: BlockRelease) => void
}

export function BlockDetailPanel({ blockId, onClose, onInsertRelease }: BlockDetailPanelProps) {
  const [block, setBlock] = useState<Block | null>(null)
  const [usages, setUsages] = useState<BlockUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewRelease, setShowNewRelease] = useState(false)
  const [newReleaseTitle, setNewReleaseTitle] = useState('')
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [b, u] = await Promise.all([
        blockStore.getBlock(blockId),
        usageStore.getUsagesByBlock(blockId),
      ])
      setBlock(b)
      setUsages(u)
    } catch (error) {
      console.error('Failed to load block detail:', error)
    } finally {
      setIsLoading(false)
    }
  }, [blockId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateRelease = async () => {
    if (!block) return
    try {
      await publishBlockRelease(blockId, newReleaseTitle.trim(), block.content)
      setNewReleaseTitle('')
      setShowNewRelease(false)
      await loadData()
      window.dispatchEvent(new Event('blockUpdated'))
    } catch (error) {
      console.error('Failed to create release:', error)
    }
  }

  const handleInsert = () => {
    if (!block || selectedVersion === null) return
    const release = block.releases?.find(r => r.version === selectedVersion)
    if (release) onInsertRelease(block, release)
  }

  const truncate = (text: string, lines = 2) => {
    const arr = text.split('\n').filter(l => l.trim())
    const preview = arr.slice(0, lines).join('\n')
    return arr.length > lines ? preview + '…' : preview
  }

  if (isLoading) {
    return (
      <div className="block-detail-panel">
        <div className="detail-header">
          <button className="detail-back" onClick={onClose}>← 返回</button>
        </div>
        <div className="detail-loading">加载中...</div>
      </div>
    )
  }

  if (!block) {
    return (
      <div className="block-detail-panel">
        <div className="detail-header">
          <button className="detail-back" onClick={onClose}>← 返回</button>
        </div>
        <div className="detail-loading">Block 不存在</div>
      </div>
    )
  }

  const releases = block.releases ?? []

  return (
    <div className="block-detail-panel">
      {/* 头部 */}
      <div className="detail-header">
        <button className="detail-back" onClick={onClose}>← 返回</button>
        <span className="detail-title">{block.metadata.title || 'Block 详情'}</span>
      </div>

      <div className="detail-body">
        {/* 当前内容 */}
        <section className="detail-section">
          <div className="section-label">当前内容</div>
          <div className="detail-content-box">
            {block.content.substring(0, 200)}{block.content.length > 200 ? '…' : ''}
          </div>
          <div className="detail-meta-row">
            <span className="meta-chip">{block.type === 'ai-generated' ? '🤖 AI' : '✍️ 编辑器'}</span>
            <span className="meta-chip">📅 {formatRelativeTime(block.metadata.createdAt)}</span>
            {block.metadata.tags.map(t => (
              <span key={t} className="meta-chip tag-chip">#{t}</span>
            ))}
          </div>
        </section>

        {/* Release 版本列表 */}
        <section className="detail-section">
          <div className="section-label-row">
            <span className="section-label">版本 ({releases.length})</span>
            <button
              className="new-release-btn"
              onClick={handleCreateRelease}
            >
              + 发布新版本
            </button>
          </div>

          {/* 新建 release 表单 */}
          {showNewRelease && (
            <div className="new-release-form">
              <input
                className="release-title-input"
                placeholder="版本标题（如：偏历史叙述语气）"
                value={newReleaseTitle}
                onChange={e => setNewReleaseTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateRelease()}
                autoFocus
              />
              <div className="release-form-actions">
                <button className="btn-sm btn-secondary-sm" onClick={() => setShowNewRelease(false)}>取消</button>
                <button
                  className="btn-sm btn-primary-sm"
                  onClick={handleCreateRelease}
                >
                  发布
                </button>
              </div>
            </div>
          )}

          {/* 版本列表 */}
          {releases.length === 0 ? (
            <div className="empty-hint-sm">暂无发布版本，点击上方按钮发布</div>
          ) : (
            <div className="release-list">
              {[...releases].reverse().map(release => (
                <div
                  key={release.version}
                  className={`release-card ${selectedVersion === release.version ? 'selected' : ''}`}
                  onClick={() => setSelectedVersion(
                    selectedVersion === release.version ? null : release.version
                  )}
                >
                  <div className="release-card-header">
                    <span className="release-version">v{release.version}</span>
                    <span className="release-title-text">{release.title}</span>
                    <span className="release-time">{formatRelativeTime(release.releasedAt)}</span>
                  </div>
                  <div className="release-preview">{truncate(release.content)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 使用记录 */}
        <section className="detail-section">
          <div className="section-label">引用记录 ({usages.length})</div>
          {usages.length === 0 ? (
            <div className="empty-hint-sm">暂无引用记录</div>
          ) : (
            <div className="usage-list">
              {usages.map(usage => (
                <div key={usage.id} className="usage-item">
                  <span className="usage-doc">📄 {usage.documentTitle}</span>
                  <span className="usage-version">v{usage.releaseVersion}</span>
                  <span className="usage-time">{formatRelativeTime(usage.insertedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 底部操作 */}
      {selectedVersion !== null && (
        <div className="detail-footer">
          <span className="footer-hint">已选择 v{selectedVersion}</span>
          <button className="btn-primary-sm" onClick={handleInsert}>
            插入到编辑器
          </button>
        </div>
      )}
    </div>
  )
}
