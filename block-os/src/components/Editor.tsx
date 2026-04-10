import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BlockLink, BlockReference, searchBlocks } from '../editor/extensions'
import { SuggestionMenu } from './SuggestionMenu'
import { documentStore } from '../storage/documentStore'
import { blockStore } from '../storage/blockStore'
import './Editor.css'

interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
  documentId?: string // 要加载的文档 ID
}

interface SuggestionItem {
  id: string
  title: string
  content: string
}

export function Editor({ onEditorReady, onTextSelected, documentId }: EditorProps) {
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([])
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [suggestionType, setSuggestionType] = useState<'link' | 'reference' | null>(null)
  const [suggestionRange, setSuggestionRange] = useState<{ from: number; to: number } | null>(null)
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const updateTimeoutRef = useRef<number | null>(null)
  const loadedDocumentIdRef = useRef<string | undefined>(undefined) // 记录已加载的文档 ID，避免重复加载

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

      // 延迟更新文档（防抖）
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      updateTimeoutRef.current = setTimeout(() => {
        handleDocumentUpdate(editor)
      }, 1000) // 1秒后更新
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

  // 处理文档更新（提取隐式 Block 和更新链接关系）
  const handleDocumentUpdate = async (editor: TiptapEditor) => {
    if (!currentDocumentId) return

    try {
      const editorJSON = editor.getJSON()
      await documentStore.updateDocumentBlocks(currentDocumentId, editorJSON)
    } catch (error) {
      console.error('Failed to update document blocks:', error)
    }
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

      // 立即更新链接关系
      if (currentDocumentId) {
        try {
          await blockStore.addLink(currentDocumentId, item.id)
        } catch (error) {
          console.error('Failed to add link:', error)
        }
      }
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

  // 初始化文档或加载指定文档
  useEffect(() => {
    const loadDocument = async () => {
      if (!editor) return
      
      // 避免重复加载同一个文档
      if (loadedDocumentIdRef.current === documentId) return
      loadedDocumentIdRef.current = documentId

      try {
        await documentStore.init()
        
        let doc
        
        if (documentId) {
          // 加载指定的文档
          doc = await documentStore.getDocument(documentId)
          if (!doc) {
            console.error('[Editor] Document not found:', documentId)
            return
          }
          console.log('[Editor] Loading document:', documentId)
          
          // 加载文档内容到编辑器
          if (doc.content && doc.content.trim() !== '') {
            try {
              const content = JSON.parse(doc.content)
              editor.commands.setContent(content)
              console.log('[Editor] Document content loaded')
            } catch (e) {
              console.error('Failed to parse document content:', e)
              editor.commands.setContent('<p></p>')
            }
          } else {
            // 新文档，设置空段落（不清空，保留光标）
            editor.commands.setContent('<p></p>')
            console.log('[Editor] New document, ready to edit')
          }
          
          setCurrentDocumentId(doc.id)
          documentStore.setCurrentDocument(doc.id)
        } else {
          // 没有指定文档 ID（今日/项目视图），加载或创建默认文档
          const docs = await documentStore.getAllDocuments()
          
          if (docs.length === 0) {
            doc = await documentStore.createDocument('我的第一篇文档')
            editor.commands.setContent(`<h1>我的第一篇文档</h1><p>开始写作...</p>`)
          } else {
            doc = docs[0]
            // 加载已有内容
            if (doc.content && doc.content.trim() !== '') {
              try {
                const content = JSON.parse(doc.content)
                editor.commands.setContent(content)
              } catch (e) {
                console.error('Failed to parse document content:', e)
              }
            }
          }
          
          setCurrentDocumentId(doc.id)
          documentStore.setCurrentDocument(doc.id)
        }
      } catch (error) {
        console.error('Failed to load document:', error)
      }
    }

    loadDocument()
  }, [editor, documentId])

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

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
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
