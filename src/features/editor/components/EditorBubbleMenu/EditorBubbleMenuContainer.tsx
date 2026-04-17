import { useState } from 'react'
import { BubbleMenu, type Editor } from '@tiptap/react'
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  Languages,
  Lightbulb,
  Maximize2,
  Minimize2,
  PenLine,
  Sparkles,
} from 'lucide-react'
import {
  hasActiveInlineAI,
  cancelActiveInlineAI,
  startInlineAIReplace,
  updateInlineAIContent,
  discardInlineAIReplace,
} from '../../extensions'
import { sendInlineAIRequest } from '@/features/ai/services/aiService'
import { captureSelectionAsBlock } from '@/features/blocks/services/blockCaptureService'
import { blockStore } from '@/storage/blockStore'
import { generateUUID } from '@/utils/uuid'
import { EditorBubbleMenuView } from './EditorBubbleMenuView'
import type { AIActionViewModel, AIToolbarMode, ToolbarButtonViewModel } from '../types'

interface EditorBubbleMenuContainerProps {
  editor: Editor
  apiKey: string
  aiLoading: AIToolbarMode | null
  setAiLoading: (mode: AIToolbarMode | null) => void
  setAnnotationPreview: (preview: { text: string; mode: 'explain' | 'translate' } | null) => void
}

const AI_ACTIONS: AIActionViewModel[] = [
  { mode: 'continue', icon: ArrowRight, label: '续写', title: '在选中段落下方插入 AI 续写内容' },
  { mode: 'rewrite', icon: PenLine, label: '改写', title: '替换选中内容' },
  { mode: 'shorten', icon: Minimize2, label: '缩写', title: '缩短选中内容' },
  { mode: 'expand', icon: Maximize2, label: '扩写', title: '扩展选中内容' },
  { mode: 'translate', icon: Languages, label: '翻译', title: '翻译选中内容' },
  { mode: 'explain', icon: Lightbulb, label: '解释', title: '解释选中内容' },
]

