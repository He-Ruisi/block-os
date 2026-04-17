import { FilePenLine, List } from 'lucide-react'
import { EmptyState } from '@/components/shells/EmptyState'
import { Button } from '@/components/ui/button'
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
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8">
        <EmptyState compact icon={FilePenLine} title="没有打开的文档" description="打开文档后会在这里显示标题大纲。" />
      </div>
    )
  }

  if (outline.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8">
        <EmptyState compact icon={List} title="暂无标题" description="使用 H1-H6 标题后，这里会自动生成大纲。" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="section-label w-fit">
        <span className="section-label__dot" />
        <span className="section-label__text">Outline</span>
      </div>

      <div className="rounded-2xl border border-border/80 bg-background/90 p-3 shadow-[var(--shadow-sm)]">
        <div className="mb-3 truncate px-2 text-sm font-semibold text-foreground">{documentTitle}</div>
        <div className="space-y-1">
          {outline.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary/[0.04]"
              style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
              onClick={() => onHeadingClick(item)}
              title={item.text}
            >
              <span className="min-w-[28px] shrink-0 rounded-md bg-primary/[0.08] px-1.5 py-1 text-center font-mono text-[10px] font-semibold text-primary">
                H{item.level}
              </span>
              <span
                className={cn(
                  'flex-1 truncate text-sm',
                  item.level === 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.text}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
