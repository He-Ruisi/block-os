import { FilePenLine, List } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shells/EmptyState'
import { cn } from '@/lib/utils'
import type { OutlineItemViewModel } from './types'

interface OutlineViewProps {
  documentId: string | null
  outline: OutlineItemViewModel[]
  documentTitle: string
  onHeadingClick: (item: { text: string; level: number }) => void
}

export function OutlineView({
  documentId,
  outline,
  documentTitle,
  onHeadingClick,
}: OutlineViewProps) {
  if (!documentId) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-2">
          <EmptyState
            icon={FilePenLine}
            title="没有打开的文档"
            description="打开文档后显示大纲"
          />
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {outline.length === 0 ? (
          <EmptyState
            icon={List}
            title="暂无标题"
            description="使用标题（H1-H6）生成文档大纲"
          />
        ) : (
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1 px-3 pb-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {documentTitle}
            </div>
            {outline.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 py-1.5 px-3 rounded cursor-pointer transition-colors mb-px hover:bg-muted"
                style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                onClick={() => onHeadingClick(item)}
                title={item.text}
              >
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1 py-0.5 rounded shrink-0 min-w-[24px] text-center font-mono">
                  H{item.level}
                </span>
                <span
                  className={cn(
                    'text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1',
                    item.level === 1
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
