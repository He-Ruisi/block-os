import { CalendarClock, Sparkles, SquarePen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  content: string
  type: string
  tags: string[]
  createdAt: string
}

export function CurrentContentSection({ content, type, tags, createdAt }: Props) {
  return (
    <section className="space-y-3">
      <Card>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">当前内容</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {type === 'ai-generated' ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <SquarePen className="h-3 w-3" />
                )}
                {type === 'ai-generated' ? 'AI 生成' : '手动编辑'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CalendarClock className="h-3 w-3" />
                {createdAt}
              </Badge>
            </div>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[220px] rounded-md border bg-muted/20 p-3">
            <p className="whitespace-pre-wrap pr-4 text-xs leading-relaxed text-foreground">
              {content}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}
