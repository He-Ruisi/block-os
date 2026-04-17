import { Clock3, Plus } from 'lucide-react'
import { BlockCardShell, EmptyState } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ReleaseViewModel } from './types'

interface Props {
  releases: ReleaseViewModel[]
  showNewRelease: boolean
  newReleaseTitle: string
  selectedVersion: number | null
  hoveredVersion: number | null
  onShowNewRelease: () => void
  onCancelNewRelease: () => void
  onNewReleaseTitleChange: (title: string) => void
  onCreateRelease: () => void
  onVersionSelect: (version: number) => void
  onVersionHover: (version: number | null) => void
}

export function ReleasesSection({
  releases,
  showNewRelease,
  newReleaseTitle,
  selectedVersion,
  hoveredVersion,
  onShowNewRelease,
  onCancelNewRelease,
  onNewReleaseTitleChange,
  onCreateRelease,
  onVersionSelect,
  onVersionHover,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <span>版本历史</span>
          <Badge variant="secondary">{releases.length}</Badge>
        </div>
        <Button size="sm" onClick={onShowNewRelease} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          发布新版本
        </Button>
      </div>

      {showNewRelease ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <Input
              placeholder="输入版本标题，例如：简历优化版"
              value={newReleaseTitle}
              onChange={(event) => onNewReleaseTitleChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onCreateRelease()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onCancelNewRelease}>
                取消
              </Button>
              <Button size="sm" onClick={onCreateRelease}>
                发布
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {releases.length === 0 ? (
        <EmptyState
          compact
          icon={Clock3}
          title="还没有版本"
          description="发布后可在这里查看历史内容并插入指定版本。"
        />
      ) : (
        <div className="space-y-2">
          {[...releases].reverse().map((release) => (
            <Popover
              key={release.version}
              open={hoveredVersion === release.version}
              onOpenChange={(open) => {
                if (!open) {
                  onVersionHover(null)
                }
              }}
            >
              <PopoverTrigger asChild>
                <div>
                  <BlockCardShell
                    tone={selectedVersion === release.version ? 'selected' : 'interactive'}
                    className={cn(
                      'border-border/70',
                      selectedVersion === release.version && 'ring-1 ring-primary/25'
                    )}
                  >
                    <div
                      onClick={() => onVersionSelect(release.version)}
                      onMouseEnter={() => onVersionHover(release.version)}
                      onMouseLeave={() => onVersionHover(null)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onVersionSelect(release.version)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`版本 ${release.version}: ${release.title}`}
                      aria-pressed={selectedVersion === release.version}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge>v{release.version}</Badge>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {release.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {release.releasedAt}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {release.content}
                      </p>
                    </div>
                  </BlockCardShell>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 p-0"
                side="left"
                align="start"
                onOpenAutoFocus={(event) => event.preventDefault()}
                onMouseEnter={() => onVersionHover(release.version)}
                onMouseLeave={() => onVersionHover(null)}
              >
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge>v{release.version}</Badge>
                    <span className="text-sm font-medium">{release.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{release.releasedAt}</p>
                </div>
                <ScrollArea className="h-[320px]">
                  <div className="p-4">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                      {release.content}
                    </p>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}
    </section>
  )
}
