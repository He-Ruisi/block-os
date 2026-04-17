import { FileText, Link2 } from 'lucide-react'
import { EmptyState, PanelHeader, PanelShell } from '@/components/shells'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BlockListView } from './BlockListView'
import type { BlockViewModel, DocumentBlocksStats } from './types'

interface Props {
  blocks: BlockViewModel[]
  documentTitle: string
  isLoading: boolean
  stats: DocumentBlocksStats
}

export function DocumentBlocksPanelView({
  blocks,
  documentTitle,
  isLoading,
  stats,
}: Props) {
  return (
    <PanelShell>
      <PanelHeader
        title={documentTitle}
        description="Implicit block structure for the current document"
        leading={<FileText className="h-4 w-4" />}
      />

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <EmptyState
              compact
              icon={FileText}
              title="Parsing document"
              description="Document blocks are still being generated."
            />
          ) : blocks.length === 0 ? (
            <EmptyState
              compact
              icon={FileText}
              title="No blocks in this document yet"
              description="Once you start writing, each paragraph can become a block."
            />
          ) : (
            <BlockListView blocks={blocks} />
          )}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-2 gap-3 border-t p-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Paragraph blocks</p>
              <p className="text-base font-semibold">{stats.totalBlocks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Block links</p>
              <p className="text-base font-semibold">{stats.totalLinks}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelShell>
  )
}
