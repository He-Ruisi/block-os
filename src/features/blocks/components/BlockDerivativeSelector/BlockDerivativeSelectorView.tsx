import { GitBranch, Layers3 } from 'lucide-react'
import { EmptyState } from '@/components/shells'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DerivativesSection } from './DerivativesSection'
import { SourceBlockSection } from './SourceBlockSection'
import type { DerivativeTreeViewModel } from './types'

interface Props {
  tree: DerivativeTreeViewModel | null
  isLoading: boolean
  selectedBlockId: string
  onSelect: () => void
  onCancel: () => void
  onBlockSelect: (blockId: string) => void
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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            选择 Block 版本
          </DialogTitle>
          <DialogDescription>
            从源 Block 或其派生版本中选择要插入的内容。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-5">
            {isLoading ? (
              <EmptyState compact icon={Layers3} title="正在加载版本树" />
            ) : tree ? (
              <>
                <SourceBlockSection
                  source={tree.source}
                  isSelected={selectedBlockId === tree.source.id}
                  onSelect={() => onBlockSelect(tree.source.id)}
                />
                {tree.derivatives.length > 0 ? (
                  <DerivativesSection
                    derivatives={tree.derivatives}
                    selectedBlockId={selectedBlockId}
                    onSelect={onBlockSelect}
                  />
                ) : (
                  <EmptyState
                    compact
                    icon={Layers3}
                    title="暂无派生版本"
                    description="引用这个 Block 并继续编辑后，这里会出现新的派生版本。"
                  />
                )}
              </>
            ) : (
              <EmptyState
                compact
                icon={Layers3}
                title="没有可选版本"
                description="当前无法构建这个 Block 的版本树。"
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onSelect} disabled={!selectedBlockId}>
            选择此版本
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
