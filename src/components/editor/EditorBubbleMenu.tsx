import { BubbleMenu, Editor } from '@tiptap/react'
import { cn } from '../../lib/utils'
import {
  hasActiveInlineAI,
  cancelActiveInlineAI,
  startInlineAIReplace,
  updateInlineAIContent,
  discardInlineAIReplace,
} from '../../editor/extensions'
import { sendInlineAIRequest } from '../../services/aiService'
import { captureSelectionAsBlock } from '../../services/blockCaptureService'
import { blockStore } from '../../storage/blockStore'
import { generateUUID } from '../../utils/uuid'

interface EditorBubbleMenuProps {
  editor: Editor
  apiKey: string
  aiLoading: AIToolbarMode | null
  setAiLoading: (mode: AIToolbarMode | null) => void
  setAnnotationPreview: (preview: { text: string; mode: 'explain' | 'translate' } | null) => void
}

type AIToolbarMode = 'continue' | 'rewrite' | 'shorten' | 'expand' | 'translate' | 'explain' | 'capture'

export function EditorBubbleMenu({
  editor,
  apiKey,
  aiLoading,
  setAiLoading,
  setAnnotationPreview,
}: EditorBubbleMenuProps) {
  /** 获取选中文字及其前后上下文 */
  const getSelectionContext = (): { text: string; context: string; from: number; to: number } | null => {
    const { from, to } = editor.state.selection
    if (from === to) return null
    const text = editor.state.doc.textBetween(from, to, '\n')
    if (!text.trim()) return null
    // 取前后各 200 字符作为上下文
    const docText = editor.state.doc.textContent
    const contextStart = Math.max(0, from - 200)
    const contextEnd = Math.min(docText.length, to + 200)
    const context = docText.slice(contextStart, contextEnd)
    return { text, context, from, to }
  }

  /** 打开 AI 对话浮层 */
  const handleOpenAIChat = () => {
    const sel = getSelectionContext()
    if (!sel) return
    // 计算选区在屏幕上的位置
    const domSelection = window.getSelection()
    let position = { top: 200, left: 300 }
    if (domSelection && domSelection.rangeCount > 0) {
      const rect = domSelection.getRangeAt(0).getBoundingClientRect()
      position = { top: rect.top, left: rect.left }
    }
    window.dispatchEvent(new CustomEvent('openAIChat', {
      detail: { contextText: sel.text, position },
    }))
  }

  /** 续写：在选中段落后插入 pending SourceBlock */
  const handleContinue = async () => {
    if (!apiKey) return
    const sel = getSelectionContext()
    if (!sel) return

    // 取消已有操作
    cancelActiveInlineAI(editor.view)
    setAiLoading('continue')

    const abortController = new AbortController()

    try {
      // 先插入一个 pending SourceBlock（空内容占位）
      const insertPos = sel.to
      editor.chain().focus().setTextSelection(insertPos).insertContent({
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: '✦ AI 续写（待确认）', pending: true },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '...' }] }],
      }).run()

      // 找到刚插入的 pending SourceBlock 位置
      let pendingPos = -1
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'sourceBlock' && node.attrs.pending === true) {
          pendingPos = pos
        }
      })

      await sendInlineAIRequest({
        mode: 'continue',
        selectedText: sel.text,
        context: sel.context,
        apiKey: apiKey,
        signal: abortController.signal,
        onToken: (content) => {
          // 实时更新 pending SourceBlock 内容
          if (pendingPos >= 0) {
            editor.chain().command(({ tr }) => {
              const node = editor.state.doc.nodeAt(pendingPos)
              if (!node || node.type.name !== 'sourceBlock') return false
              const lines = content.split('\n').filter(l => l.trim())
              const paragraphs = lines.length > 0
                ? lines.map(line => editor.state.schema.nodes.paragraph.create(
                    null, editor.state.schema.text(line)
                  ))
                : [editor.state.schema.nodes.paragraph.create()]
              const newNode = node.type.create(node.attrs, paragraphs)
              tr.replaceWith(pendingPos, pendingPos + node.nodeSize, newNode)
              return true
            }).run()
          }
        },
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[InlineAI] continue failed:', err)
      }
    } finally {
      setAiLoading(null)
    }
  }

  /** 改写/缩写/扩写/翻译：AIReplaceDecoration */
  const handleReplace = async (mode: 'rewrite' | 'shorten' | 'expand' | 'translate') => {
    if (!apiKey) return
    const sel = getSelectionContext()
    if (!sel) return

    // 取消已有操作
    cancelActiveInlineAI(editor.view)
    setAiLoading(mode)

    const abortController = new AbortController()
    startInlineAIReplace(editor.view, sel.from, sel.to, mode, abortController)

    try {
      await sendInlineAIRequest({
        mode,
        selectedText: sel.text,
        context: sel.context,
        apiKey: apiKey,
        signal: abortController.signal,
        onToken: (content) => {
          updateInlineAIContent(editor.view, content)
        },
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error(`[InlineAI] ${mode} failed:`, err)
        discardInlineAIReplace(editor.view)
      }
    } finally {
      setAiLoading(null)
    }
  }

  /** 解释：写入 annotations.explanation，显示行内预览 */
  const handleExplain = async () => {
    if (!apiKey) return
    const sel = getSelectionContext()
    if (!sel) return

    setAiLoading('explain')
    setAnnotationPreview(null)

    let finalContent = ''
    try {
      await sendInlineAIRequest({
        mode: 'explain',
        selectedText: sel.text,
        apiKey: apiKey,
        onToken: (content) => {
          finalContent = content
          setAnnotationPreview({ text: content, mode: 'explain' })
        },
      })

      // 写入 Block 附属层（如果选中文字在 SourceBlock 内，找到对应 blockId）
      let blockId: string | null = null
      editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
        if (node.type.name === 'sourceBlock' && node.attrs.blockId) {
          blockId = node.attrs.blockId
        }
      })

      if (blockId) {
        await blockStore.addAnnotation(blockId, {
          id: generateUUID(),
          type: 'explanation',
          content: finalContent,
          source: 'ai',
          createdAt: new Date(),
          anchor: { text: sel.text },
        })
      }
    } catch (err) {
      console.error('[InlineAI] explain failed:', err)
    } finally {
      setAiLoading(null)
    }
  }

  /** 翻译：写入 annotations.translation，显示行内预览 */
  const handleTranslate = async () => {
    if (!apiKey) return
    const sel = getSelectionContext()
    if (!sel) return

    setAiLoading('translate')
    setAnnotationPreview(null)

    let finalContent = ''
    try {
      await sendInlineAIRequest({
        mode: 'translate',
        selectedText: sel.text,
        apiKey: apiKey,
        onToken: (content) => {
          finalContent = content
          setAnnotationPreview({ text: content, mode: 'translate' })
        },
      })

      // 写入 Block 附属层
      let blockId: string | null = null
      editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
        if (node.type.name === 'sourceBlock' && node.attrs.blockId) {
          blockId = node.attrs.blockId
        }
      })

      if (blockId) {
        await blockStore.addAnnotation(blockId, {
          id: generateUUID(),
          type: 'translation',
          content: finalContent,
          source: 'ai',
          createdAt: new Date(),
          anchor: { text: sel.text },
        })
      }
    } catch (err) {
      console.error('[InlineAI] translate failed:', err)
    } finally {
      setAiLoading(null)
    }
  }

  /** 存为块：捕获选中文字为显式 Block */
  const handleCapture = async () => {
    const sel = getSelectionContext()
    if (!sel) return

    // 检查是否在 SourceBlock 内，继承 source
    let inheritedSource: { type: 'editor' | 'ai' | 'import'; aiMessageId?: string } | undefined
    editor.state.doc.nodesBetween(sel.from, sel.to, (node) => {
      if (node.type.name === 'sourceBlock') {
        inheritedSource = { type: node.attrs.source === 'ai' ? 'ai' : 'editor' }
      }
    })

    await captureSelectionAsBlock(sel.text, inheritedSource)
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top-start' }}
      shouldShow={({ editor: ed, state }) => {
        const { from, to } = state.selection
        // 有文字选中 且 没有活跃的 replace 操作时显示
        return from !== to && !hasActiveInlineAI(state) && !ed.isActive('sourceBlock', { pending: true })
      }}
    >
      <div className="flex flex-col gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-md">
        {/* 第一行：Markdown 格式工具 */}
        <div className="flex items-center gap-0.5">
          {/* 文本类型 */}
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs font-medium rounded transition-all",
              !editor.isActive('heading') && !editor.isActive('paragraph')
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="正文">
            正文
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs font-semibold rounded transition-all",
              editor.isActive('heading', { level: 1 })
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="一级标题">
            H1
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs font-semibold rounded transition-all",
              editor.isActive('heading', { level: 2 })
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="二级标题">
            H2
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs font-semibold rounded transition-all",
              editor.isActive('heading', { level: 3 })
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="三级标题">
            H3
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          {/* 文本格式 */}
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-sm font-bold rounded transition-all",
              editor.isActive('bold')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="粗体">
            B
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-sm italic rounded transition-all",
              editor.isActive('italic')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜体">
            I
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-sm underline rounded transition-all",
              editor.isActive('underline')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="下划线">
            U
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-sm line-through rounded transition-all",
              editor.isActive('strike')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="删除线">
            S
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-xs font-mono rounded transition-all",
              editor.isActive('code')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="行内代码">
            {'<>'}
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          {/* 列表 */}
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-xs rounded transition-all",
              editor.isActive('bulletList')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="无序列表">
            •
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-xs rounded transition-all",
              editor.isActive('orderedList')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="有序列表">
            1.
          </button>
          <button
            className={cn(
              "flex items-center justify-center w-7 h-7 text-xs rounded transition-all",
              editor.isActive('blockquote')
                ? "bg-purple-100 text-purple-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用">
            "
          </button>
        </div>

        {/* 第二行：AI 操作工具 */}
        <div className="flex items-center gap-0.5">
          {/* AI 对话入口 */}
          <button
            className="flex items-center justify-center h-7 px-2 text-xs font-semibold text-purple-600 rounded transition-all hover:bg-purple-50"
            onClick={handleOpenAIChat}
            title="AI 对话">
            ✦ AI
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          {/* AI 操作组 */}
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'continue'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={handleContinue}
            disabled={aiLoading !== null}
            title="续写：在选中段落下方插入 AI 续写内容">
            {aiLoading === 'continue' ? '...' : '续写'}
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'rewrite'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => handleReplace('rewrite')}
            disabled={aiLoading !== null}
            title="改写：替换选中内容">
            {aiLoading === 'rewrite' ? '...' : '改写'}
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'shorten'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => handleReplace('shorten')}
            disabled={aiLoading !== null}
            title="缩写">
            {aiLoading === 'shorten' ? '...' : '缩写'}
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'expand'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => handleReplace('expand')}
            disabled={aiLoading !== null}
            title="扩写">
            {aiLoading === 'expand' ? '...' : '扩写'}
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'translate'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={handleTranslate}
            disabled={aiLoading !== null}
            title="翻译：写入附属层，不替换原文">
            {aiLoading === 'translate' ? '...' : '翻译'}
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 px-2 text-xs rounded transition-all",
              aiLoading === 'explain'
                ? "opacity-50 cursor-wait text-gray-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={handleExplain}
            disabled={aiLoading !== null}
            title="解释：写入附属层批注">
            {aiLoading === 'explain' ? '...' : '解释'}
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <button
            className="flex items-center justify-center h-7 px-2 text-xs rounded transition-all text-gray-600 hover:bg-gray-100"
            onClick={handleCapture}
            disabled={aiLoading !== null}
            title="存为块">
            捕获
          </button>
        </div>
      </div>
    </BubbleMenu>
  )
}
