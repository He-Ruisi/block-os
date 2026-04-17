import { CircleDot, GitBranchPlus } from 'lucide-react'
import { BlockCardShell } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlockSummaryViewModel } from './types'

interface Props {
  derivatives: BlockSummaryViewModel[]
  selectedBlockId: string
  onSelect: (blockId: string) => void
}

export function DerivativesSection({
  derivatives,
  selectedBlockId,
  onSelect,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <GitBranchPlus className="h-4 w-4 text-muted-foreground" />
        <span>派生版本</span>
        <Badge variant="secondary">{derivatives.length}</Badge>
      </div>
      <div className="space-y-2">
        {derivatives.map((derivative) => {
          const isSelected = selectedBlockId === derivative.id

          return (
            <BlockCardShell
              key={derivative.id}
              tone={isSelected ? 'selected' : 'interactive'}
              className={cn('border-border/70', isSelected && 'ring-1 ring-primary/25')}
            >
              <div
                onClick={() => onSelect(derivative.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(derivative.id)
                  }
                }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <CircleDot
                    className={cn(
                      'mt-0.5 h-4 w-4 text-muted-foreground',
                      isSelected && 'text-primary'
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <h5 className="text-sm font-medium">{derivative.title}</h5>
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {derivative.content}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {derivative.contextTitle ? (
                    <Badge variant="outline">{derivative.contextTitle}</Badge>
                  ) : null}
                  <Badge variant="outline">{derivative.createdAt}</Badge>
                </div>
                {derivative.modifications ? (
                  <p className="text-xs italic text-muted-foreground">
                    {derivative.modifications}
                  </p>
                ) : null}
              </div>
            </BlockCardShell>
          )
        })}
      </div>
    </section>
  )
}
