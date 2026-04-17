import { Link2 } from 'lucide-react'
import { BlockCardShell, EmptyState } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import type { UsageViewModel } from './types'

interface Props {
  usages: UsageViewModel[]
}

export function UsagesSection({ usages }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span>引用记录</span>
        <Badge variant="secondary">{usages.length}</Badge>
      </div>
      {usages.length === 0 ? (
        <EmptyState
          compact
          icon={Link2}
          title="还没有引用记录"
          description="当这个 Block 被插入到文档后，这里会记录使用情况。"
        />
      ) : (
        <div className="space-y-2">
          {usages.map((usage) => (
            <BlockCardShell key={usage.id} className="border-border/70">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">{usage.documentTitle}</p>
                  <p className="text-[11px] text-muted-foreground">{usage.insertedAt}</p>
                </div>
                <Badge>v{usage.releaseVersion}</Badge>
              </div>
            </BlockCardShell>
          ))}
        </div>
      )}
    </section>
  )
}
