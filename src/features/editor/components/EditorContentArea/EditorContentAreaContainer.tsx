import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { blockStore } from '@/storage/blockStore'
import { EditorContentAreaView } from './EditorContentAreaView'
import type { SuggestionItemViewModel } from '../types'

interface EditorContentAreaContainerProps {
  editor: Editor | null
  documentTitle?: string
  tags?: string[]
  className?: string
}

function isBlockOSDrag(event: DragEvent | React.DragEvent): boolean {
  return (
    event.dataTransfer?.types.includes('application/blockos-ai-content') ||
    event.dataTransfer?.types.includes('application/blockos-block')
  ) ?? false
}

export function EditorContentAreaContainer({
  editor,
  documentTitle = '欢迎使用 BlockOS',
  tags = ['教程', '入门'],
  className,
}: EditorContentAreaContainerProps) {
  const currentDocIdRef = useRef<string | null>(null)
  const updateTimeoutRef = useRef<number | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionItems] = useState<SuggestionItemViewModel[]>([])
  const [suggestionPosition] = useState({ top: 0, left: 0 })
  const [suggestionType] = useState<'link' | 'reference' | null>(null)
  const [suggestionRange] = useState<{ from: number; to: number } | null>(null)

  const handleDrop = useCallback((event: React.DragEvent) => {
    if (!editor || !isBlockOSDrag(event)) return
    event.preventDefault()
    event.stopPropagation()

    const aiContent = event.dataTransfer.getData('application/blockos-ai-content')
    const blockData = event.dataTransfer.getData('application/blockos-block')
    let insertData: Record<string, unknown> | null = null

    if (blockData) {
      try {
        const parsed = JSON.parse(blockData)
        const title = parsed.title || 'Block'
        const text = parsed.content || blockData
        insertData = {
          type: 'sourceBlock',
          attrs: { source: 'inspiration', sourceLabel: `灵感 · ${title}`, blockId: parsed.id || null },
          content: text.split('\n').filter((line: string) => line.trim()).map((line: string) => ({
            type: 'paragraph',
            content: [{ type: 'text', text: line }],
          })),
        }
      } catch {
        insertData = {
          type: 'sourceBlock',
          attrs: { source: 'inspiration', sourceLabel: '灵感' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: blockData }] }],
        }
      }
    } else if (aiContent) {
      const lines = aiContent.split('\n').filter((line: string) => line.trim())
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

    const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (pos) {
      editor.chain().focus().setTextSelection(pos.pos).insertContent(insertData).run()
    } else {
      editor.chain().focus().insertContent(insertData).run()
    }
  }, [editor])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (isBlockOSDrag(event)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [])

  const handleSuggestionSelect = async (item: SuggestionItemViewModel) => {
    if (!editor || !suggestionRange) return
    const { from, to } = suggestionRange

    if (suggestionType === 'link') {
      editor.chain().focus().deleteRange({ from, to })
        .insertContent({ type: 'blockLink', attrs: { blockId: item.id, blockTitle: item.title } })
        .run()
      if (currentDocIdRef.current) {
        try {
          await blockStore.addLink(currentDocIdRef.current, item.id)
        } catch (error) {
          console.error('Failed to add link:', error)
        }
      }
    } else if (suggestionType === 'reference') {
      editor.chain().focus().deleteRange({ from, to })
        .insertContent({ type: 'blockReference', attrs: { blockId: item.id, blockContent: item.content } })
        .run()
    }
    setShowSuggestion(false)
  }

  return (
    <EditorContentAreaView
      documentTitle={documentTitle}
      tags={tags}
      className={className}
      editorContent={editor ? <EditorContent editor={editor} /> : null}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      suggestion={{
        visible: showSuggestion,
        items: suggestionItems,
        position: suggestionPosition,
        onSelect: handleSuggestionSelect,
        onClose: () => setShowSuggestion(false),
      }}
    />
  )
}
