import { useEffect, useState, useRef, useCallback } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { SuggestionMenu } from './SuggestionMenu'
import { documentStore } from '@/storage/documentStore'
import { blockStore } from '@/storage/blockStore'
import { recordBlockUsage } from '@/features/blocks/services/blockReleaseService'
import '@/styles/modules/editor.css'
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import {
  BlockLink, BlockReference, SourceBlock, searchBlocks,
  createInlineAIPlugin,
  confirmInlineAIReplace, discardInlineAIReplace,
} from '../extensions'

import { EditorBubbleMenu } from './EditorBubbleMenu'
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

/** 鍒ゆ柇鎷栨嫿浜嬩欢鏄惁鏉ヨ嚜 BlockOS锛圓I 鍥炲鎴?Block 绌洪棿锛?*/
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
    extensions: [StarterKit, Underline, BlockLink, BlockReference, SourceBlock, inlineAIPluginRef.current],
    content: `
      <h1>娆㈣繋浣跨敤 BlockOS</h1>
      <p>杩欐槸涓€涓啓浣滀紭鍏堢殑鐭ヨ瘑鎿嶄綔绯荤粺銆?/p>
      <h2>寮€濮嬪啓浣?/h2>
      <p>鏀寔 Markdown 璇硶锛?/p>
      <ul>
        <li>浣跨敤 # 鍒涘缓鏍囬</li>
        <li>浣跨敤 ** 鍔犵矖鏂囧瓧</li>
        <li>浣跨敤 * 鍒涘缓鏂滀綋</li>
      </ul>
      <h2>Block 绯荤粺</h2>
      <p>浣跨敤 <code>[[</code> 鍒涘缓鍙屽悜閾炬帴锛屼娇鐢?<code>((</code> 寮曠敤鍏朵粬 Block銆?/p>
      <p>鐜板湪灏卞紑濮嬪啓浣滃惂...</p>
      <h2>閫変腑鏂囧瓧鍙戦€佺粰 AI</h2>
      <p>閫変腑浠绘剰鏂囧瓧锛岀劧鍚庢寜 Cmd/Ctrl + Shift + A 鍙戦€佺粰 AI锛屾垨鑰呭彸閿€夋嫨"鍙戦€佺粰 AI"銆?/p>
    `,
    editorProps: {
      attributes: { class: 'editor-content' },
      // 鎷︽埅 ProseMirror 鐨?drop锛岄樆姝㈠畠鐢?text/plain 鎻掑叆锛堝鑷撮噸澶嶏級
      handleDrop: (_view, event) => {
        if (isBlockOSDrag(event as DragEvent)) {
          // 杩斿洖 true = 鍛婅瘔 ProseMirror "鎴戝凡澶勭悊锛屽埆鍐嶆彃鍏ヤ簡"
          // 瀹為檯鎻掑叆鐢卞灞?React onDrop 瀹屾垚
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

  // ---- 鎷栨嫿澶勭悊锛圧eact 灞傦紝鍦?ProseMirror 涔嬩笂锛?----

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
          attrs: { source: 'inspiration', sourceLabel: `馃挕 鐏垫劅 路 ${title}`, blockId: parsed.id || null },
          content: text.split('\n').filter((l: string) => l.trim()).map((line: string) => ({
            type: 'paragraph',
            content: [{ type: 'text', text: line }],
          })),
        }
      } catch {
        insertData = {
          type: 'sourceBlock',
          attrs: { source: 'inspiration', sourceLabel: '馃挕 鐏垫劅' },
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

  // ---- 鎼滅储 / 寤鸿 ----

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

  // ---- 鏂囨。鍔犺浇 ----

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
            editor.commands.setContent('<p>鏂囨。涓嶅瓨鍦?/p>')
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
          // 娌℃湁 documentId 鏃讹紝鏄剧ず娆㈣繋椤甸潰锛屼笉鑷姩鍔犺浇浠讳綍鏂囨。
          editor.commands.setContent(`
            <h1>娆㈣繋浣跨敤 BlockOS</h1>
            <p>杩欐槸涓€涓啓浣滀紭鍏堢殑鐭ヨ瘑鎿嶄綔绯荤粺銆?/p>
            <h2>寮€濮嬪啓浣?/h2>
            <p>鏀寔 Markdown 璇硶锛?/p>
            <ul>
              <li>浣跨敤 # 鍒涘缓鏍囬</li>
              <li>浣跨敤 ** 鍔犵矖鏂囧瓧</li>
              <li>浣跨敤 * 鍒涘缓鏂滀綋</li>
            </ul>
            <h2>Block 绯荤粺</h2>
            <p>浣跨敤 <code>[[</code> 鍒涘缓鍙屽悜閾炬帴锛屼娇鐢?<code>((</code> 寮曠敤鍏朵粬 Block銆?/p>
            <p>鐜板湪灏卞紑濮嬪啓浣滃惂...</p>
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

  useEffect(() => {
    if (!editor) return

    const handler = (e: Event) => {
      const { text, level } = (e as CustomEvent<{ text: string; level: number }>).detail
      if (!text) return

      let targetPos: number | null = null
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'heading') return true
        const headingLevel = (node.attrs.level as number) || 1
        const headingText = node.textContent.trim()
        if (headingLevel === level && headingText === text.trim()) {
          targetPos = pos
          return false
        }
        return true
      })

      if (targetPos !== null) {
        editor.chain().focus().setTextSelection(targetPos).scrollIntoView().run()
      }
    }

    window.addEventListener('navigateToHeading', handler)
    return () => window.removeEventListener('navigateToHeading', handler)
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const handler = (e: Event) => {
      const { content, title, releaseVersion, blockId } = (e as CustomEvent).detail
      if (!content) return
      const lines = content.split('\n').filter((l: string) => l.trim())
      editor.chain().focus().insertContent({
        type: 'sourceBlock',
        attrs: {
          source: 'inspiration',
          sourceLabel: `馃摝 v${releaseVersion} 路 ${title}`,
          blockId: blockId || null,
          releaseVersion: releaseVersion,
        },
        content: lines.map((line: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        })),
      }).run()
      if (blockId && releaseVersion) {
        void recordBlockUsage(blockId, releaseVersion)
      }
    }
    window.addEventListener('insertBlockRelease', handler)
    return () => window.removeEventListener('insertBlockRelease', handler)
  }, [editor])

  useEffect(() => {
    return () => { if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current) }
  }, [])

  useEffect(() => {
    if (!editor) return
    const handleBeforeUnload = () => {
      const docId = currentDocIdRef.current
      if (!docId) return
      try {
        const json = editor.getJSON()
        documentStore.updateDocumentBlocks(docId, json).catch(() => {})
      } catch { /* ignore */ }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editor])

  return (
    <div className="editor-container" ref={editorRef}>
      {/* Toolbar 鈥?涓よ甯冨眬锛屽鏍?reactjs-tiptap-editor 椋庢牸 */}
      <div className="editor-toolbar">
        {/* 绗竴琛岋細鎾ら攢/閲嶅仛 | 娓呴櫎 | 鏍囬 | 鏂囧瓧鏍煎紡 | 鍒楄〃 */}
        <div className="editor-toolbar__row">
          <div className="editor-toolbar__group">
            <button className="editor-toolbar__button" onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()} title="撤销">↶</button>
            <button className="editor-toolbar__button" onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()} title="重做">↷</button>
          </div>
          <div className="editor-toolbar__separator" />
          <div className="editor-toolbar__group">
            <button className="editor-toolbar__button" onClick={() => editor?.chain().focus().unsetAllMarks().run()}
              title="清除格式">✕</button>
          </div>
          <div className="editor-toolbar__separator" />
          <div className="editor-toolbar__group">
            <button className={`editor-toolbar__button editor-toolbar__button--wide ${!editor?.isActive('heading') && !editor?.isActive('codeBlock') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().setParagraph().run()} title="正文">正文</button>
            <button className={`editor-toolbar__button editor-toolbar__button--wide ${editor?.isActive('heading', { level: 1 }) ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="标题 1">标题 1</button>
            <button className={`editor-toolbar__button editor-toolbar__button--wide ${editor?.isActive('heading', { level: 2 }) ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="标题 2">标题 2</button>
            <button className={`editor-toolbar__button editor-toolbar__button--wide ${editor?.isActive('heading', { level: 3 }) ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="标题 3">标题 3</button>
          </div>
          <div className="editor-toolbar__separator" />
          <div className="editor-toolbar__group">
            <button className={`editor-toolbar__button ${editor?.isActive('bold') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBold().run()} title="加粗"><strong>B</strong></button>
            <button className={`editor-toolbar__button ${editor?.isActive('italic') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleItalic().run()} title="斜体"><em>I</em></button>
            <button className={`editor-toolbar__button editor-toolbar__button--underline ${editor?.isActive('strike') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleStrike().run()} title="删除线"><s>S</s></button>
            <button className={`editor-toolbar__button ${editor?.isActive('code') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleCode().run()} title="行内代码">{'</>'}</button>
          </div>
          <div className="editor-toolbar__separator" />
          <div className="editor-toolbar__group">
            <button className={`editor-toolbar__button ${editor?.isActive('bulletList') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBulletList().run()} title="无序列表">•</button>
            <button className={`editor-toolbar__button ${editor?.isActive('orderedList') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="有序列表">1.</button>
          </div>
        </div>
        {/* 绗簩琛岋細寮曠敤 | 鍒嗛殧绾?| 浠ｇ爜鍧?| 蹇嵎閿彁绀?*/}
        <div className="editor-toolbar__row">
          <div className="editor-toolbar__group">
            <button className={`editor-toolbar__button ${editor?.isActive('blockquote') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="引用">❝</button>
            <button className="editor-toolbar__button"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="分隔线">—</button>
            <button className={`editor-toolbar__button ${editor?.isActive('codeBlock') ? 'editor-toolbar__button--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="代码块">{'{ }'}</button>
          </div>
          <div className="editor-toolbar__spacer" />
          <span className="editor-toolbar__hint">Ctrl/Cmd + Shift + A 发送选区给 AI</span>
        </div>
      </div>

      {/* 缂栬緫鍖哄煙 */}
      <div className="editor-scroll" onDrop={handleDrop} onDragOver={handleDragOver}>
        <EditorContent editor={editor} />
      </div>

     {/* BubbleMenu 鈥?涓よ宸ュ叿鏍忥細鏍煎紡 + AI 鎿嶄綔 */}
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          apiKey={MIMO_API_KEY}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
          setAnnotationPreview={setAnnotationPreview}
        />
      )}

      {/* 缈昏瘧/瑙ｉ噴 琛屽唴棰勮 */}
      {annotationPreview && (
        <div className="annotation-preview">
          <span className="annotation-preview-label">
            {annotationPreview.mode === 'explain' ? '馃挕 瑙ｉ噴' : '馃寪 缈昏瘧'}
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

