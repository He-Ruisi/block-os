import { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BlockLink, BlockReference, SourceBlock, searchBlocks } from '../../editor/extensions'
import { SuggestionMenu } from './SuggestionMenu'
import { documentStore } from '../../storage/documentStore'
import { blockStore } from '../../storage/blockStore'
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
  const currentDocIdRef = useRef<string | null>(null)
  const setCurrentDocId = (id: string) => { currentDocIdRef.current = id }
  const editorRef = useRef<HTMLDivElement>(null)
  const updateTimeoutRef = useRef<number | null>(null)
  const loadedDocumentIdRef = useRef<string | undefined>(undefined)

  const editor = useEditor({
    extensions: [StarterKit, BlockLink, BlockReference, SourceBlock],
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
      if (prevDocId) {
        try {
          await documentStore.updateDocumentBlocks(prevDocId, editor.getJSON())
        } catch { /* ignore */ }
      }

      loadedDocumentIdRef.current = documentId

      try {
        await documentStore.init()
        if (documentId) {
          const doc = await documentStore.getDocument(documentId)
          if (!doc) { editor.commands.setContent('<p></p>'); return }
          if (doc.content?.trim()) {
            try { editor.commands.setContent(JSON.parse(doc.content)) }
            catch { editor.commands.setContent('<p></p>') }
          } else {
            editor.commands.setContent('<p></p>')
          }
          setCurrentDocId(doc.id)
          documentStore.setCurrentDocument(doc.id)
        } else {
          const docs = await documentStore.getAllDocuments()
          let doc
          if (docs.length === 0) {
            doc = await documentStore.createDocument('我的第一篇文档')
            editor.commands.setContent('<h1>我的第一篇文档</h1><p>开始写作...</p>')
          } else {
            doc = docs[0]
            if (doc.content?.trim()) {
              try { editor.commands.setContent(JSON.parse(doc.content)) }
              catch { /* keep */ }
            }
          }
          setCurrentDocId(doc.id)
          documentStore.setCurrentDocument(doc.id)
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
      {/* Toolbar — 对标 minimal-tiptap 风格 */}
      <div className="editor-toolbar">
        {/* 段落/标题组 */}
        <div className="toolbar-group">
          <button className={`toolbar-btn ${!editor?.isActive('heading') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().setParagraph().run()} title="正文">¶</button>
          <button className={`toolbar-btn ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="标题 1">H1</button>
          <button className={`toolbar-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="标题 2">H2</button>
          <button className={`toolbar-btn ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="标题 3">H3</button>
        </div>

        <div className="toolbar-sep" />

        {/* 文字格式组 */}
        <div className="toolbar-group">
          <button className={`toolbar-btn ${editor?.isActive('bold') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()} title="粗体 ⌘B">
            <strong>B</strong>
          </button>
          <button className={`toolbar-btn ${editor?.isActive('italic') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()} title="斜体 ⌘I">
            <em>I</em>
          </button>
          <button className={`toolbar-btn ${editor?.isActive('strike') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleStrike().run()} title="删除线">
            <s>S</s>
          </button>
          <button className={`toolbar-btn ${editor?.isActive('code') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleCode().run()} title="行内代码 ⌘E">
            {'</>'}
          </button>
        </div>

        <div className="toolbar-sep" />

        {/* 列表组 */}
        <div className="toolbar-group">
          <button className={`toolbar-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()} title="无序列表">•</button>
          <button className={`toolbar-btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="有序列表">1.</button>
        </div>

        <div className="toolbar-sep" />

        {/* 块级元素组 */}
        <div className="toolbar-group">
          <button className={`toolbar-btn ${editor?.isActive('codeBlock') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="代码块">{'{ }'}</button>
          <button className={`toolbar-btn ${editor?.isActive('blockquote') ? 'active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="引用">"</button>
          <button className="toolbar-btn"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="分隔线">—</button>
        </div>

        <div className="toolbar-spacer" />
        <span className="toolbar-hint">⌘⇧A 发送选区给 AI</span>
      </div>

      {/* 编辑区域 */}
      <div className="editor-scroll" onDrop={handleDrop} onDragOver={handleDragOver}>
        <EditorContent editor={editor} />
      </div>

      {/* BubbleMenu — 选中文字时的悬浮菜单 */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <div className="bubble-menu">
            <button className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
            <button className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
            <button className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
            <button className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleCode().run()}>{'<>'}</button>
            <div className="toolbar-sep" />
            <button className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</button>
          </div>
        </BubbleMenu>
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
