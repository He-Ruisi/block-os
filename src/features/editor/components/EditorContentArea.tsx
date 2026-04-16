import { useRef, useCallback, useEffect, useState } from 'react'
import { EditorContent, Editor } from '@tiptap/react'
import { Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SuggestionMenu } from './SuggestionMenu'
import { blockStore } from '@/storage/blockStore'

interface SuggestionItem {
  id: string
  title: string
  content: string
}

interface EditorContentAreaProps {
  editor: Editor | null
  documentTitle?: string
  tags?: string[]
  className?: string
}

/** 判断拖拽事件是否来自 BlockOS */
function isBlockOSDrag(e: DragEvent | React.DragEvent): boolean {
  return (
    e.dataTransfer?.types.includes('application/blockos-ai-content') ||
    e.dataTransfer?.types.includes('application/blockos-block')
  ) ?? false
}

export function EditorContentArea({
  editor,
  documentTitle = '欢迎使用 BlockOS',
  tags = ['教程', '入门'],
  className,
}: EditorContentAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const currentDocIdRef = useRef<string | null>(null)
  const updateTimeoutRef = useRef<number | null>(null)

  // Suggestion state (保留用于未来扩展)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionItems] = useState<SuggestionItem[]>([])
  const [suggestionPosition] = useState({ top: 0, left: 0 })
  const [suggestionType] = useState<'link' | 'reference' | null>(null)
  const [suggestionRange] = useState<{ from: number; to: number } | null>(null)

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!editor || !isBlockOSDrag(e)) return
    e.preventDefault()
    e.stopPropagation()

    const aiContent = e.dataTransfer.getData('application/blockos-ai-content')
    const blockData = e.dataTransfer.getData('application/blockos-block')

    let insertData: Record<string, unknown> | null = null

    if (blockData) {
      try {
        const parsed = JSON.parse(blockData)
        const title = parsed.title || 'Block'
        const text = parsed.content || blockData
        insertData = {
          type: 'sourceBlock',
          attrs: { source: 'inspiration', sourceLabel: `💡 灵感 · ${title}`, blockId: parsed.id || null },
          content: text.split('\n').filter((l: string) => l.trim()).map((line: string) => ({
            type: 'paragraph',
            content: [{ type: 'text', text: line }],
          })),
        }
      } catch {
        insertData = {
          type: 'sourceBlock',
          attrs: { source: 'inspiration', sourceLabel: '💡 灵感' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: blockData }] }],
        }
      }
    } else if (aiContent) {
      const lines = aiContent.split('\n').filter((l: string) => l.trim())
      insertData = {
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: 'AI 生成' },
        content: lines.map((line: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        })),
      }
    }

    if (!insertData) return

    const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY })
    if (pos) {
      editor.chain().focus().setTextSelection(pos.pos).insertContent(insertData).run()
    } else {
      editor.chain().focus().insertContent(insertData).run()
    }
  }, [editor])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (isBlockOSDrag(e)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [])

  return (
    <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        {/* Page Icon & Title */}
        <div className="mb-6">
          <button className="text-4xl sm:text-5xl mb-3 hover:scale-110 transition-transform">
            📝
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground outline-none leading-tight">
            {documentTitle}
          </h1>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Hash className="w-4 h-4 text-muted-foreground" />
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            + 添加标签
          </button>
        </div>

        {/* Editor Content - 所见即所得的 Markdown 渲染 */}
        <div
          ref={editorRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            // 基础 prose 样式
            "prose prose-neutral dark:prose-invert max-w-none",
            "text-[15px] leading-relaxed",
            
            // 标题样式 - 参考 MarkdownRenderer
            "prose-headings:font-semibold prose-headings:text-foreground",
            "prose-h1:mb-4 prose-h1:mt-6 prose-h1:border-b-2 prose-h1:border-border prose-h1:pb-2 prose-h1:text-[28px]",
            "prose-h2:mb-3 prose-h2:mt-5 prose-h2:text-2xl",
            "prose-h3:mb-2.5 prose-h3:mt-4 prose-h3:text-xl",
            "prose-h4:mb-2 prose-h4:mt-3.5 prose-h4:text-lg",
            
            // 段落样式
            "prose-p:my-3 prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0",
            
            // 引用样式 - 参考 MarkdownRenderer
            "prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:border-primary",
            "prose-blockquote:bg-primary/5 prose-blockquote:px-4 prose-blockquote:py-3",
            "prose-blockquote:not-italic prose-blockquote:text-foreground",
            
            // 列表样式
            "prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6",
            "prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6",
            "prose-li:my-1.5 prose-li:leading-relaxed",
            
            // 代码样式 - 参考 MarkdownRenderer
            "prose-code:text-primary prose-code:bg-accent prose-code:border prose-code:border-border",
            "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.9em]",
            "prose-code:before:content-none prose-code:after:content-none",
            
            // 代码块样式
            "prose-pre:my-4 prose-pre:overflow-hidden prose-pre:rounded-lg prose-pre:border prose-pre:border-border",
            "prose-pre:bg-muted prose-pre:p-0",
            
            // 链接样式
            "prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-transparent",
            "hover:prose-a:border-primary",
            
            // 表格样式
            "prose-table:my-4 prose-table:overflow-x-auto prose-table:rounded-lg prose-table:border prose-table:border-border",
            "prose-thead:bg-muted",
            "prose-th:border-b-2 prose-th:border-border prose-th:px-3 prose-th:py-2.5 prose-th:text-left prose-th:font-semibold",
            "prose-td:border-b prose-td:border-border prose-td:px-3 prose-td:py-2.5",
            "prose-tr:hover:bg-muted",
            
            // 强调样式
            "prose-strong:font-bold prose-strong:text-foreground",
            "prose-em:italic",
            "prose-del:text-muted-foreground prose-del:line-through",
            
            // 分隔线
            "prose-hr:my-6 prose-hr:border-0 prose-hr:border-t-2 prose-hr:border-border",
            
            // 选中文本
            "selection:bg-primary/20 selection:text-foreground"
          )}
        >
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>

      {/* Suggestion Menu */}
      {showSuggestion && (
        <SuggestionMenu
          items={suggestionItems}
          onSelect={async (item) => {
            if (!editor || !suggestionRange) return
            const { from, to } = suggestionRange

            if (suggestionType === 'link') {
              editor.chain().focus().deleteRange({ from, to })
                .insertContent({ type: 'blockLink', attrs: { blockId: item.id, blockTitle: item.title } })
                .run()
              if (currentDocIdRef.current) {
                try { await blockStore.addLink(currentDocIdRef.current, item.id) }
                catch (error) { console.error('Failed to add link:', error) }
              }
            } else if (suggestionType === 'reference') {
              editor.chain().focus().deleteRange({ from, to })
                .insertContent({ type: 'blockReference', attrs: { blockId: item.id, blockContent: item.content } })
                .run()
            }
            setShowSuggestion(false)
          }}
          onClose={() => setShowSuggestion(false)}
          position={suggestionPosition}
        />
      )}
    </div>
  )
}
