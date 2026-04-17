import { Star, Folder, FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shells/EmptyState'
import { cn } from '@/lib/utils'
import type { StarredItemViewModel } from './types'

interface StarredViewProps {
  items: StarredItemViewModel[]
  draggedItemId: string | null
  onItemClick: (item: { id: string; type: 'project' | 'document' }) => void
  onUnstar: (item: StarredItemViewModel) => void
  onDragStart: (item: StarredItemViewModel) => void
  onDragEnd: () => void
  onDrop: (targetItem: StarredItemViewModel) => void
}

export function StarredView({
  items,
  draggedItemId,
  onItemClick,
  onUnstar,
  onDragStart,
  onDragEnd,
  onDrop,
}: StarredViewProps) {
  if (items.length === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-2">
          <EmptyState
            icon={Star}
            title="还没有置顶项目"
            description="在项目或文档上点击星标图标即可置顶"
          />
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        <div className="flex flex-col gap-0.5">
          {items.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all relative group',
                draggedItemId === item.id ? 'opacity-50 cursor-move' : 'hover:bg-muted'
              )}
              onClick={() => onItemClick(item)}
              draggable
              onDragStart={() => onDragStart(item)}
              onDragEnd={onDragEnd}
              onDragOver={e => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={e => {
                e.preventDefault()
                onDrop(item)
              }}
            >
              {item.type === 'project' ? (
                <Folder size={16} className="text-muted-foreground shrink-0" />
              ) : (
                <FileText size={16} className="text-muted-foreground shrink-0" />
              )}
              <span className="flex-1 text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {item.displayName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-yellow-500 hover:bg-muted"
                onClick={e => {
                  e.stopPropagation()
                  onUnstar(item)
                }}
                title="取消置顶"
              >
                <Star size={14} fill="currentColor" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
