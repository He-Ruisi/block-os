import { Tag } from 'lucide-react'
import { BlockCardShell } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlockViewModel } from './types'

interface Props {
  block: BlockViewModel
  isHighlighted: boolean
  onClick: () => void
  onDragStart: () => string
}

export function BlockItemView({ block, isHighlighted, onClick, onDragStart }: Props) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const data = onDragStart()
    event.dataTransfer.setData('application/blockos-block', data)
    event.dataTransfer.setData('text/plain', block.content)
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <BlockCardShell
      tone={isHighlighted ? 'selected' : 'interactive'}
      className={cn(
        'group border-border/70',
        isHighlighted && 'ring-1 ring-primary/30'
      )}
    >
      <div
        data-block-id={block.id}
        draggable
        onDragStart={handleDragStart}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`查看 Block: ${block.title}`}
        className="space-y-3"
      >
        <div className="space-y-2">
          <h4 className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
            {block.title}
          </h4>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {block.preview}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {block.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-[10px]">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </BlockCardShell>
  )
}
