import { FileText, Hash, Link2, List } from 'lucide-react'
import { BlockCardShell } from '@/components/shells'
import { Badge } from '@/components/ui/badge'
import type { BlockViewModel } from './types'

interface Props {
  block: BlockViewModel
}

function getNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'heading':
      return <Hash className="h-3.5 w-3.5" />
    case 'paragraph':
      return <FileText className="h-3.5 w-3.5" />
    case 'listItem':
      return <List className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

export function BlockItemView({ block }: Props) {
  return (
    <BlockCardShell className="border-border/70">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{getNodeIcon(block.nodeType)}</span>
          <Badge variant="outline">#{block.index}</Badge>
          {block.links.length > 0 ? (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Link2 className="h-2.5 w-2.5" />
              {block.links.length}
            </Badge>
          ) : null}
        </div>

        <p className="line-clamp-3 text-xs leading-relaxed text-foreground">
          {block.content}
        </p>

        {block.links.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {block.links.map((linkId) => (
              <Badge key={linkId} variant="outline" className="text-[10px]" title={linkId}>
                {linkId.slice(0, 8)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </BlockCardShell>
  )
}
