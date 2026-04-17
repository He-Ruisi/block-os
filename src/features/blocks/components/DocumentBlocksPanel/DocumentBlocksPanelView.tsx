import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelShell } from '@/components/shells';
import { BlockListView } from './BlockListView';
import type { BlockViewModel, DocumentBlocksStats } from './types';

interface Props {
  blocks: BlockViewModel[];
  documentTitle: string;
  isLoading: boolean;
  stats: DocumentBlocksStats;
}

export function DocumentBlocksPanelView({
  blocks,
  documentTitle,
  isLoading,
  stats,
}: Props) {
  return (
    <PanelShell>
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{documentTitle}</h3>
        </div>
        <p className="text-xs text-muted-foreground">隐式 Block 结构</p>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-sm text-muted-foreground mb-1">开始写作</div>
            <div className="text-xs text-muted-foreground">每个段落都会自动成为一个 Block</div>
          </div>
        ) : (
          <BlockListView blocks={blocks} />
        )}
      </ScrollArea>

      {/* Footer - Stats */}
      <div className="flex items-center justify-around p-4 border-t shrink-0">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">段落</div>
          <div className="text-lg font-semibold">{stats.totalBlocks}</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">链接</div>
          <div className="text-lg font-semibold">{stats.totalLinks}</div>
        </div>
      </div>
    </PanelShell>
  );
}
