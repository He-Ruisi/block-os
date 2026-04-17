import { Filter, Sparkles } from 'lucide-react'
import { BlockDetailPanel } from '../BlockDetailPanel'
import { BlockListView } from './BlockListView'
import { PanelHeader, PanelShell, SearchInput, EmptyState } from '@/components/shells'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Block, BlockRelease } from '@/types/models/block'
import type { BlockViewModel, BlockSpaceStats } from './types'

interface Props {
  blocks: BlockViewModel[]
  isLoading: boolean
  searchQuery: string
  selectedTag: string
  allTags: string[]
  highlightedBlockId: string | null
  detailBlockId: string | null
  stats: BlockSpaceStats
  onSearchChange: (query: string) => void
  onTagSelect: (tag: string) => void
  onBlockClick: (blockId: string) => void
  onBlockDragStart: (blockId: string, block: BlockViewModel) => string
  onInsertRelease: (block: Block, release: BlockRelease) => void
  onCloseDetail: () => void
}

export function BlockSpacePanelView({
  blocks,
  isLoading,
  searchQuery,
  selectedTag,
  allTags,
  highlightedBlockId,
  detailBlockId,
  stats,
  onSearchChange,
  onTagSelect,
  onBlockClick,
  onBlockDragStart,
  onInsertRelease,
  onCloseDetail,
}: Props) {
  if (detailBlockId) {
    return (
      <BlockDetailPanel
        blockId={detailBlockId}
        onClose={onCloseDetail}
        onInsertRelease={onInsertRelease}
      />
    )
  }

  const visibleTags = ['全部', ...allTags.slice(0, 5)]

  return (
    <PanelShell>
      <PanelHeader
        title="Block 空间"
        description={`${stats.filteredBlocks} / ${stats.totalBlocks} 个可用 Block`}
        leading={<Sparkles className="h-4 w-4" />}
      />

      <div className="space-y-3 border-b px-4 py-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="搜索 Block..."
        />
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onTagSelect(tag)}
              className="h-7 px-2.5 text-xs"
            >
              {tag}
            </Button>
          ))}
          {allTags.length > 5 ? (
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2.5 text-xs" disabled>
              <Filter className="h-3 w-3" />
              更多标签
            </Button>
          ) : null}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <EmptyState
              compact
              icon={Sparkles}
              title="正在加载 Block"
              description="稍后即可查看可复用内容。"
            />
          ) : blocks.length === 0 ? (
            <EmptyState
              compact
              icon={Sparkles}
              title={stats.totalBlocks === 0 ? '还没有 Block' : '没有匹配的 Block'}
              description={
                stats.totalBlocks === 0
                  ? '捕获 AI 回复或选中文本后会在这里出现。'
                  : '调整搜索词或切换标签后再试一次。'
              }
            />
          ) : (
            <BlockListView
              blocks={blocks}
              highlightedBlockId={highlightedBlockId}
              onBlockClick={onBlockClick}
              onBlockDragStart={onBlockDragStart}
            />
          )}
        </div>
      </ScrollArea>
    </PanelShell>
  )
}
