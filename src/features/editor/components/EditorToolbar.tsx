import { Editor } from '@tiptap/react'
import {
  Undo2,
  Redo2,
  RemoveFormatting,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code2,
  Table,
  CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  editor: Editor | null
  className?: string
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className={cn("flex flex-col border-b border-border bg-background flex-shrink-0", className)}>
      {/* 第一行：撤销/重做 | 清除 | 标题 | 文本格式 | 列表 */}
      <div className="flex items-center gap-1 px-3 py-1.5 min-h-9 overflow-x-auto border-b border-border">
        {/* 撤销/重做 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 清除格式 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="清除格式"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 标题 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-medium",
              !editor.isActive('heading') && !editor.isActive('codeBlock')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="正文"
          >
            正文
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-semibold",
              editor.isActive('heading', { level: 1 })
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="标题 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-semibold",
              editor.isActive('heading', { level: 2 })
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="标题 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-semibold",
              editor.isActive('heading', { level: 3 })
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="标题 3"
          >
            H3
          </Button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 文本格式 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('bold')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="加粗"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('italic')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('strike')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="删除线"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('code')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="行内代码"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 列表 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('bulletList')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="无序列表"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('orderedList')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="有序列表"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 第二行：引用 | 分隔线 | 代码块 | 表格 | 任务列表 | 快捷键提示 */}
      <div className="flex items-center gap-1 px-3 py-1.5 min-h-9 overflow-x-auto">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('blockquote')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="分隔线"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('codeBlock')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="代码块"
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* 表格和任务列表 */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('table')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="插入表格"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive('taskList')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="任务列表"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Ctrl/Cmd + Shift + A 发送选区给 AI
        </span>
      </div>
    </div>
  )
}
