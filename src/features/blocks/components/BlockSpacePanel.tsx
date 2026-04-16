import { useState, useEffect, useCallback } from 'react'
import type { Block, BlockRelease } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { formatRelativeTime } from '@/utils/date'
import { BlockDetailPanel } from './BlockDetailPanel'
import '@/styles/components/BlockSpacePanel.css'

export function BlockSpacePanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null)
  const [detailBlockId, setDetailBlockId] = useState<string | null>(null)

  // 加载 Blocks（只加载显式 Block）
  const loadBlocks = async () => {
    try {
      setIsLoading(true)
      const allBlocks = await blockStore.getAllBlocks()
      // 过滤掉隐式 Block
      const explicitBlocks = allBlocks.filter(b => !b.implicit)
      const tags = Array.from(new Set(explicitBlocks.flatMap(b => b.metadata.tags))).sort()
      setBlocks(explicitBlocks)
      setFilteredBlocks(explicitBlocks)
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to load blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    loadBlocks()
  }, [])

  // 监听 Block 更新事件
  useEffect(() => {
    const handleBlockUpdate = () => {
      console.log('[BlockSpacePanel] Reloading blocks...')
      loadBlocks()
    }

    window.addEventListener('blockUpdated', handleBlockUpdate)
    return () => window.removeEventListener('blockUpdated', handleBlockUpdate)
  }, [])

  // 监听显示 Block 事件
  useEffect(() => {
    const handleShowBlock = (e: Event) => {
      const blockId = (e as CustomEvent<string>).detail
      setHighlightedBlockId(blockId)
      setTimeout(() => setHighlightedBlockId(null), 3000)
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${blockId}"]`)
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
    window.addEventListener('showBlockInSpace', handleShowBlock)
    return () => window.removeEventListener('showBlockInSpace', handleShowBlock)
  }, [])

  // 监听 openBlockDetail 事件 → 直接打开详情面板
  useEffect(() => {
    const handler = (e: Event) => {
      const blockId = (e as CustomEvent<string>).detail
      if (blockId) setDetailBlockId(blockId)
    }
    window.addEventListener('openBlockDetail', handler)
    return () => window.removeEventListener('openBlockDetail', handler)
  }, [])

  // 搜索和过滤
  useEffect(() => {
    let result = blocks

    // 标签过滤
    if (selectedTag !== 'all') {
      result = result.filter(block => 
        block.metadata.tags.includes(selectedTag)
      )
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(block =>
        block.content.toLowerCase().includes(query) ||
        block.metadata.title?.toLowerCase().includes(query) ||
        block.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredBlocks(result)
  }, [blocks, selectedTag, searchQuery])

  // 格式化日期
  const formatDate = (date: Date) => formatRelativeTime(date)

  // 截断内容
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 拖拽 Block 到编辑器
  const handleBlockDragStart = useCallback((e: React.DragEvent, block: Block) => {
    const data = JSON.stringify({
      id: block.id,
      title: block.metadata.title || block.content.substring(0, 30),
      content: block.content,
      type: block.type,
    })
    e.dataTransfer.setData('application/blockos-block', data)
    e.dataTransfer.setData('text/plain', block.content)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  // 从详情面板插入 release 到编辑器
  const handleInsertRelease = useCallback((_block: Block, release: BlockRelease) => {
    // 通过全局事件通知编辑器插入 release 内容
    window.dispatchEvent(new CustomEvent('insertBlockRelease', {
      detail: { blockId: _block.id, releaseVersion: release.version, content: release.content, title: release.title },
    }))
    setDetailBlockId(null)
  }, [])

  // 如果正在查看详情，显示详情面板
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
      <div className="block-space-header">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索 Block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-bar">
          <span className="filter-label">标签:</span>
          <select 
            className="tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            aria-label="按标签过滤 Block"
          >
            <option value="all">全部</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="block-space-body">
        {isLoading ? (
          <div className="block-space-empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">加载中...</div>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="block-space-empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">
              {blocks.length === 0 ? '还没有 Block' : '没有找到匹配的 Block'}
            </div>
            <div className="empty-hint">
              {blocks.length === 0 ? '捕获 AI 回复或选中文字来创建 Block' : '尝试其他搜索条件'}
            </div>
          </div>
        ) : (
          <div className="blocks-list">
            {filteredBlocks.map(block => (
              <div 
                key={block.id} 
                className={`block-card ${highlightedBlockId === block.id ? 'highlighted' : ''}`}
                data-block-id={block.id}
                draggable
                onDragStart={e => handleBlockDragStart(e, block)}
                onClick={() => setDetailBlockId(block.id)}
              >
                {block.metadata.title && (
                  <div className="block-title">{block.metadata.title}</div>
                )}
                <div className="block-content">
                  {truncateContent(block.content)}
                </div>
                <div className="block-meta">
                  <div className="block-tags">
                    {block.metadata.tags.map(tag => (
                      <span key={tag} className="block-tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="block-info">
                    <span className="block-type">
                      {block.type === 'ai-generated' ? '🤖 AI' : '✍️ 编辑器'}
                    </span>
                    {(block.releases?.length ?? 0) > 0 && (
                      <span className="block-versions">
                        📦 {block.releases!.length} 版本
                      </span>
                    )}
                    <span className="block-time">
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
