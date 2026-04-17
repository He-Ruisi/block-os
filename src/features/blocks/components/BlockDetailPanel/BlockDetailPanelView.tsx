import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurrentContentSection } from './CurrentContentSection';
import { ReleasesSection } from './ReleasesSection';
import { UsagesSection } from './UsagesSection';
import type { BlockDetailViewModel, ReleaseViewModel, UsageViewModel } from './types';

interface Props {
  block: BlockDetailViewModel | null;
  releases: ReleaseViewModel[];
  usages: UsageViewModel[];
  isLoading: boolean;
  showNewRelease: boolean;
  newReleaseTitle: string;
  selectedVersion: number | null;
  hoveredVersion: number | null;
  onClose: () => void;
  onCreateRelease: () => void;
  onInsert: () => void;
  onVersionSelect: (version: number) => void;
  onVersionHover: (version: number | null) => void;
  onShowNewRelease: () => void;
  onCancelNewRelease: () => void;
  onNewReleaseTitleChange: (title: string) => void;
}

export function BlockDetailPanelView({
  block,
  releases,
  usages,
  isLoading,
  showNewRelease,
  newReleaseTitle,
  selectedVersion,
  hoveredVersion,
  onClose,
  onCreateRelease,
  onInsert,
  onVersionSelect,
  onVersionHover,
  onShowNewRelease,
  onCancelNewRelease,
  onNewReleaseTitleChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Block 不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <span className="text-sm font-medium">{block.title}</span>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Current Content */}
          <CurrentContentSection
            content={block.content}
            type={block.type}
            tags={block.tags}
            createdAt={block.createdAt}
          />

          {/* Releases */}
          <ReleasesSection
            releases={releases}
            showNewRelease={showNewRelease}
            newReleaseTitle={newReleaseTitle}
            selectedVersion={selectedVersion}
            hoveredVersion={hoveredVersion}
            onShowNewRelease={onShowNewRelease}
            onCancelNewRelease={onCancelNewRelease}
            onNewReleaseTitleChange={onNewReleaseTitleChange}
            onCreateRelease={onCreateRelease}
            onVersionSelect={onVersionSelect}
            onVersionHover={onVersionHover}
          />

          {/* Usages */}
          <UsagesSection usages={usages} />
        </div>
      </ScrollArea>

      {/* Footer */}
      {selectedVersion !== null && (
        <div className="flex items-center justify-between p-4 border-t shrink-0">
          <span className="text-xs text-muted-foreground">已选择 v{selectedVersion}</span>
          <Button
            variant="default"
            size="sm"
            onClick={onInsert}
            className="bg-accent-green hover:bg-accent-green/90"
          >
            插入到编辑器
          </Button>
        </div>
      )}
    </div>
  );
}
