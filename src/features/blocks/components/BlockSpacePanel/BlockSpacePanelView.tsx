import { SearchInput } from '@/components/shells';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockListView } from './BlockListView';
import { BlockDetailPanel } from '../BlockDetailPanel';
import type { Block, BlockRelease } from '@/types/models/block';
import type { BlockViewModel, BlockSpaceStats } from './types';

interface Props {
  blocks: BlockViewModel[];
  isLoading: boolean;
  searchQuery: string;
  selectedTag: string;
  allTags: string[];
  highlightedBlockId: string | null;
  detailBlockId: string | null;
  stats: BlockSpaceStats;
  onSearchChange: (query: string) => void;
  onTagSelect: (tag: string) => void;
  onBlockClick: (blockId: string) => void;
  onBlockDragStart: (blockId: string, block: BlockViewModel) => string;
  onInsertRelease: (block: Block, release: BlockRelease) => void;
  onCloseDetail: () => void;
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
  // 如果显示详情面板，渲染详情
  if (detailBlockId) {
    return (
      <BlockDetailPanel
        blockId={detailBlockId}
        onClose={onCloseDetail}
        onInsertRelease={onInsertRelease}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索框 */}
      <div className="mb-4 shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="搜索 Block..."
        />
      </div>

      {/* 标签过滤 */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {['全部', ...allTags.slice(0, 5)].map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            size="sm"
            onClick={() => onTagSelect(tag)}
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

      {/* Block 列表 */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm text-muted-foreground mb-1">
              {stats.totalBlocks === 0 ? '还没有 Block' : '没有找到匹配的 Block'}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.totalBlocks === 0 ? '捕获 AI 回复或选中文字来创建 Block' : '尝试其他搜索条件'}
            </div>
          </div>
        ) : (
          <BlockListView
            blocks={blocks}
            highlightedBlockId={highlightedBlockId}
            onBlockClick={onBlockClick}
            onBlockDragStart={onBlockDragStart}
          />
        )}
      </ScrollArea>
    </div>
  );
}
