import { useEffect, useState, useRef } from 'react'
import { useEditor, Editor as TiptapEditor } from '@tiptap/react'
import {
  BlockLink, BlockReference, SourceBlock,
  createInlineAIPlugin,
  confirmInlineAIReplace, discardInlineAIReplace,
} from '../extensions'
import { getEditorExtensions } from '../config/editorExtensions'

import { EditorBreadcrumb } from './EditorBreadcrumb'
import { EditorToolbar } from './EditorToolbar'
import { EditorContentArea } from './EditorContentArea'
import { EditorBubbleMenu } from './EditorBubbleMenu'
import { documentStore } from '@/storage/documentStore'

// 导入所见即所得样式
import '../styles/editor-wysiwyg.css'

interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
  documentId?: string
}

type AIToolbarMode = 'continue' | 'rewrite' | 'shorten' | 'expand' | 'translate' | 'explain' | 'capture'

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''

export function Editor({ onEditorReady, onTextSelected, documentId }: EditorProps) {
  // AI toolbar state
  const [aiLoading, setAiLoading] = useState<AIToolbarMode | null>(null)
  const [annotationPreview, setAnnotationPreview] = useState<{ text: string; mode: 'explain' | 'translate' } | null>(null)
  
  // Document state
  const [documentTitle, setDocumentTitle] = useState('欢迎使用 BlockOS')
  const [documentTags, setDocumentTags] = useState<string[]>(['教程', '入门'])
  
  // Refs
  const currentDocIdRef = useRef<string | null>(null)
  const loadedDocumentIdRef = useRef<string | undefined>(undefined)
  const updateTimeoutRef = useRef<number | null>(null)
  const inlineAIPluginRef = useRef(createInlineAIPlugin())

  const editor = useEditor({
    extensions: [
      ...getEditorExtensions(),
      BlockLink,
      BlockReference,
      SourceBlock,
      inlineAIPluginRef.current,
    ],
    content: `
      <h1>欢迎使用 BlockOS</h1>
      <p>这是一个以写作为优先的知识操作系统。</p>
      <h2>开始写作</h2>
      <p>支持 Markdown 语法：</p>
      <ul>
        <li>使用 <strong>#</strong> 创建标题</li>
        <li>使用 <strong>**</strong> 加粗文字</li>
        <li>使用 <strong>*</strong> 创建斜体</li>
        <li>使用 <code>\`\`\`</code> 创建代码块</li>
        <li>使用 <strong>- [ ]</strong> 创建任务列表</li>
      </ul>
      <h2>Block 系统</h2>
      <p>使用 <code>[[</code> 创建双向链接，使用 <code>((</code> 引用其他 Block。</p>
      <blockquote>
        <p>💡 提示：所有 Markdown 语法都会实时渲染为所见即所得的效果。</p>
      </blockquote>
      <p>现在就开始写作吧...</p>
    `,
    editorProps: {
      attributes: { 
        class: 'editor-content',
        'data-placeholder': '开始写作...',
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
      // 处理文档更新
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => handleDocumentUpdate(ed), 500)
    },
  })

  // 文档更新处理
  const handleDocumentUpdate = async (ed: TiptapEditor) => {
    const docId = currentDocIdRef.current
    if (!docId) return
    try {
      await documentStore.updateDocumentBlocks(docId, ed.getJSON())
    } catch (error) {
      console.error('Failed to update document blocks:', error)
    }
  }

  // Inline AI 事件监听
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

  // 文档加载
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
          setDocumentTitle(doc.title || '未命名文档')
          setCurrentDocId(doc.id)
          documentStore.setCurrentDocument(doc.id)
        } else {
          // 没有 documentId 时，显示欢迎页面
          editor.commands.setContent(`
            <h1>欢迎使用 BlockOS</h1>
            <p>这是一个以写作为优先的知识操作系统。</p>
            <h2>开始写作</h2>
            <p>支持 Markdown 语法：</p>
            <ul>
              <li>使用 <strong>#</strong> 创建标题</li>
              <li>使用 <strong>**</strong> 加粗文字</li>
              <li>使用 <strong>*</strong> 创建斜体</li>
              <li>使用 <code>\`\`\`</code> 创建代码块</li>
              <li>使用 <strong>- [ ]</strong> 创建任务列表</li>
            </ul>
            <h2>Block 系统</h2>
            <p>使用 <code>[[</code> 创建双向链接，使用 <code>((</code> 引用其他 Block。</p>
            <blockquote>
              <p>💡 提示：所有 Markdown 语法都会实时渲染为所见即所得的效果。</p>
            </blockquote>
            <p>现在就开始写作吧...</p>
          `)
          setDocumentTitle('欢迎使用 BlockOS')
          setDocumentTags(['教程', '入门'])
          setCurrentDocId('')
          documentStore.setCurrentDocument('')
        }
      } catch (error) {
        console.error('[Editor] Failed to load document:', error)
      }
    }
    loadDocument()
  }, [editor, documentId])

  // Editor ready callback
  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor)
  }, [editor, onEditorReady])

  // 键盘快捷键
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

  // 事件监听
  useEffect(() => {
    const handler = (e: Event) => {
      window.dispatchEvent(new CustomEvent('showBlockInSpace', { detail: (e as CustomEvent<string>).detail }))
    }
    window.addEventListener('navigateToBlock', handler)
    return () => window.removeEventListener('navigateToBlock', handler)
  }, [])

  // 导航到标题
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

  // 插入 Block Release
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
          sourceLabel: `📦 v${releaseVersion} · ${title}`,
          blockId: blockId || null,
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

  // 清理
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [])

  // 页面卸载前保存
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

  const setCurrentDocId = (id: string) => {
    currentDocIdRef.current = id
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 面包屑导航工具栏 */}
      <EditorBreadcrumb
        documentTitle={documentTitle}
        projectName="项目"
        lastEdited="2 分钟前编辑"
      />

      {/* 顶部 Markdown 工具栏 */}
      <EditorToolbar editor={editor} />

      {/* 编辑渲染区域 */}
      <EditorContentArea
        editor={editor}
        documentTitle={documentTitle}
        tags={documentTags}
      />

      {/* BubbleMenu - 两行工具栏：格式 + AI 操作 */}
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          apiKey={MIMO_API_KEY}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
          setAnnotationPreview={setAnnotationPreview}
        />
      )}

      {/* 翻译/解释 行内预览 */}
      {annotationPreview && (
        <div className="sticky bottom-3 left-12 right-12 mx-12 flex items-start gap-2 p-2.5 bg-background border border-border border-l-primary rounded shadow-md text-sm z-10">
          <span className="text-xs font-semibold text-primary whitespace-nowrap pt-0.5">
            {annotationPreview.mode === 'explain' ? '💡 解释' : '🌐 翻译'}
          </span>
          <span className="flex-1 text-muted-foreground leading-relaxed">
            {annotationPreview.text}
          </span>
          <button
            className="bg-transparent border-none text-muted-foreground cursor-pointer text-xs px-0.5 hover:text-foreground"
            onClick={() => setAnnotationPreview(null)}
            title="关闭"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
