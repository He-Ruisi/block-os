import { useEffect, useRef, useState } from 'react'
import { useEditor, type Editor as TiptapEditor } from '@tiptap/react'
import {
  BlockLink,
  BlockReference,
  SourceBlock,
  createInlineAIPlugin,
  confirmInlineAIReplace,
  discardInlineAIReplace,
} from '../../extensions'
import { getEditorExtensions } from '../../config/editorExtensions'
import { documentStore } from '@/storage/documentStore'
import { EditorView } from './EditorView'
import '../../styles/editor-wysiwyg.css'

interface EditorContainerProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
  documentId?: string
}

const DEFAULT_DOCUMENT_TITLE = '欢迎使用 BlockOS'
const DEFAULT_DOCUMENT_TAGS = ['教程', '入门']
const DEFAULT_EDITOR_CONTENT = `
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
`

export function EditorContainer({
  onEditorReady,
  onTextSelected,
  documentId,
}: EditorContainerProps) {
  const [aiLoading, setAiLoading] = useState<import('../types').AIToolbarMode | null>(null)
  const [annotationPreview, setAnnotationPreview] = useState<{
    text: string
    mode: 'explain' | 'translate'
  } | null>(null)
  const [documentTitle, setDocumentTitle] = useState(DEFAULT_DOCUMENT_TITLE)
  const [documentTags, setDocumentTags] = useState<string[]>(DEFAULT_DOCUMENT_TAGS)

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
    content: DEFAULT_EDITOR_CONTENT,
    editorProps: {
      attributes: {
        class: 'editor-content',
        'data-placeholder': '开始写作...',
      },
    },
    onSelectionUpdate: ({ editor: activeEditor }) => {
      const { from, to } = activeEditor.state.selection
      if (from !== to) {
        const selectedText = activeEditor.state.doc.textBetween(from, to, '\n')
        if (selectedText.trim() && onTextSelected) onTextSelected(selectedText)
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => {
        void handleDocumentUpdate(activeEditor)
      }, 500)
    },
  })

  const handleDocumentUpdate = async (activeEditor: TiptapEditor) => {
    const docId = currentDocIdRef.current
    if (!docId) return
    try {
      await documentStore.updateDocumentBlocks(docId, activeEditor.getJSON())
    } catch (error) {
      console.error('Failed to update document blocks:', error)
    }
  }

  useEffect(() => {
    if (!editor) return
    const element = editor.view.dom
    const onConfirm = () => confirmInlineAIReplace(editor.view)
    const onDiscard = () => discardInlineAIReplace(editor.view)
    element.addEventListener('inlineAIConfirm', onConfirm)
    element.addEventListener('inlineAIDiscard', onDiscard)
    return () => {
      element.removeEventListener('inlineAIConfirm', onConfirm)
      element.removeEventListener('inlineAIDiscard', onDiscard)
    }
  }, [editor])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string; mode: 'explain' | 'translate' }>).detail
      setAnnotationPreview(detail)
    }
    window.addEventListener('editorAnnotationPreview', handler)
    return () => window.removeEventListener('editorAnnotationPreview', handler)
  }, [])

  useEffect(() => {
    const loadDocument = async () => {
      if (!editor) return
      if (loadedDocumentIdRef.current === documentId) return

      const previousDocId = currentDocIdRef.current
      if (previousDocId && previousDocId !== documentId) {
        try {
          await documentStore.updateDocumentBlocks(previousDocId, editor.getJSON())
        } catch {
          // ignore
        }
      }

      loadedDocumentIdRef.current = documentId

      try {
        await documentStore.init()
        if (documentId) {
          const documentRecord = await documentStore.getDocument(documentId)
          if (!documentRecord) {
            editor.commands.setContent('<p>文档不存在</p>')
            setCurrentDocId('')
            return
          }

          if (documentRecord.content?.trim()) {
            try {
              editor.commands.setContent(JSON.parse(documentRecord.content))
            } catch {
              editor.commands.setContent('<p></p>')
            }
          } else {
            editor.commands.setContent('<p></p>')
          }

          setDocumentTitle(documentRecord.title || '未命名文档')
          setCurrentDocId(documentRecord.id)
          documentStore.setCurrentDocument(documentRecord.id)
        } else {
          editor.commands.setContent(DEFAULT_EDITOR_CONTENT)
          setDocumentTitle(DEFAULT_DOCUMENT_TITLE)
          setDocumentTags(DEFAULT_DOCUMENT_TAGS)
          setCurrentDocId('')
          documentStore.setCurrentDocument('')
        }
      } catch (error) {
        console.error('[Editor] Failed to load document:', error)
      }
    }

    void loadDocument()
  }, [editor, documentId])

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor)
  }, [editor, onEditorReady])

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'a') {
        event.preventDefault()
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
    const handler = (event: Event) => {
      window.dispatchEvent(new CustomEvent('showBlockInSpace', { detail: (event as CustomEvent<string>).detail }))
    }
    window.addEventListener('navigateToBlock', handler)
    return () => window.removeEventListener('navigateToBlock', handler)
  }, [])

  useEffect(() => {
    if (!editor) return
    const handler = (event: Event) => {
      const { text, level } = (event as CustomEvent<{ text: string; level: number }>).detail
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
    const handler = (event: Event) => {
      const { content, title, releaseVersion, blockId } = (event as CustomEvent).detail
      if (!content) return
      const lines = content.split('\n').filter((line: string) => line.trim())
      editor.chain().focus().insertContent({
        type: 'sourceBlock',
        attrs: {
          source: 'inspiration',
          sourceLabel: `📦 v${releaseVersion} · ${title}`,
          blockId: blockId || null,
          releaseVersion,
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
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    const handleBeforeUnload = () => {
      const docId = currentDocIdRef.current
      if (!docId) return
      try {
        const json = editor.getJSON()
        documentStore.updateDocumentBlocks(docId, json).catch(() => {})
      } catch {
        // ignore
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editor])

  const setCurrentDocId = (id: string) => {
    currentDocIdRef.current = id
  }

  return (
    <EditorView
      editor={editor}
      documentTitle={documentTitle}
      documentTags={documentTags}
      lastEditedLabel="2 分钟前编辑"
      aiLoading={aiLoading}
      annotationPreview={annotationPreview}
      onAiLoadingChange={setAiLoading}
      onAnnotationPreviewChange={setAnnotationPreview}
      onDismissAnnotation={() => setAnnotationPreview(null)}
    />
  )
}
