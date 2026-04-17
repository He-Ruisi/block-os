import { CircleDot, Sparkles } from 'lucide-react'
import { BlockCardShell } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlockSummaryViewModel } from './types'

interface Props {
  source: BlockSummaryViewModel
  isSelected: boolean
  onSelect: () => void
}

export function SourceBlockSection({ source, isSelected, onSelect }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span>源 Block</span>
      </div>
      <BlockCardShell
        tone={isSelected ? 'selected' : 'interactive'}
        className={cn('border-border/70', isSelected && 'ring-1 ring-primary/25')}
      >
        <div
          onClick={onSelect}
          role="radio"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect()
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
              <h5 className="text-sm font-medium">{source.title}</h5>
              <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {source.content}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{source.createdAt}</Badge>
            {source.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </BlockCardShell>
    </section>
  )
}
