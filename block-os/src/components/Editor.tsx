import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BlockLink, BlockReference, searchBlocks } from '../lib/tiptapExtensions'
import { SuggestionMenu } from './SuggestionMenu'
import './Editor.css'

interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
}

interface SuggestionItem {
  id: string
  title: string
  content: string
}

export function Editor({ onEditorReady, onTextSelected }: EditorProps) {
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([])
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [suggestionType, setSuggestionType] = useState<'link' | 'reference' | null>(null)
  const [suggestionRange, setSuggestionRange] = useState<{ from: number; to: number } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      BlockLink,
      BlockReference,
    ],
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
      attributes: {
        class: 'editor-content',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      // 监听选中变化
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, '\n')
        if (selectedText.trim() && onTextSelected) {
          onTextSelected(selectedText)
        }
      }
    },
    onUpdate: ({ editor }) => {
      // 检测 [[ 或 (( 触发自动补全
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 20),
        $from.parentOffset,
        null,
        '\ufffc'
      )

      // 检测 [[
      const linkMatch = textBefore.match(/\[\[([^\]]*)$/)
      if (linkMatch) {
        const query = linkMatch[1]
        const from = $from.pos - query.length
        const to = $from.pos
        
        setSuggestionType('link')
        setSuggestionRange({ from: from - 2, to })
        handleSearch(query)
        updateSuggestionPosition(editor)
        return
      }

      // 检测 ((
      const refMatch = textBefore.match(/\(\(([^)]*)$/)
      if (refMatch) {
        const query = refMatch[1]
        const from = $from.pos - query.length
        const to = $from.pos
        
        setSuggestionType('reference')
        setSuggestionRange({ from: from - 2, to })
        handleSearch(query)
        updateSuggestionPosition(editor)
        return
      }

      // 没有匹配，关闭建议
      setShowSuggestion(false)
    },
  })

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

  const updateSuggestionPosition = (editor: TiptapEditor) => {
    const { selection } = editor.state
    const { $from } = selection
    const coords = editor.view.coordsAtPos($from.pos)
    
    setSuggestionPosition({
      top: coords.bottom + 5,
      left: coords.left,
    })
  }

  const handleSelectSuggestion = async (item: SuggestionItem) => {
    if (!editor || !suggestionRange) return

    const { from, to } = suggestionRange

    if (suggestionType === 'link') {
      // 插入双向链接
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent({
          type: 'blockLink',
          attrs: {
            blockId: item.id,
            blockTitle: item.title,
          },
        })
        .run()

      // 建立链接关系（需要当前文档的 blockId）
      // TODO: 实现文档级别的 Block 管理
    } else if (suggestionType === 'reference') {
      // 插入块引用
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent({
          type: 'blockReference',
          attrs: {
            blockId: item.id,
            blockContent: item.content,
          },
        })
        .run()
    }

    setShowSuggestion(false)
  }

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  // 添加键盘快捷键监听
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + A
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        const { from, to } = editor.state.selection
        if (from !== to) {
          const selectedText = editor.state.doc.textBetween(from, to, '\n')
          if (selectedText.trim() && onTextSelected) {
            onTextSelected(selectedText)
            // 触发一个自定义事件，通知 RightPanel
            window.dispatchEvent(new CustomEvent('sendToAI', { detail: selectedText }))
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, onTextSelected])

  // 监听 Block 导航事件
  useEffect(() => {
    const handleNavigateToBlock = async (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const blockId = customEvent.detail
      
      // 切换到 Block 空间并高亮该 Block
      window.dispatchEvent(new CustomEvent('showBlockInSpace', { detail: blockId }))
    }

    window.addEventListener('navigateToBlock', handleNavigateToBlock)
    return () => window.removeEventListener('navigateToBlock', handleNavigateToBlock)
  }, [])

  return (
    <div className="editor-container" ref={editorRef}>
      <div className="editor-toolbar">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
        >
          I
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}
        >
          H2
        </button>
        <div className="toolbar-divider"></div>
        <div className="toolbar-hint">
          💡 选中文字后按 Cmd/Ctrl + Shift + A 发送给 AI
        </div>
      </div>
      <div className="editor-scroll">
        <EditorContent editor={editor} />
      </div>

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
