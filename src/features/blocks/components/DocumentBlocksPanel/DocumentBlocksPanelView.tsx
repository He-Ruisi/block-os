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
        description="当前文档的隐式 Block 结构"
        leading={<FileText className="h-4 w-4" />}
      />

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <EmptyState
              compact
              icon={FileText}
              title="正在解析文档"
              description="文档中的 Block 结构正在生成。"
            />
          ) : blocks.length === 0 ? (
            <EmptyState
              compact
              icon={FileText}
              title="文档里还没有 Block"
              description="开始写作后，每个段落都会自动映射为 Block。"
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
              <p className="text-xs text-muted-foreground">段落 Block</p>
              <p className="text-base font-semibold">{stats.totalBlocks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">文档链接</p>
              <p className="text-base font-semibold">{stats.totalLinks}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelShell>
  )
}
