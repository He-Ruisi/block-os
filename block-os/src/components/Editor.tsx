import { useEffect } from 'react'
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './Editor.css'

interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
}

export function Editor({ onEditorReady, onTextSelected }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
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
  })

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

  return (
    <div className="editor-container">
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
    </div>
  )
}
