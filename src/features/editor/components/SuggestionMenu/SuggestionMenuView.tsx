import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SuggestionMenuViewProps } from './types'

export function SuggestionMenuView({
  items,
  onSelect,
  position,
  activeIndex,
  onHover,
}: SuggestionMenuViewProps & {
  activeIndex: number
  onHover: (index: number) => void
}) {
  if (items.length === 0) return null

  return (
    <Card
      className="fixed z-50 w-80 overflow-hidden border shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="max-h-72 overflow-y-auto p-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left transition-colors',
              index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
            )}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(index)}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {item.content.substring(0, 60)}
              {item.content.length > 60 ? '...' : ''}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
