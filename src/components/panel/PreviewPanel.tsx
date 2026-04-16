import { useState, useEffect, useCallback } from 'react'
import type { Block } from '@/types/models/block'
import { DEFAULT_STYLE_THEMES, DEFAULT_DOCUMENT_TEMPLATES } from '@/types/models/block'
import { blockStore } from '@/storage/blockStore'
import { documentStore } from '@/storage/documentStore'
import { exportBlocks } from '@/features/blocks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PreviewPanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedThemeId, setSelectedThemeId] = useState('editing')
  const [selectedTemplateId, setSelectedTemplateId] = useState('novel')
  const [previewContent, setPreviewContent] = useState('')
  const [previewFormat, setPreviewFormat] = useState<'markdown' | 'html' | 'plain-text'>('plain-text')
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  const selectedTheme = DEFAULT_STYLE_THEMES.find(t => t.id === selectedThemeId) ?? DEFAULT_STYLE_THEMES[0]
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
    setPreviewFormat(result.format)
  }, [blocks, selectedTemplateId, selectedThemeId])

  const handleCopy = async () => {
    if (!previewContent) return
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const handleDownload = () => {
    if (!previewContent) return
    const ext = previewFormat === 'markdown' ? 'md' : previewFormat === 'html' ? 'html' : 'txt'
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${selectedTemplate.name}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 控制区域 */}
      <div className="flex flex-shrink-0 flex-col gap-2.5 border-b border-border p-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            样式主题
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_STYLE_THEMES.map(theme => (
              <button
                key={theme.id}
                className={cn(
                  "whitespace-nowrap rounded-2xl border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-border hover:text-foreground",
                  selectedThemeId === theme.id && "border-purple-600 bg-purple-600/10 font-medium text-purple-600"
                )}
                onClick={() => setSelectedThemeId(theme.id)}
              >
                {theme.id === 'editing' ? '✏️' : theme.id === 'preview' ? '👁' : '📝'}
                {' '}{theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            导出模板
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_DOCUMENT_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                className={cn(
                  "whitespace-nowrap rounded-2xl border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-border hover:text-foreground",
                  selectedTemplateId === tmpl.id && "border-purple-600 bg-purple-600/10 font-medium text-purple-600"
                )}
                onClick={() => setSelectedTemplateId(tmpl.id)}
              >
                {tmpl.id === 'novel' ? '📖' : tmpl.id === 'blog' ? '📰' : '📋'}
                {' '}{tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* 当前配置摘要 */}
        <div className="flex flex-wrap items-center gap-1.5 rounded bg-secondary px-2.5 py-1.5">
          <span className="text-[11px] text-muted-foreground">
            AI块: {selectedTemplate.exportRules.aiBlocks === 'merge-as-paragraph' ? '融入正文' : selectedTemplate.exportRules.aiBlocks === 'keep-as-quote' ? '保留引用' : '移除'}
          </span>
          <span className="text-[11px] text-border">·</span>
          <span className="text-[11px] text-muted-foreground">
            格式: {selectedTemplate.exportRules.format === 'markdown' ? 'Markdown' : selectedTemplate.exportRules.format === 'html' ? 'HTML' : '纯文本'}
          </span>
          <span className="text-[11px] text-border">·</span>
          <span className="text-[11px] text-muted-foreground">
            来源标签: {selectedTheme.showSourceLabels ? '显示' : '隐藏'}
          </span>
        </div>
      </div>

      {/* 预览区域 */}
      <div className={cn(
        "min-h-0 flex-1 overflow-y-auto px-4 py-5",
        selectedThemeId === 'editing' && "text-foreground",
        selectedThemeId === 'preview' && "font-serif text-muted-foreground leading-8",
        selectedThemeId === 'review' && "text-foreground"
      )}>
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
        ) : previewFormat === 'html' ? (
          <div
            className={cn(
              "break-words text-sm leading-relaxed text-foreground",
              "[&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-semibold",
              "[&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold",
              "[&_p]:mb-3",
              "[&_blockquote]:my-3 [&_blockquote]:rounded-r [&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:bg-secondary [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:text-muted-foreground",
              "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-secondary [&_pre]:p-3",
              "[&_hr]:my-5 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border",
              selectedThemeId === 'review' && "rounded-md border border-[#f0e6c0] bg-[#fffef5] p-4"
            )}
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        ) : (
          <pre className={cn(
            "m-0 whitespace-pre-wrap break-words bg-transparent text-sm leading-relaxed text-foreground",
            selectedThemeId === 'review' && "rounded-md border border-[#f0e6c0] bg-[#fffef5] p-4"
          )}>
            {previewContent}
          </pre>
        )}
      </div>

      {/* 底部操作栏 */}
      {blocks.length > 0 && (
        <div className="flex flex-shrink-0 items-center justify-between border-t border-border bg-secondary px-3 py-2.5">
          <span className="text-[11px] text-muted-foreground">{blocks.length} 个段落</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleCopy}
              disabled={!previewContent}
            >
              {copySuccess ? '✓ 已复制' : '📋 复制'}
            </Button>
            <Button
              size="sm"
              className="h-7 bg-purple-600 px-3 text-xs hover:bg-purple-700"
              onClick={handleDownload}
              disabled={!previewContent}
            >
              ⬇ 导出文件
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
