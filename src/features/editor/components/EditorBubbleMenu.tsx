import { BubbleMenu, Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  ArrowRight,
  PenLine,
  Languages,
  Lightbulb,
  Minimize2,
  Maximize2,
  Bookmark,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  hasActiveInlineAI,
  cancelActiveInlineAI,
  startInlineAIReplace,
  updateInlineAIContent,
  discardInlineAIReplace,
} from '../extensions'
import { sendInlineAIRequest } from '@/features/ai/services/aiService'
import { captureSelectionAsBlock } from '@/features/blocks/services/blockCaptureService'
import { blockStore } from '@/storage/blockStore'
import { generateUUID } from '@/utils/uuid'

interface EditorBubbleMenuProps {
  editor: Editor
  apiKey: string
  aiLoading: AIToolbarMode | null
  setAiLoading: (mode: AIToolbarMode | null) => void
  setAnnotationPreview: (preview: { text: string; mode: 'explain' | 'translate' } | null) => void
}

type AIToolbarMode = 'continue' | 'rewrite' | 'shorten' | 'expand' | 'translate' | 'explain' | 'capture'

/** AI 操作配置 */
const AI_ACTIONS: Array<{
  mode: AIToolbarMode
  icon: typeof Sparkles
  label: string
  title: string
}> = [
  { mode: 'continue', icon: ArrowRight, label: '续写', title: '在选中段落下方插入 AI 续写内容' },
  { mode: 'rewrite', icon: PenLine, label: '改写', title: '替换选中内容' },
  { mode: 'shorten', icon: Minimize2, label: '缩写', title: '缩短选中内容' },
  { mode: 'expand', icon: Maximize2, label: '扩写', title: '扩展选中内容' },
  { mode: 'translate', icon: Languages, label: '翻译', title: '翻译选中内容' },
  { mode: 'explain', icon: Lightbulb, label: '解释', title: '解释选中内容' },
]

export function EditorBubbleMenu({
  editor,
  apiKey,
  aiLoading,
  setAiLoading,
  setAnnotationPreview,
}: EditorBubbleMenuProps) {
  const [customPrompt, setCustomPrompt] = useState('')

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

  /** 处理 AI 操作 */
  const handleAIAction = (mode: AIToolbarMode) => {
    switch (mode) {
      case 'continue':
        handleContinue()
        break
      case 'rewrite':
      case 'shorten':
      case 'expand':
        handleReplace(mode)
        break
      case 'translate':
        handleTranslate()
        break
      case 'explain':
        handleExplain()
        break
      case 'capture':
        handleCapture()
        break
    }
  }

  /** 处理自定义指令 */
  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return
    // TODO: 实现自定义指令功能
    console.log('Custom prompt:', customPrompt)
    setCustomPrompt('')
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
      <div className="flex flex-col gap-1 p-1.5 bg-popover border border-border rounded-xl shadow-lg min-w-[320px]">
        {/* 第一行：Markdown 格式工具 */}
        <div className="flex items-center gap-0.5">
          {/* 文本类型 */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-medium",
              !editor.isActive('heading') && !editor.isActive('paragraph')
                ? "text-muted-foreground"
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
            title="一级标题"
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
            title="二级标题"
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
            title="三级标题"
          >
            H3
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* 文本格式 */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 text-sm font-bold",
              editor.isActive('bold')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="粗体"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 text-sm italic",
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
              "h-7 w-7 text-sm underline",
              editor.isActive('underline')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="下划线"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 text-sm line-through",
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
              "h-7 w-7 text-xs font-mono",
              editor.isActive('code')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="行内代码"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* 列表 */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 text-xs",
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
              "h-7 w-7 text-xs",
              editor.isActive('orderedList')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="有序列表"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 text-xs",
              editor.isActive('blockquote')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* 第二行：AI 操作工具 */}
        <div className="flex items-center gap-0.5">
          {/* AI 对话入口 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
            onClick={handleOpenAIChat}
            title="AI 对话"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            AI
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* AI 操作下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs font-medium",
                  aiLoading ? "text-muted-foreground opacity-50" : "text-muted-foreground"
                )}
                disabled={aiLoading !== null}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                AI 功能
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {AI_ACTIONS.map((action) => (
                <DropdownMenuItem
                  key={action.mode}
                  onClick={() => handleAIAction(action.mode)}
                  disabled={aiLoading !== null}
                  className="cursor-pointer"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCapture}
                disabled={aiLoading !== null}
                className="cursor-pointer"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                <span>捕获为块</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 快捷 AI 操作按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              aiLoading === 'continue'
                ? "opacity-50 cursor-wait text-muted-foreground"
                : "text-muted-foreground"
            )}
            onClick={handleContinue}
            disabled={aiLoading !== null}
            title="续写：在选中段落下方插入 AI 续写内容"
          >
            {aiLoading === 'continue' ? '...' : '续写'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              aiLoading === 'rewrite'
                ? "opacity-50 cursor-wait text-muted-foreground"
                : "text-muted-foreground"
            )}
            onClick={() => handleReplace('rewrite')}
            disabled={aiLoading !== null}
            title="改写：替换选中内容"
          >
            {aiLoading === 'rewrite' ? '...' : '改写'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              aiLoading === 'translate'
                ? "opacity-50 cursor-wait text-muted-foreground"
                : "text-muted-foreground"
            )}
            onClick={handleTranslate}
            disabled={aiLoading !== null}
            title="翻译：写入附属层，不替换原文"
          >
            {aiLoading === 'translate' ? '...' : '翻译'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              aiLoading === 'explain'
                ? "opacity-50 cursor-wait text-muted-foreground"
                : "text-muted-foreground"
            )}
            onClick={handleExplain}
            disabled={aiLoading !== null}
            title="解释：写入附属层批注"
          >
            {aiLoading === 'explain' ? '...' : '解释'}
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={handleCapture}
            disabled={aiLoading !== null}
            title="存为块"
          >
            捕获
          </Button>
        </div>

        {/* 第三行：自定义指令输入 */}
        <div className="flex items-center gap-2 px-1 pt-1 border-t border-border">
          <div className="flex items-center gap-2 flex-1 bg-muted/50 rounded-md px-2 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomPrompt()}
              placeholder="输入自定义指令..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button
              variant="default"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={handleCustomPrompt}
              disabled={!customPrompt.trim()}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </BubbleMenu>
  )
}