export function EditorBubbleMenuContainer({
  editor,
  apiKey,
  aiLoading,
  setAiLoading,
  setAnnotationPreview,
}: EditorBubbleMenuContainerProps) {
  const [customPrompt, setCustomPrompt] = useState('')

  const getSelectionContext = (): { text: string; context: string; from: number; to: number } | null => {
    const { from, to } = editor.state.selection
    if (from === to) return null
    const text = editor.state.doc.textBetween(from, to, '\n')
    if (!text.trim()) return null
    const docText = editor.state.doc.textContent
    const context = docText.slice(Math.max(0, from - 200), Math.min(docText.length, to + 200))
    return { text, context, from, to }
  }

  const handleOpenAIChat = () => {
    const selection = getSelectionContext()
    if (!selection) return
    const domSelection = window.getSelection()
    let position = { top: 200, left: 300 }
    if (domSelection && domSelection.rangeCount > 0) {
      const rect = domSelection.getRangeAt(0).getBoundingClientRect()
      position = { top: rect.top, left: rect.left }
    }
    window.dispatchEvent(new CustomEvent('openAIChat', {
      detail: { contextText: selection.text, position },
    }))
  }

  const handleContinue = async () => {
    if (!apiKey) return
    const selection = getSelectionContext()
    if (!selection) return

    cancelActiveInlineAI(editor.view)
    setAiLoading('continue')
    const abortController = new AbortController()

    try {
      const insertPos = selection.to
      editor.chain().focus().setTextSelection(insertPos).insertContent({
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: 'AI 续写（待确认）', pending: true },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '...' }] }],
      }).run()

      let pendingPos = -1
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'sourceBlock' && node.attrs.pending === true) pendingPos = pos
      })

      await sendInlineAIRequest({
        mode: 'continue',
        selectedText: selection.text,
        context: selection.context,
        apiKey,
        signal: abortController.signal,
        onToken: (content) => {
          if (pendingPos < 0) return
          editor.chain().command(({ tr }) => {
            const node = editor.state.doc.nodeAt(pendingPos)
            if (!node || node.type.name !== 'sourceBlock') return false
            const lines = content.split('\n').filter((line) => line.trim())
            const paragraphs = lines.length > 0
              ? lines.map((line) => editor.state.schema.nodes.paragraph.create(null, editor.state.schema.text(line)))
              : [editor.state.schema.nodes.paragraph.create()]
            const newNode = node.type.create(node.attrs, paragraphs)
            tr.replaceWith(pendingPos, pendingPos + node.nodeSize, newNode)
            return true
          }).run()
        },
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[InlineAI] continue failed:', error)
      }
    } finally {
      setAiLoading(null)
    }
  }

  const handleReplace = async (mode: 'rewrite' | 'shorten' | 'expand' | 'translate') => {
    if (!apiKey) return
    const selection = getSelectionContext()
    if (!selection) return

    cancelActiveInlineAI(editor.view)
    setAiLoading(mode)
    const abortController = new AbortController()
    startInlineAIReplace(editor.view, selection.from, selection.to, mode, abortController)

    try {
      await sendInlineAIRequest({
        mode,
        selectedText: selection.text,
        context: selection.context,
        apiKey,
        signal: abortController.signal,
        onToken: (content) => updateInlineAIContent(editor.view, content),
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(`[InlineAI] ${mode} failed:`, error)
        discardInlineAIReplace(editor.view)
      }
    } finally {
      setAiLoading(null)
    }
  }

  const handleAnnotation = async (mode: 'explain' | 'translate') => {
    if (!apiKey) return
    const selection = getSelectionContext()
    if (!selection) return

    setAiLoading(mode)
    setAnnotationPreview(null)
    let finalContent = ''
    try {
      await sendInlineAIRequest({
        mode,
        selectedText: selection.text,
        apiKey,
        onToken: (content) => {
          finalContent = content
          setAnnotationPreview({ text: content, mode })
          window.dispatchEvent(new CustomEvent('editorAnnotationPreview', {
            detail: { text: content, mode },
          }))
        },
      })

      let blockId: string | null = null
      editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
        if (node.type.name === 'sourceBlock' && node.attrs.blockId) blockId = node.attrs.blockId
      })

      if (blockId) {
        await blockStore.addAnnotation(blockId, {
          id: generateUUID(),
          type: mode === 'explain' ? 'explanation' : 'translation',
          content: finalContent,
          source: 'ai',
          createdAt: new Date(),
          anchor: { text: selection.text },
        })
      }
    } catch (error) {
      console.error(`[InlineAI] ${mode} failed:`, error)
    } finally {
      setAiLoading(null)
    }
  }

  const handleCapture = async () => {
    const selection = getSelectionContext()
    if (!selection) return
    let inheritedSource: { type: 'editor' | 'ai' | 'import'; aiMessageId?: string } | undefined
    editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
      if (node.type.name === 'sourceBlock') {
        inheritedSource = { type: node.attrs.source === 'ai' ? 'ai' : 'editor' }
      }
    })
    await captureSelectionAsBlock(selection.text, inheritedSource)
  }

  const handleAIAction = (mode: AIToolbarMode) => {
    switch (mode) {
      case 'continue':
        void handleContinue()
        break
      case 'rewrite':
      case 'shorten':
      case 'expand':
      case 'translate':
        void handleReplace(mode)
        break
      case 'explain':
        void handleAnnotation('explain')
        break
      case 'capture':
        void handleCapture()
        break
    }
  }

  const paragraphButtons: ToolbarButtonViewModel[] = [
    { id: 'paragraph', label: '正文', title: '正文', onClick: () => editor.chain().focus().setParagraph().run() },
    { id: 'h1', label: 'H1', title: '一级标题', active: editor.isActive('heading', { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: 'h2', label: 'H2', title: '二级标题', active: editor.isActive('heading', { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: 'h3', label: 'H3', title: '三级标题', active: editor.isActive('heading', { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  ]

  const formatButtons: ToolbarButtonViewModel[] = [
    { id: 'bold', label: 'B', title: '粗体', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run(), className: 'font-bold' },
    { id: 'italic', label: 'I', title: '斜体', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run(), className: 'italic' },
    { id: 'underline', label: 'U', title: '下划线', active: editor.isActive('underline'), onClick: () => editor.chain().focus().toggleUnderline().run(), className: 'underline' },
    { id: 'strike', label: 'S', title: '删除线', active: editor.isActive('strike'), onClick: () => editor.chain().focus().toggleStrike().run(), className: 'line-through' },
  ]

  const listButtons: ToolbarButtonViewModel[] = [
    { id: 'ai-chat', icon: Sparkles, title: 'AI 对话', onClick: handleOpenAIChat },
    { id: 'bookmark', icon: Bookmark, title: '捕获为块', onClick: () => void handleCapture() },
    { id: 'menu', icon: ChevronDown, title: 'AI 功能', onClick: () => undefined },
  ]

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top-start' }}
      shouldShow={({ editor: activeEditor, state }) => {
        const { from, to } = state.selection
        return from !== to && !hasActiveInlineAI(state) && !activeEditor.isActive('sourceBlock', { pending: true })
      }}
    >
      <EditorBubbleMenuView
        aiLoading={aiLoading}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
        onCustomPromptSubmit={() => setCustomPrompt('')}
        paragraphButtons={paragraphButtons}
        formatButtons={formatButtons}
        listButtons={listButtons}
        aiActions={AI_ACTIONS}
        onOpenAIChat={handleOpenAIChat}
        onAIAction={handleAIAction}
        onCapture={() => void handleCapture()}
      />
    </BubbleMenu>
  )
}
