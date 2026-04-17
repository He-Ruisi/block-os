import { Filter, Sparkles } from 'lucide-react'
import { BlockDetailPanel } from '@/features/blocks/components/BlockDetailPanel'
import { BlockListView } from './BlockListView'
import { EmptyState, PanelHeader, PanelShell, SearchInput } from '@/components/shells'
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

  const visibleTags = ['All', ...allTags.slice(0, 5)]

  return (
    <PanelShell>
      <PanelHeader
        title="Block Library"
        description={`${stats.filteredBlocks} / ${stats.totalBlocks} blocks available`}
        leading={<Sparkles className="h-4 w-4" />}
      />

      <div className="space-y-3 border-b px-4 py-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search blocks..."
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
              More tags
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
              title="Loading blocks"
              description="Reusable content is being prepared."
            />
          ) : blocks.length === 0 ? (
            <EmptyState
              compact
              icon={Sparkles}
              title={stats.totalBlocks === 0 ? 'No blocks yet' : 'No matching blocks'}
              description={
                stats.totalBlocks === 0
                  ? 'Capture AI output or selected text to create your first block.'
                  : 'Try a different search term or switch the active tag.'
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
