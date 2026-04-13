import { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  BlockLink, BlockReference, SourceBlock, searchBlocks,
  createInlineAIPlugin,
  startInlineAIReplace, updateInlineAIContent,
  confirmInlineAIReplace, discardInlineAIReplace,
  cancelActiveInlineAI, hasActiveInlineAI,
} from '../../editor/extensions'
import { SuggestionMenu } from './SuggestionMenu'
import { documentStore } from '../../storage/documentStore'
import { blockStore } from '../../storage/blockStore'
import { sendInlineAIRequest } from '../../services/aiService'
import { captureSelectionAsBlock } from '../../services/blockCaptureService'
import { generateUUID } from '../../utils/uuid'
import './Editor.css'

interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
  documentId?: string
}

interface SuggestionItem {
  id: string
  title: string
  content: string
}

type AIToolbarMode = 'continue' | 'rewrite' | 'shorten' | 'expand' | 'translate' | 'explain' | 'capture'

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''

/** 判断拖拽事件是否来自 BlockOS（AI 回复或 Block 空间） */
function isBlockOSDrag(e: DragEvent | React.DragEvent): boolean {
  return (
    e.dataTransfer?.types.includes('application/blockos-ai-content') ||
    e.dataTransfer?.types.includes('application/blockos-block')
  ) ?? false
}

