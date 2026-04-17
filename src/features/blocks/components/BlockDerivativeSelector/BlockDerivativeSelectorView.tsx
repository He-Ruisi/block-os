import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SourceBlockSection } from './SourceBlockSection';
import { DerivativesSection } from './DerivativesSection';
import type { DerivativeTreeViewModel } from './types';

interface Props {
  tree: DerivativeTreeViewModel | null;
  isLoading: boolean;
  selectedBlockId: string;
  onSelect: () => void;
  onCancel: () => void;
  onBlockSelect: (blockId: string) => void;
}

export function BlockDerivativeSelectorView({
  tree,
  isLoading,
  selectedBlockId,
  onSelect,
  onCancel,
  onBlockSelect,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="derivative-selector-title"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h3 id="derivative-selector-title" className="text-lg font-semibold">选择 Block 版本</h3>
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="关闭对话框">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-3">⏳</div>
              <div className="text-sm text-muted-foreground">加载中...</div>
            </div>
          ) : tree ? (
            <div className="py-6 space-y-6">
              {/* Source Block */}
              <SourceBlockSection
                source={tree.source}
                isSelected={selectedBlockId === tree.source.id}
                onSelect={() => onBlockSelect(tree.source.id)}
              />

              {/* Derivatives */}
              {tree.derivatives.length > 0 ? (
                <DerivativesSection
                  derivatives={tree.derivatives}
                  selectedBlockId={selectedBlockId}
                  onSelect={onBlockSelect}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="text-sm text-muted-foreground mb-1">暂无派生版本</div>
                  <div className="text-xs text-muted-foreground">
                    引用此 Block 并修改后会自动创建派生版本
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t shrink-0">
          <Button variant="secondary" onClick={onCancel} aria-label="取消选择">
            取消
          </Button>
          <Button
            variant="default"
            onClick={onSelect}
            disabled={!selectedBlockId}
            aria-label="确认选择此版本"
            className="bg-accent-green hover:bg-accent-green/90"
          >
            选择此版本
          </Button>
        </div>
      </Card>
    </div>
  );
}
