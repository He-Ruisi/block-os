import { useState, useEffect } from 'react'
import { FileText, Hash, Link2 } from 'lucide-react'
import type { DocumentBlock } from '@/types/models/document'
import { documentStore } from '@/storage/documentStore'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import '@/styles/modules/blocks.css'
import '@/styles/modules/common-patterns.css'

export function DocumentBlocksPanel() {
  const [blocks, setBlocks] = useState<DocumentBlock[]>([])
  const [documentTitle, setDocumentTitle] = useState<string>('当前文档')
  const [isLoading, setIsLoading] = useState(true)

  const loadDocumentBlocks = async () => {
    try {
      setIsLoading(true)
      const docId = documentStore.getCurrentDocumentId()

      if (!docId) {
        setBlocks([])
        return
      }

      const doc = await documentStore.getDocument(docId)
      if (doc) {
        setBlocks(doc.blocks)
        setDocumentTitle(doc.title)
      }
    } catch (error) {
      console.error('Failed to load document blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDocumentBlocks()
    const interval = setInterval(() => {
      void loadDocumentBlocks()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'heading':
        return <Hash className="h-3 w-3" />
      case 'paragraph':
        return <FileText className="h-3 w-3" />
      case 'listItem':
        return <span className="text-xs">•</span>
      default:
        return <span className="text-xs">○</span>
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{documentTitle}</h3>
        </div>
        <p className="text-xs text-muted-foreground">隐式 Block 结构</p>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-sm text-muted-foreground mb-1">开始写作</div>
            <div className="text-xs text-muted-foreground">每个段落都会自动成为一个 Block</div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {blocks.map((block, index) => (
              <Card key={block.id} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-muted-foreground">{getNodeIcon(block.nodeType)}</span>
                  <Badge variant="outline" className="text-[10px]">#{index + 1}</Badge>
                  {block.links.length > 0 && (
                    <Badge className="bg-accent-green text-white text-[10px]" title={`${block.links.length} 个链接`}>
                      <Link2 className="h-2.5 w-2.5 mr-1" />
                      {block.links.length}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-foreground leading-relaxed line-clamp-2 mb-2">
                  {block.content}
                </p>
                {block.links.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {block.links.map((linkId, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]" title={linkId}>
                        → {linkId.substring(0, 8)}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-around p-4 border-t shrink-0">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">段落</div>
          <div className="text-lg font-semibold">{blocks.length}</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">链接</div>
          <div className="text-lg font-semibold">
            {blocks.reduce((sum, block) => sum + block.links.length, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
