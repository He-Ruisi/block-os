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
            Select block version
          </DialogTitle>
          <DialogDescription>
            Choose either the source block or one of its derived versions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-5">
            {isLoading ? (
              <EmptyState compact icon={Layers3} title="Loading version tree" />
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
                    title="No derived versions yet"
                    description="Derived versions will appear here after you reuse and edit this block."
                  />
                )}
              </>
            ) : (
              <EmptyState
                compact
                icon={Layers3}
                title="No versions available"
                description="The version tree could not be loaded for this block."
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSelect} disabled={!selectedBlockId}>
            Use selected version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
