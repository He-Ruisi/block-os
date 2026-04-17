import type { Editor } from '@tiptap/react'
import { Bold, CheckSquare, Code, Code2, Italic, List, ListOrdered, Minus, Quote, Redo2, RemoveFormatting, Strikethrough, Table, Undo2 } from 'lucide-react'
import { EditorToolbarView } from './EditorToolbarView'
import type { ToolbarSectionViewModel } from './types'

interface EditorToolbarContainerProps {
  editor: Editor | null
  className?: string
}

export function EditorToolbarContainer({ editor, className }: EditorToolbarContainerProps) {
  if (!editor) return null

  const topSections: ToolbarSectionViewModel[] = [
    {
      id: 'history',
      buttons: [
        { id: 'undo', icon: Undo2, title: '撤销', disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() },
        { id: 'redo', icon: Redo2, title: '重做', disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() },
      ],
    },
    {
      id: 'clear',
      buttons: [
        { id: 'clear-format', icon: RemoveFormatting, title: '清除格式', onClick: () => editor.chain().focus().unsetAllMarks().run() },
      ],
    },
    {
      id: 'headings',
      buttons: [
        { id: 'paragraph', label: '正文', title: '正文', active: !editor.isActive('heading') && !editor.isActive('codeBlock'), onClick: () => editor.chain().focus().setParagraph().run() },
        { id: 'h1', label: 'H1', title: '标题 1', active: editor.isActive('heading', { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { id: 'h2', label: 'H2', title: '标题 2', active: editor.isActive('heading', { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { id: 'h3', label: 'H3', title: '标题 3', active: editor.isActive('heading', { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
      ],
    },
    {
      id: 'marks',
      buttons: [
        { id: 'bold', icon: Bold, title: '加粗', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
        { id: 'italic', icon: Italic, title: '斜体', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
        { id: 'strike', icon: Strikethrough, title: '删除线', active: editor.isActive('strike'), onClick: () => editor.chain().focus().toggleStrike().run() },
        { id: 'code', icon: Code, title: '行内代码', active: editor.isActive('code'), onClick: () => editor.chain().focus().toggleCode().run() },
      ],
    },
    {
      id: 'lists',
      buttons: [
        { id: 'bullet-list', icon: List, title: '无序列表', active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
        { id: 'ordered-list', icon: ListOrdered, title: '有序列表', active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
      ],
    },
  ]

  const bottomSections: ToolbarSectionViewModel[] = [
    {
      id: 'blocks',
      buttons: [
        { id: 'blockquote', icon: Quote, title: '引用', active: editor.isActive('blockquote'), onClick: () => editor.chain().focus().toggleBlockquote().run() },
        { id: 'rule', icon: Minus, title: '分隔线', onClick: () => editor.chain().focus().setHorizontalRule().run() },
        { id: 'code-block', icon: Code2, title: '代码块', active: editor.isActive('codeBlock'), onClick: () => editor.chain().focus().toggleCodeBlock().run() },
      ],
    },
    {
      id: 'advanced',
      buttons: [
        { id: 'table', icon: Table, title: '插入表格', active: editor.isActive('table'), onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { id: 'task-list', icon: CheckSquare, title: '任务列表', active: editor.isActive('taskList'), onClick: () => editor.chain().focus().toggleTaskList().run() },
      ],
    },
  ]

  return (
    <EditorToolbarView
      topSections={topSections}
      bottomSections={bottomSections}
      shortcutHint="Ctrl/Cmd + Shift + A 发送选区给 AI"
      className={className}
    />
  )
}
