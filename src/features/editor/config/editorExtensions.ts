import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Typography } from '@tiptap/extension-typography'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

// 创建 lowlight 实例用于代码高亮
const lowlight = createLowlight(common)

/**
 * 获取编辑器扩展配置
 * 实现所见即所得的 Markdown 渲染
 */
export function getEditorExtensions() {
  return [
    // StarterKit 包含基础功能（但排除默认的 CodeBlock）
    StarterKit.configure({
      codeBlock: false, // 使用 CodeBlockLowlight 替代
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    
    // 下划线
    Underline,
    
    // 代码块（带语法高亮）
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
    }),
    
    // 表格
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    
    // 任务列表
    TaskList.configure({
      HTMLAttributes: {
        class: 'tiptap-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'tiptap-task-item',
      },
    }),
    
    // 排版增强（智能引号、破折号等）
    Typography,
    
    // 占位符
    Placeholder.configure({
      placeholder: '开始写作...',
      emptyEditorClass: 'is-editor-empty',
    }),
  ]
}
