import { useState, useEffect } from 'react'
import { documentStore } from '@/storage/documentStore'

export interface OutlineItem {
  id: string
  level: number
  text: string
}

export function useOutline(documentId: string | null) {
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

  return {
    outline,
    documentTitle,
  }
}