export function Editor({ onEditorReady, onTextSelected, documentId }: EditorProps) {
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([])
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [suggestionType, setSuggestionType] = useState<'link' | 'reference' | null>(null)
  const [suggestionRange, setSuggestionRange] = useState<{ from: number; to: number } | null>(null)
  // AI toolbar state
  const [aiLoading, setAiLoading] = useState<AIToolbarMode | null>(null)
  const [annotationPreview, setAnnotationPreview] = useState<{ text: string; mode: 'explain' | 'translate' } | null>(null)
  const currentDocIdRef = useRef<string | null>(null)
  const setCurrentDocId = (id: string) => { currentDocIdRef.current = id }
  const editorRef = useRef<HTMLDivElement>(null)
  const updateTimeoutRef = useRef<number | null>(null)
  const loadedDocumentIdRef = useRef<string | undefined>(undefined)
  // Inline AI plugin instance (stable ref)
  const inlineAIPluginRef = useRef(createInlineAIPlugin())

  const editor = useEditor({
    extensions: [StarterKit, BlockLink, BlockReference, SourceBlock, inlineAIPluginRef.current],
    content: `
      <h1>欢迎使用 BlockOS</h1>
      <p>这是一个写作优先的知识操作系统。</p>
      <h2>开始写作</h2>
      <p>支持 Markdown 语法：</p>
      <ul>
        <li>使用 # 创建标题</li>
        <li>使用 ** 加粗文字</li>
        <li>使用 * 创建斜体</li>
      </ul>
      <h2>Block 系统</h2>
      <p>使用 <code>[[</code> 创建双向链接，使用 <code>((</code> 引用其他 Block。</p>
      <p>现在就开始写作吧...</p>
      <h2>选中文字发送给 AI</h2>
      <p>选中任意文字，然后按 Cmd/Ctrl + Shift + A 发送给 AI，或者右键选择"发送给 AI"。</p>
    `,
    editorProps: {
      attributes: { class: 'editor-content' },
      // 拦截 ProseMirror 的 drop，阻止它用 text/plain 插入（导致重复）
      handleDrop: (_view, event) => {
        if (isBlockOSDrag(event as DragEvent)) {
          // 返回 true = 告诉 ProseMirror "我已处理，别再插入了"
          // 实际插入由外层 React onDrop 完成
          return true
        }
        return false
      },
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection
      if (from !== to) {
        const selectedText = ed.state.doc.textBetween(from, to, '\n')
        if (selectedText.trim() && onTextSelected) onTextSelected(selectedText)
      }
    },
    onUpdate: ({ editor: ed }) => {
      const { $from } = ed.state.selection
      const textBefore = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 20), $from.parentOffset, null, '\ufffc'
      )

      const linkMatch = textBefore.match(/\[\[([^\]]*)$/)
      if (linkMatch) {
        const query = linkMatch[1]
        setSuggestionType('link')
        setSuggestionRange({ from: $from.pos - query.length - 2, to: $from.pos })
        handleSearch(query)
        updateSuggestionPosition(ed)
        return
      }

      const refMatch = textBefore.match(/\(\(([^)]*)$/)
      if (refMatch) {
        const query = refMatch[1]
        setSuggestionType('reference')
        setSuggestionRange({ from: $from.pos - query.length - 2, to: $from.pos })
        handleSearch(query)
        updateSuggestionPosition(ed)
        return
      }

      setShowSuggestion(false)
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => handleDocumentUpdate(ed), 500)
    },
  })

  // ---- 拖拽处理（React 层，在 ProseMirror 之上） ----

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!editor || !isBlockOSDrag(e)) return
    e.preventDefault()
    e.stopPropagation()

    const aiContent = e.dataTransfer.getData('application/blockos-ai-content')
    const blockData = e.dataTransfer.getData('application/blockos-block')

    let insertData: Record<string, unknown> | null = null

    if (blockData) {
      // Block 空间拖入 → 灵感块
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
      // AI 回复拖入 → AI 块
      const lines = aiContent.split('\n').filter((l: string) => l.trim())
      insertData = {
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: '◆ AI 生成' },
        content: lines.map((line: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        })),
      }
    }

    if (!insertData) return

    // 将光标移到拖拽位置
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

  // ---- Inline AI Decoration 事件处理 ----
  // 监听 Decoration widget 内的 confirm/discard 自定义事件
  useEffect(() => {
    if (!editor) return
    const el = editor.view.dom
    const onConfirm = () => confirmInlineAIReplace(editor.view)
    const onDiscard = () => discardInlineAIReplace(editor.view)
    el.addEventListener('inlineAIConfirm', onConfirm)
    el.addEventListener('inlineAIDiscard', onDiscard)
    return () => {
      el.removeEventListener('inlineAIConfirm', onConfirm)
      el.removeEventListener('inlineAIDiscard', onDiscard)
    }
  }, [editor])

  // ---- AI 工具栏操作 ----

  /** 获取选中文字及其前后上下文 */
  const getSelectionContext = useCallback((): { text: string; context: string; from: number; to: number } | null => {
    if (!editor) return null
    const { from, to } = editor.state.selection
    if (from === to) return null
    const text = editor.state.doc.textBetween(from, to, '\n')
    if (!text.trim()) return null
    // 取前后各 200 字符作为上下文
    const docText = editor.state.doc.textContent
    const contextStart = Math.max(0, from - 200)
    const contextEnd = Math.min(docText.length, to + 200)
    const context = docText.slice(contextStart, contextEnd)
    return { text, context, from, to }
  }, [editor])

  /** 打开 AI 对话浮层 */
  const handleOpenAIChat = useCallback(() => {
    const sel = getSelectionContext()
    if (!sel) return
    // 计算选区在屏幕上的位置
    const domSelection = window.getSelection()
    let position = { top: 200, left: 300 }
    if (domSelection && domSelection.rangeCount > 0) {
      const rect = domSelection.getRangeAt(0).getBoundingClientRect()
      position = { top: rect.top, left: rect.left }
    }
    window.dispatchEvent(new CustomEvent('openAIChat', {
      detail: { contextText: sel.text, position },
    }))
  }, [getSelectionContext])

  /** 续写：在选中段落后插入 pending SourceBlock */
  const handleContinue = useCallback(async () => {
    if (!editor || !MIMO_API_KEY) return
    const sel = getSelectionContext()
    if (!sel) return

    // 取消已有操作
    cancelActiveInlineAI(editor.view)
    setAiLoading('continue')

    const abortController = new AbortController()

    try {
      // 先插入一个 pending SourceBlock（空内容占位）
      const insertPos = sel.to
      editor.chain().focus().setTextSelection(insertPos).insertContent({
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: '✦ AI 续写（待确认）', pending: true },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '...' }] }],
      }).run()

      // 找到刚插入的 pending SourceBlock 位置
      let pendingPos = -1
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'sourceBlock' && node.attrs.pending === true) {
          pendingPos = pos
        }
      })

      await sendInlineAIRequest({
        mode: 'continue',
        selectedText: sel.text,
        context: sel.context,
        apiKey: MIMO_API_KEY,
        signal: abortController.signal,
        onToken: (content) => {
          // 实时更新 pending SourceBlock 内容
          if (pendingPos >= 0) {
            editor.chain().command(({ tr }) => {
              const node = editor.state.doc.nodeAt(pendingPos)
              if (!node || node.type.name !== 'sourceBlock') return false
              const lines = content.split('\n').filter(l => l.trim())
              const paragraphs = lines.length > 0
                ? lines.map(line => editor.state.schema.nodes.paragraph.create(
                    null, editor.state.schema.text(line)
                  ))
                : [editor.state.schema.nodes.paragraph.create()]
              const newNode = node.type.create(node.attrs, paragraphs)
              tr.replaceWith(pendingPos, pendingPos + node.nodeSize, newNode)
              return true
            }).run()
          }
        },
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[InlineAI] continue failed:', err)
      }
    } finally {
      setAiLoading(null)
    }
  }, [editor, getSelectionContext])

  /** 改写/缩写/扩写/翻译：AIReplaceDecoration */
  const handleReplace = useCallback(async (mode: 'rewrite' | 'shorten' | 'expand' | 'translate') => {
    if (!editor || !MIMO_API_KEY) return
    const sel = getSelectionContext()
    if (!sel) return

    // 取消已有操作
    cancelActiveInlineAI(editor.view)
    setAiLoading(mode)

    const abortController = new AbortController()
    startInlineAIReplace(editor.view, sel.from, sel.to, mode, abortController)

    try {
      await sendInlineAIRequest({
        mode,
        selectedText: sel.text,
        context: sel.context,
        apiKey: MIMO_API_KEY,
        signal: abortController.signal,
        onToken: (content) => {
          updateInlineAIContent(editor.view, content)
        },
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error(`[InlineAI] ${mode} failed:`, err)
        discardInlineAIReplace(editor.view)
      }
    } finally {
      setAiLoading(null)
    }
  }, [editor, getSelectionContext])

  /** 解释：写入 annotations.explanation，显示行内预览 */
  const handleExplain = useCallback(async () => {
    if (!editor || !MIMO_API_KEY) return
    const sel = getSelectionContext()
    if (!sel) return

    setAiLoading('explain')
    setAnnotationPreview(null)

    let finalContent = ''
    try {
      await sendInlineAIRequest({
        mode: 'explain',
        selectedText: sel.text,
        apiKey: MIMO_API_KEY,
        onToken: (content) => {
          finalContent = content
          setAnnotationPreview({ text: content, mode: 'explain' })
        },
      })

      // 写入 Block 附属层（如果选中文字在 SourceBlock 内，找到对应 blockId）
      let blockId: string | null = null
      editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
        if (node.type.name === 'sourceBlock' && node.attrs.blockId) {
          blockId = node.attrs.blockId
        }
      })

      if (blockId) {
        await blockStore.addAnnotation(blockId, {
          id: generateUUID(),
          type: 'explanation',
          content: finalContent,
          source: 'ai',
          createdAt: new Date(),
          anchor: { text: sel.text },
        })
      }
    } catch (err) {
      console.error('[InlineAI] explain failed:', err)
    } finally {
      setAiLoading(null)
    }
  }, [editor, getSelectionContext])

  /** 翻译：写入 annotations.translation，显示行内预览 */
  const handleTranslate = useCallback(async () => {
    if (!editor || !MIMO_API_KEY) return
    const sel = getSelectionContext()
    if (!sel) return

    setAiLoading('translate')
    setAnnotationPreview(null)

    let finalContent = ''
    try {
      await sendInlineAIRequest({
        mode: 'translate',
        selectedText: sel.text,
        apiKey: MIMO_API_KEY,
        onToken: (content) => {
          finalContent = content
          setAnnotationPreview({ text: content, mode: 'translate' })
        },
      })

      // 写入 Block 附属层
      let blockId: string | null = null
      editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
        if (node.type.name === 'sourceBlock' && node.attrs.blockId) {
          blockId = node.attrs.blockId
        }
      })

      if (blockId) {
        await blockStore.addAnnotation(blockId, {
          id: generateUUID(),
          type: 'translation',
          content: finalContent,
          source: 'ai',
          createdAt: new Date(),
          anchor: { text: sel.text },
        })
      }
    } catch (err) {
      console.error('[InlineAI] translate failed:', err)
    } finally {
      setAiLoading(null)
    }
  }, [editor, getSelectionContext])

  /** 存为块：捕获选中文字为显式 Block */
  const handleCapture = useCallback(async () => {
    if (!editor) return
    const sel = getSelectionContext()
    if (!sel) return

    // 检查是否在 SourceBlock 内，继承 source
    let inheritedSource: { type: 'editor' | 'ai' | 'import'; aiMessageId?: string } | undefined
    editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
      if (node.type.name === 'sourceBlock') {
        inheritedSource = { type: node.attrs.source === 'ai' ? 'ai' : 'editor' }
      }
    })

    await captureSelectionAsBlock(sel.text, inheritedSource)
  }, [editor, getSelectionContext])

  // ---- 搜索 / 建议 ----

  const handleSearch = async (query: string) => {
    try {
      const results = await searchBlocks(query)
      setSuggestionItems(results)
      setShowSuggestion(results.length > 0)
    } catch (error) {
      console.error('Search failed:', error)
      setShowSuggestion(false)
    }
  }

  const updateSuggestionPosition = (ed: TiptapEditor) => {
    const coords = ed.view.coordsAtPos(ed.state.selection.$from.pos)
    setSuggestionPosition({ top: coords.bottom + 5, left: coords.left })
  }

  const handleDocumentUpdate = async (ed: TiptapEditor) => {
    const docId = currentDocIdRef.current
    if (!docId) return
    try {
      await documentStore.updateDocumentBlocks(docId, ed.getJSON())
    } catch (error) {
      console.error('Failed to update document blocks:', error)
    }
  }

  const handleSelectSuggestion = async (item: SuggestionItem) => {
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
  }

  // ---- 文档加载 ----

  useEffect(() => {
    const loadDocument = async () => {
      if (!editor) return
      if (loadedDocumentIdRef.current === documentId) return

      // 切换文档前，先保存当前文档
      const prevDocId = currentDocIdRef.current
      if (prevDocId && prevDocId !== documentId) {
        try {
          await documentStore.updateDocumentBlocks(prevDocId, editor.getJSON())
        } catch { /* ignore */ }
      }

      loadedDocumentIdRef.current = documentId

      try {
        await documentStore.init()
        if (documentId) {
          const doc = await documentStore.getDocument(documentId)
          if (!doc) { 
            editor.commands.setContent('<p>文档不存在</p>')
            setCurrentDocId('')
            return 
          }
          if (doc.content?.trim()) {
            try { editor.commands.setContent(JSON.parse(doc.content)) }
            catch { editor.commands.setContent('<p></p>') }
          } else {
            editor.commands.setContent('<p></p>')
          }
          setCurrentDocId(doc.id)
          documentStore.setCurrentDocument(doc.id)
        } else {
          // 没有 documentId 时，显示欢迎页面，不自动加载任何文档
          editor.commands.setContent(`
            <h1>欢迎使用 BlockOS</h1>
            <p>这是一个写作优先的知识操作系统。</p>
            <h2>开始写作</h2>
            <p>支持 Markdown 语法：</p>
            <ul>
              <li>使用 # 创建标题</li>
              <li>使用 ** 加粗文字</li>
              <li>使用 * 创建斜体</li>
            </ul>
            <h2>Block 系统</h2>
            <p>使用 <code>[[</code> 创建双向链接，使用 <code>((</code> 引用其他 Block。</p>
            <p>现在就开始写作吧...</p>
          `)
          setCurrentDocId('')
          documentStore.setCurrentDocument('')
        }
      } catch (error) {
        console.error('[Editor] Failed to load document:', error)
      }
    }
    loadDocument()
  }, [editor, documentId])

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor)
  }, [editor, onEditorReady])

  // 快捷键
  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        const { from, to } = editor.state.selection
        if (from !== to) {
          const text = editor.state.doc.textBetween(from, to, '\n')
          if (text.trim() && onTextSelected) {
            onTextSelected(text)
            window.dispatchEvent(new CustomEvent('sendToAI', { detail: text }))
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, onTextSelected])

  useEffect(() => {
    const handler = (e: Event) => {
      window.dispatchEvent(new CustomEvent('showBlockInSpace', { detail: (e as CustomEvent<string>).detail }))
    }
    window.addEventListener('navigateToBlock', handler)
    return () => window.removeEventListener('navigateToBlock', handler)
  }, [])

  // 监听从 Block 详情面板插入 release 的事件
  useEffect(() => {
    if (!editor) return
    const handler = (e: Event) => {
      const { content, title, releaseVersion } = (e as CustomEvent).detail
      if (!content) return
      const lines = content.split('\n').filter((l: string) => l.trim())
      editor.chain().focus().insertContent({
        type: 'sourceBlock',
        attrs: {
          source: 'inspiration',
          sourceLabel: `📦 v${releaseVersion} · ${title}`,
          blockId: (e as CustomEvent).detail.blockId || null,
          releaseVersion: releaseVersion,
        },
        content: lines.map((line: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        })),
      }).run()
    }
    window.addEventListener('insertBlockRelease', handler)
    return () => window.removeEventListener('insertBlockRelease', handler)
  }, [editor])

  useEffect(() => {
    return () => { if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current) }
  }, [])

  // 页面关闭/刷新前立即保存
  useEffect(() => {
    if (!editor) return
    const handleBeforeUnload = () => {
      const docId = currentDocIdRef.current
      if (!docId) return
      try {
        const json = editor.getJSON()
        // 用同步方式尽力保存（beforeunload 中异步不可靠）
        documentStore.updateDocumentBlocks(docId, json).catch(() => {})
      } catch { /* ignore */ }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editor])

  return (
    <div className="editor-container" ref={editorRef}>
      {/* Toolbar — 两行布局，对标 reactjs-tiptap-editor 风格 */}
      <div className="editor-toolbar">
        {/* 第一行：撤销/重做 | 清除 | 标题 | 文字格式 | 列表 */}
        <div className="toolbar-row">
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()} title="撤销 ⌘Z">↩</button>
            <button className="toolbar-btn" onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()} title="重做 ⌘⇧Z">↪</button>
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => editor?.chain().focus().unsetAllMarks().run()}
              title="清除格式">✕</button>
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-group">
            <button className={`toolbar-btn toolbar-btn-wide ${!editor?.isActive('heading') && !editor?.isActive('codeBlock') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().setParagraph().run()} title="正文">正文</button>
            <button className={`toolbar-btn toolbar-btn-wide ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="标题 1">标题 1</button>
            <button className={`toolbar-btn toolbar-btn-wide ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="标题 2">标题 2</button>
            <button className={`toolbar-btn toolbar-btn-wide ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="标题 3">标题 3</button>
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-group">
            <button className={`toolbar-btn ${editor?.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBold().run()} title="粗体 ⌘B"><strong>B</strong></button>
            <button className={`toolbar-btn ${editor?.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleItalic().run()} title="斜体 ⌘I"><em>I</em></button>
            <button className={`toolbar-btn toolbar-btn-underline ${editor?.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleStrike().run()} title="删除线"><s>S</s></button>
            <button className={`toolbar-btn ${editor?.isActive('code') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleCode().run()} title="行内代码 ⌘E">{'</>'}</button>
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-group">
            <button className={`toolbar-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBulletList().run()} title="无序列表">☰</button>
            <button className={`toolbar-btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="有序列表">☷</button>
          </div>
        </div>
        {/* 第二行：引用 | 分隔线 | 代码块 | 快捷键提示 */}
        <div className="toolbar-row">
          <div className="toolbar-group">
            <button className={`toolbar-btn ${editor?.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="引用">❝</button>
            <button className="toolbar-btn"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="分隔线">―</button>
            <button className={`toolbar-btn ${editor?.isActive('codeBlock') ? 'active' : ''}`}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="代码块">{'{ }'}</button>
          </div>
          <div className="toolbar-spacer" />
          <span className="toolbar-hint">⌘⇧A 发送选区给 AI</span>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="editor-scroll" onDrop={handleDrop} onDragOver={handleDragOver}>
        <EditorContent editor={editor} />
      </div>

      {/* BubbleMenu — AI 操作工具栏 */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top-start' }}
          shouldShow={({ editor: ed, state }) => {
            const { from, to } = state.selection
            // 有文字选中 且 没有活跃的 replace 操作时显示
            return from !== to && !hasActiveInlineAI(state) && !ed.isActive('sourceBlock', { pending: true })
          }}
        >
          <div className="bubble-menu bubble-menu--ai">
            {/* 格式组 */}
            <button className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()} title="粗体"><strong>B</strong></button>
            <button className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()} title="斜体"><em>I</em></button>
            <div className="toolbar-sep" />
            {/* AI 对话入口 */}
            <button
              className="toolbar-btn toolbar-btn--ai-chat"
              onClick={handleOpenAIChat}
              title="AI 对话">
              ✦ AI
            </button>
            <div className="toolbar-sep" />
            {/* AI 操作组 */}
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'continue' ? ' ai-btn--loading' : ''}`}
              onClick={handleContinue}
              disabled={aiLoading !== null}
              title="续写：在选中段落下方插入 AI 续写内容">
              {aiLoading === 'continue' ? '...' : '续写'}
            </button>
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'rewrite' ? ' ai-btn--loading' : ''}`}
              onClick={() => handleReplace('rewrite')}
              disabled={aiLoading !== null}
              title="改写：替换选中内容">
              {aiLoading === 'rewrite' ? '...' : '改写'}
            </button>
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'shorten' ? ' ai-btn--loading' : ''}`}
              onClick={() => handleReplace('shorten')}
              disabled={aiLoading !== null}
              title="缩写">
              {aiLoading === 'shorten' ? '...' : '缩写'}
            </button>
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'expand' ? ' ai-btn--loading' : ''}`}
              onClick={() => handleReplace('expand')}
              disabled={aiLoading !== null}
              title="扩写">
              {aiLoading === 'expand' ? '...' : '扩写'}
            </button>
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'translate' ? ' ai-btn--loading' : ''}`}
              onClick={handleTranslate}
              disabled={aiLoading !== null}
              title="翻译：写入附属层，不替换原文">
              {aiLoading === 'translate' ? '...' : '翻译'}
            </button>
            <button
              className={`toolbar-btn toolbar-btn-wide${aiLoading === 'explain' ? ' ai-btn--loading' : ''}`}
              onClick={handleExplain}
              disabled={aiLoading !== null}
              title="解释：写入附属层批注">
              {aiLoading === 'explain' ? '...' : '解释'}
            </button>
            <div className="toolbar-sep" />
            <button
              className="toolbar-btn toolbar-btn-wide"
              onClick={handleCapture}
              disabled={aiLoading !== null}
              title="存为块">
              捕获
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* 翻译/解释 行内预览 */}
      {annotationPreview && (
        <div className="annotation-preview">
          <span className="annotation-preview-label">
            {annotationPreview.mode === 'explain' ? '💡 解释' : '🌐 翻译'}
          </span>
          <span className="annotation-preview-text">{annotationPreview.text}</span>
          <button
            className="annotation-preview-close"
            onClick={() => setAnnotationPreview(null)}
            title="关闭">✕</button>
        </div>
      )}

      {showSuggestion && (
        <SuggestionMenu
          items={suggestionItems}
          onSelect={handleSelectSuggestion}
          onClose={() => setShowSuggestion(false)}
          position={suggestionPosition}
        />
      )}
    </div>
  )
}
