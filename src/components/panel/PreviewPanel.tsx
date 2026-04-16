import { useState, useEffect, useCallback } from 'react'
import { Eye, FileCheck, FileText, FileCode, Download } from 'lucide-react'
import type { Block } from '@/types/models/block'
import { DEFAULT_DOCUMENT_TEMPLATES } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { documentStore } from '@/storage/documentStore'
import { exportBlocks } from '@/features/blocks'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function PreviewPanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState('preview')
  const [selectedTemplateId, setSelectedTemplateId] = useState('blog')
  const [previewContent, setPreviewContent] = useState('')
  const [exportFormat, setExportFormat] = useState('md')
  const [isLoading, setIsLoading] = useState(true)

  const selectedTemplate = DEFAULT_DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplateId) ?? DEFAULT_DOCUMENT_TEMPLATES[0]

  // 加载当前文档的 Block
  const loadBlocks = useCallback(async () => {
    try {
      setIsLoading(true)
      const docId = documentStore.getCurrentDocumentId()
      if (!docId) {
        // 没有文档时加载所有显式 Block
        const allBlocks = await blockStore.getAllBlocks()
        setBlocks(allBlocks.filter(b => !b.implicit))
        return
      }
      const doc = await documentStore.getDocument(docId)
      if (!doc) { setBlocks([]); return }

      // 从文档的隐式 Block 构建预览用 Block 列表
      const previewBlocks: Block[] = doc.blocks.map(db => ({
        id: db.id,
        content: db.content,
        type: db.nodeType === 'heading' ? 'heading' as const : 'text' as const,
        source: { type: 'editor' as const, documentId: docId, capturedAt: new Date() },
        metadata: { tags: [], createdAt: new Date(), updatedAt: new Date() },
        template: {
          role: db.nodeType === 'heading' ? 'heading' as const : 'paragraph' as const,
          level: db.nodeType === 'heading' ? 1 : undefined,
        },
      }))
      setBlocks(previewBlocks)
    } catch (error) {
      console.error('Failed to load blocks for preview:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadBlocks() }, [loadBlocks])

  // 定期刷新
  useEffect(() => {
    const interval = setInterval(loadBlocks, 3000)
    return () => clearInterval(interval)
  }, [loadBlocks])

  // 生成预览
  useEffect(() => {
    if (blocks.length === 0) {
      setPreviewContent('')
      return
    }
    const result = exportBlocks(blocks, selectedTemplateId, selectedThemeId)
    setPreviewContent(result.content)
  }, [blocks, selectedTemplateId, selectedThemeId])

  const handleDownload = () => {
    if (!previewContent) return
    const ext = exportFormat
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${selectedTemplate.name}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTemplateName = (id: string) => {
    const names: Record<string, string> = {
      'novel': '小说',
      'blog': '博客',
      'outline': '大纲',
    }
    return names[id] || id
  }

  const getModeName = (id: string) => {
    const names: Record<string, string> = {
      'preview': '预览模式',
      'review': '审阅模式',
      'editing': '编辑模式',
    }
    return names[id] || id
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Settings */}
      <div className="space-y-4 mb-4 shrink-0">
        {/* Mode Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">模式:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedThemeId === 'preview' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedThemeId('preview')}
              className={cn(
                selectedThemeId === 'preview' && 'bg-accent-green hover:bg-accent-green/90 text-white'
              )}
            >
              <Eye className="h-4 w-4 mr-1" />
              预览
            </Button>
            <Button
              variant={selectedThemeId === 'review' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedThemeId('review')}
              className={cn(
                selectedThemeId === 'review' && 'bg-accent-green hover:bg-accent-green/90 text-white'
              )}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              审阅
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">模板:</span>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="flex-1 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novel">小说</SelectItem>
              <SelectItem value="blog">博客</SelectItem>
              <SelectItem value="outline">大纲</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">格式:</span>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="flex-1 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="md">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2 text-accent-green" />
                  Markdown
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  纯文本
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Word
                </div>
              </SelectItem>
              <SelectItem value="html">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                  HTML
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="icon" 
            className="bg-accent-green hover:bg-accent-green/90 text-white shrink-0"
            onClick={handleDownload}
            disabled={!previewContent}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 rounded-lg border border-border bg-secondary/50 overflow-hidden min-h-0">
        <div className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-secondary flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground">
              {getModeName(selectedThemeId)} · {getTemplateName(selectedTemplateId)}
            </span>
            <Badge variant="outline" className="text-[10px] border-accent-green/30 text-accent-green">
              .{exportFormat}
            </Badge>
          </div>
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 text-5xl opacity-50">⏳</div>
                <div className="mb-1.5 text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : blocks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 text-5xl opacity-50">📄</div>
                <div className="mb-1.5 text-sm text-muted-foreground">当前文档为空</div>
                <div className="text-xs text-muted-foreground">在编辑器中写入内容后，这里会显示预览</div>
              </div>
            ) : (
              <div className={cn(
                'prose prose-invert prose-sm max-w-none',
                selectedThemeId === 'review' && 'bg-yellow-500/5 rounded p-2'
              )}>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {previewContent}
                </pre>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
