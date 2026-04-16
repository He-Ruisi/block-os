import { useState, useEffect, useCallback } from 'react'
import type { Block, BlockRelease, BlockUsage } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { usageStore } from '@/storage/usageStore'
import { publishBlockVersion } from '../services/blockReleaseService'
import { formatRelativeTime } from '@/utils/date'
import '@/styles/modules/blocks.css'

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
      const [loadedBlock, loadedUsages] = await Promise.all([
        blockStore.getBlock(blockId),
        usageStore.getUsagesByBlock(blockId),
      ])
      setBlock(loadedBlock)
      setUsages(loadedUsages)
    } catch (error) {
      console.error('Failed to load block detail:', error)
    } finally {
      setIsLoading(false)
    }
  }, [blockId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleCreateRelease = async () => {
    if (!block) return

    try {
      await publishBlockVersion({
        blockId,
        title: newReleaseTitle.trim(),
        contentOverride: block.content,
      })
      setNewReleaseTitle('')
      setShowNewRelease(false)
      await loadData()
    } catch (error) {
      console.error('Failed to create release:', error)
    }
  }

  const handleInsert = () => {
    if (!block || selectedVersion === null) return
    const release = block.releases?.find(item => item.version === selectedVersion)
    if (release) {
      onInsertRelease(block, release)
    }
  }

  const truncate = (text: string, lines = 2) => {
    const rows = text.split('\n').filter(line => line.trim())
    const preview = rows.slice(0, lines).join('\n')
    return rows.length > lines ? `${preview}...` : preview
  }

  if (isLoading) {
    return (
      <div className="block-detail-panel">
        <div className="block-detail-panel__header">
          <button className="block-detail-panel__back" onClick={onClose}>← 返回</button>
        </div>
        <div className="block-detail-panel__loading">加载中...</div>
      </div>
    )
  }

  if (!block) {
    return (
      <div className="block-detail-panel">
        <div className="block-detail-panel__header">
          <button className="block-detail-panel__back" onClick={onClose}>← 返回</button>
        </div>
        <div className="block-detail-panel__loading">Block 不存在</div>
      </div>
    )
  }

  const releases = block.releases ?? []

  return (
    <div className="block-detail-panel">
      <div className="block-detail-panel__header">
        <button className="block-detail-panel__back" onClick={onClose}>← 返回</button>
        <span className="block-detail-panel__title">{block.metadata.title || 'Block 详情'}</span>
      </div>

      <div className="block-detail-panel__body">
        <section className="block-detail-panel__section">
          <div className="block-detail-panel__section-label">当前内容</div>
          <div className="block-detail-panel__content-box">
            {block.content.substring(0, 200)}
            {block.content.length > 200 ? '...' : ''}
          </div>
          <div className="block-detail-panel__meta-row">
            <span className="block-detail-panel__meta-chip">{block.type === 'ai-generated' ? '🤖 AI' : '✍️ 编辑器'}</span>
            <span className="block-detail-panel__meta-chip">📅 {formatRelativeTime(block.metadata.createdAt)}</span>
            {block.metadata.tags.map(tag => (
              <span key={tag} className="block-detail-panel__meta-chip block-detail-panel__meta-chip--tag">#{tag}</span>
            ))}
          </div>
        </section>

        <section className="block-detail-panel__section">
          <div className="block-detail-panel__section-label-row">
            <span className="block-detail-panel__section-label">版本 ({releases.length})</span>
            <button
              className="block-detail-panel__new-release-btn"
              onClick={() => setShowNewRelease(true)}
            >
              + 发布新版本
            </button>
          </div>

          {showNewRelease && (
            <div className="block-detail-panel__new-release-form">
              <input
                className="block-detail-panel__release-title-input"
                placeholder="版本标题，例如：偏历史叙述语气"
                value={newReleaseTitle}
                onChange={e => setNewReleaseTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void handleCreateRelease()}
                autoFocus
              />
              <div className="block-detail-panel__release-form-actions">
                <button
                  className="block-detail-panel__button block-detail-panel__button--secondary"
                  onClick={() => setShowNewRelease(false)}
                >
                  取消
                </button>
                <button
                  className="block-detail-panel__button block-detail-panel__button--primary"
                  onClick={() => void handleCreateRelease()}
                >
                  发布
                </button>
              </div>
            </div>
          )}

          {releases.length === 0 ? (
            <div className="block-detail-panel__empty-hint">暂无发布版本，点击上方按钮发布</div>
          ) : (
            <div className="block-detail-panel__release-list">
              {[...releases].reverse().map(release => (
                <div
                  key={release.version}
                  className={`block-detail-panel__release-card ${selectedVersion === release.version ? 'block-detail-panel__release-card--selected' : ''}`}
                  onClick={() => setSelectedVersion(selectedVersion === release.version ? null : release.version)}
                >
                  <div className="block-detail-panel__release-card-header">
                    <span className="block-detail-panel__release-version">v{release.version}</span>
                    <span className="block-detail-panel__release-title-text">{release.title}</span>
                    <span className="block-detail-panel__release-time">{formatRelativeTime(release.releasedAt)}</span>
                  </div>
                  <div className="block-detail-panel__release-preview">{truncate(release.content)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="block-detail-panel__section">
          <div className="block-detail-panel__section-label">引用记录 ({usages.length})</div>
          {usages.length === 0 ? (
            <div className="block-detail-panel__empty-hint">暂无引用记录</div>
          ) : (
            <div className="block-detail-panel__usage-list">
              {usages.map(usage => (
                <div key={usage.id} className="block-detail-panel__usage-item">
                  <span className="block-detail-panel__usage-doc">📄 {usage.documentTitle}</span>
                  <span className="block-detail-panel__usage-version">v{usage.releaseVersion}</span>
                  <span className="block-detail-panel__usage-time">{formatRelativeTime(usage.insertedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedVersion !== null && (
        <div className="block-detail-panel__footer">
          <span className="block-detail-panel__footer-hint">已选择 v{selectedVersion}</span>
          <button className="block-detail-panel__button block-detail-panel__button--primary" onClick={handleInsert}>
            插入到编辑器
          </button>
        </div>
      )}
    </div>
  )
}
