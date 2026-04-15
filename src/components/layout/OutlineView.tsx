import { useState, useEffect } from 'react'
import { FilePenLine, List } from 'lucide-react'
import { documentStore } from '../../storage/documentStore'

interface OutlineItem {
  id: string
  level: number
  text: string
}

interface OutlineViewProps {
  documentId: string | null
}

export function OutlineView({ documentId }: OutlineViewProps) {
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [documentTitle, setDocumentTitle] = useState('')

  useEffect(() => {
    const loadOutline = async () => {
      if (!documentId) {
        setOutline([])
        setDocumentTitle('')
        return
      }

      try {
        const doc = await documentStore.getDocument(documentId)
        if (!doc) {
          setOutline([])
          setDocumentTitle('')
          return
        }

        setDocumentTitle(doc.title)

        // 从 TipTap JSON 中提取 heading 节点
        const items: OutlineItem[] = []
        const walk = (node: Record<string, unknown>, index: number) => {
          if (node.type === 'heading' && typeof node.attrs === 'object' && node.attrs) {
            const attrs = node.attrs as Record<string, unknown>
            const level = (attrs.level as number) || 1
            const text = extractText(node)
            if (text) {
              items.push({ id: `heading-${index}`, level, text })
            }
          }
          if (Array.isArray(node.content)) {
            node.content.forEach((child: Record<string, unknown>, i: number) => walk(child, i))
          }
        }

        // doc.content 是 TipTap JSON 字符串
        let content: Record<string, unknown> | null = null
        try {
          content = JSON.parse(doc.content) as Record<string, unknown>
        } catch {
          // 不是有效 JSON，跳过
        }
        if (content?.content && Array.isArray(content.content)) {
          content.content.forEach((node: Record<string, unknown>, i: number) => walk(node, i))
        }

        setOutline(items)
      } catch (error) {
        console.error('Failed to load outline:', error)
      }
    }

    loadOutline()

    // 每 2 秒刷新
    const interval = setInterval(loadOutline, 2000)
    return () => clearInterval(interval)
  }, [documentId])

  const extractText = (node: Record<string, unknown>): string => {
    if (node.type === 'text' && typeof node.text === 'string') return node.text
    if (Array.isArray(node.content)) {
      return node.content.map((c: Record<string, unknown>) => extractText(c)).join('')
    }
    return ''
  }

  const handleHeadingClick = (item: OutlineItem) => {
    // 通过自定义事件通知编辑器跳转
    window.dispatchEvent(new CustomEvent('navigateToHeading', { detail: { text: item.text, level: item.level } }))
  }

  if (!documentId) {
    return (
      <div className="flex-1 overflow-y-auto p-2">
        <div className="py-10 px-5 text-center">
          <div className="mb-3 opacity-50 text-muted-foreground flex justify-center"><FilePenLine size={32} /></div>
          <div className="text-sm text-muted-foreground mb-1">没有打开的文档</div>
          <div className="text-xs text-muted-foreground">打开文档后显示大纲</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {outline.length === 0 ? (
        <div className="py-10 px-5 text-center">
          <div className="mb-3 opacity-50 text-muted-foreground flex justify-center"><List size={32} /></div>
          <div className="text-sm text-muted-foreground mb-1">暂无标题</div>
          <div className="text-xs text-muted-foreground">使用标题（H1-H6）生成文档大纲</div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1 px-3 pb-2 overflow-hidden text-ellipsis whitespace-nowrap">{documentTitle}</div>
          {outline.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1.5 px-3 rounded cursor-pointer transition-colors mb-px hover:bg-muted"
              style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
              onClick={() => handleHeadingClick(item)}
              title={item.text}
            >
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1 py-0.5 rounded shrink-0 min-w-[24px] text-center font-mono">H{item.level}</span>
              <span className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1 ${item.level === 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
