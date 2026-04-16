import { useState, useEffect, useCallback } from 'react'
import type { Block, BlockRelease } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { formatRelativeTime } from '@/utils/date'
import { BlockDetailPanel } from './BlockDetailPanel'
import '@/styles/modules/blocks.css'

export function BlockSpacePanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null)
  const [detailBlockId, setDetailBlockId] = useState<string | null>(null)

  const loadBlocks = async () => {
    try {
      setIsLoading(true)
      const allLoadedBlocks = await blockStore.getAllBlocks()
      const explicitBlocks = allLoadedBlocks.filter(block => !block.implicit)
      const tags = Array.from(new Set(explicitBlocks.flatMap(block => block.metadata.tags))).sort()
      setBlocks(explicitBlocks)
      setFilteredBlocks(explicitBlocks)
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to load blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBlocks()
  }, [])

  useEffect(() => {
    const handleBlockUpdate = () => {
      void loadBlocks()
    }

    window.addEventListener('blockUpdated', handleBlockUpdate)
    return () => window.removeEventListener('blockUpdated', handleBlockUpdate)
  }, [])

  useEffect(() => {
    const handleShowBlock = (event: Event) => {
      const blockId = (event as CustomEvent<string>).detail
      setHighlightedBlockId(blockId)
      setTimeout(() => setHighlightedBlockId(null), 3000)
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${blockId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }

    window.addEventListener('showBlockInSpace', handleShowBlock)
    return () => window.removeEventListener('showBlockInSpace', handleShowBlock)
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const blockId = (event as CustomEvent<string>).detail
      if (blockId) {
        setDetailBlockId(blockId)
      }
    }

    window.addEventListener('openBlockDetail', handler)
    return () => window.removeEventListener('openBlockDetail', handler)
  }, [])

  useEffect(() => {
    let result = blocks

    if (selectedTag !== 'all') {
      result = result.filter(block => block.metadata.tags.includes(selectedTag))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(block =>
        block.content.toLowerCase().includes(query)
        || block.metadata.title?.toLowerCase().includes(query)
        || block.metadata.tags.some(tag => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredBlocks(result)
  }, [blocks, selectedTag, searchQuery])

  const formatDate = (date: Date) => formatRelativeTime(date)

  const truncateContent = (content: string, maxLength = 100) =>
    (content.length <= maxLength ? content : `${content.substring(0, maxLength)}...`)

  const handleBlockDragStart = useCallback((event: React.DragEvent, block: Block) => {
    const data = JSON.stringify({
      id: block.id,
      title: block.metadata.title || block.content.substring(0, 30),
      content: block.content,
      type: block.type,
    })
    event.dataTransfer.setData('application/blockos-block', data)
    event.dataTransfer.setData('text/plain', block.content)
    event.dataTransfer.effectAllowed = 'copy'
  }, [])

  const handleInsertRelease = useCallback((block: Block, release: BlockRelease) => {
    window.dispatchEvent(new CustomEvent('insertBlockRelease', {
      detail: {
        blockId: block.id,
        releaseVersion: release.version,
        content: release.content,
        title: release.title,
      },
    }))
    setDetailBlockId(null)
  }, [])

  if (detailBlockId) {
    return (
      <BlockDetailPanel
        blockId={detailBlockId}
        onClose={() => setDetailBlockId(null)}
        onInsertRelease={handleInsertRelease}
      />
    )
  }

  return (
    <div className="block-space-panel">
      <div className="block-space-panel__header">
        <div className="block-space-panel__search-box">
          <span className="block-space-panel__search-icon">🔍</span>
          <input
            type="text"
            className="block-space-panel__search-input"
            placeholder="搜索 Block..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="block-space-panel__filter-bar">
          <span className="block-space-panel__filter-label">标签:</span>
          <select
            className="block-space-panel__tag-filter"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            aria-label="按标签过滤 Block"
          >
            <option value="all">全部</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="block-space-panel__body">
        {isLoading ? (
          <div className="block-space-panel__empty">
            <div className="block-space-panel__empty-icon">⏳</div>
            <div className="block-space-panel__empty-text">加载中...</div>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="block-space-panel__empty">
            <div className="block-space-panel__empty-icon">📦</div>
            <div className="block-space-panel__empty-text">
              {blocks.length === 0 ? '还没有 Block' : '没有找到匹配的 Block'}
            </div>
            <div className="block-space-panel__empty-hint">
              {blocks.length === 0 ? '捕获 AI 回复或选中文字来创建 Block' : '尝试其他搜索条件'}
            </div>
          </div>
        ) : (
          <div className="block-space-panel__list">
            {filteredBlocks.map(block => (
              <div
                key={block.id}
                className={`block-space-panel__card ${highlightedBlockId === block.id ? 'block-space-panel__card--highlighted' : ''}`}
                data-block-id={block.id}
                draggable
                onDragStart={event => handleBlockDragStart(event, block)}
                onClick={() => setDetailBlockId(block.id)}
              >
                {block.metadata.title && (
                  <div className="block-space-panel__title">{block.metadata.title}</div>
                )}
                <div className="block-space-panel__content">
                  {truncateContent(block.content)}
                </div>
                <div className="block-space-panel__meta">
                  <div className="block-space-panel__tags">
                    {block.metadata.tags.map(tag => (
                      <span key={tag} className="block-space-panel__tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="block-space-panel__info">
                    <span className="block-space-panel__type">
                      {block.type === 'ai-generated' ? '🤖 AI' : '✍️ 编辑器'}
                    </span>
                    {(block.releases?.length ?? 0) > 0 && (
                      <span className="block-space-panel__versions">📚 {block.releases!.length} 版本</span>
                    )}
                    <span className="block-space-panel__time">
                      {formatDate(block.metadata.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
