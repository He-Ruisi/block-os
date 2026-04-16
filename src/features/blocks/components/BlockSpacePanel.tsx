import { useState, useEffect, useCallback } from 'react'
import { Search, Tag, ChevronDown } from 'lucide-react'
import type { Block, BlockRelease } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { BlockDetailPanel } from './BlockDetailPanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import '@/styles/modules/blocks.css'
import '@/styles/modules/common-patterns.css'

export function BlockSpacePanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('全部')
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

    if (selectedTag !== '全部') {
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
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="搜索 Block..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="搜索 Block"
        />
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {['全部', ...allTags.slice(0, 5)].map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedTag(tag)}
            className={cn(
              "h-7 px-2.5 text-xs",
              selectedTag === tag && "bg-accent-green hover:bg-accent-green/90"
            )}
          >
            {tag}
          </Button>
        ))}
        {allTags.length > 5 && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2.5 text-xs"
          >
            更多 <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Block Cards (Bento Grid) */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-state__icon">⏳</div>
            <div className="empty-state__text">加载中...</div>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__text">
              {blocks.length === 0 ? '还没有 Block' : '没有找到匹配的 Block'}
            </div>
            <div className="empty-state__hint">
              {blocks.length === 0 ? '捕获 AI 回复或选中文字来创建 Block' : '尝试其他搜索条件'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
            {filteredBlocks.map(block => (
              <Card
                key={block.id}
                data-block-id={block.id}
                draggable
                onDragStart={event => handleBlockDragStart(event, block)}
                onClick={() => setDetailBlockId(block.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDetailBlockId(block.id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`查看 Block: ${block.metadata.title || block.content.substring(0, 30)}`}
                className={cn(
                  "p-4 hover:bg-accent hover:border-accent-green/50 transition-all cursor-pointer group",
                  highlightedBlockId === block.id && "border-accent-green bg-accent-green/10 animate-pulse"
                )}
              >
                <h4 className="text-sm font-medium mb-2 line-clamp-1 group-hover:text-accent-green transition-colors">
                  {block.metadata.title || block.content.substring(0, 30)}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                  {truncateContent(block.content)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {block.metadata.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="h-4 px-1.5 text-[10px] border-accent-green/30 text-accent-green"
                    >
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
