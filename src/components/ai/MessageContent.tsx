import { useRef, useEffect, useState } from 'react'
import type { Message } from '../../types/chat'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'
import { FileInput, SquareDashedBottom, GripVertical, Copy, Check } from 'lucide-react'

interface MessageContentProps {
  messages: Message[]
  isLoading?: boolean
  onInsertToEditor?: (messageId: string) => void
  onCapture?: (messageId: string) => void
  onDrag?: (messageId: string) => void
}

export function MessageContent({
  messages,
  isLoading,
  onInsertToEditor,
  onCapture,
  onDrag,
}: MessageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopy = async (messageId: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map(msg => {
        const isUser = msg.role === 'user'
        const showToolbar = hoveredMessageId === msg.id && !isUser
        const isCopied = copiedMessageId === msg.id

        return (
          <div
            key={msg.id}
            className={`py-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className={`relative ${isUser ? 'ml-auto max-w-[85%]' : 'mr-auto w-full'}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  isUser
                    ? 'bg-muted text-foreground'
                    : 'bg-transparent text-foreground'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}
              </div>

              {msg.role === 'assistant' && msg.editorContent && (
                <div className="mt-3 bg-muted/50 border border-border rounded-xl p-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    📝 编辑器内容
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={msg.editorContent} />
                  </div>
                </div>
              )}

              {!isUser && (
                <div
                  className={`flex items-center gap-1 mt-2 transition-opacity duration-200 ${
                    showToolbar ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <button
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1"
                    onClick={() => onInsertToEditor?.(msg.id)}
                  >
                    <FileInput className="h-3.5 w-3.5" />
                    {msg.insertedToEditor ? '已写入编辑器' : '写入编辑器'}
                  </button>
                  <button
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1"
                    onClick={() => onCapture?.(msg.id)}
                  >
                    <SquareDashedBottom className="h-3.5 w-3.5" />
                    捕获
                  </button>
                  <button
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1"
                    onClick={() => handleCopy(msg.id, msg.content)}
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {isCopied ? '已复制' : '复制'}
                  </button>
                  <button
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center justify-center cursor-grab"
                    onClick={() => onDrag?.(msg.id)}
                    aria-label="拖拽"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="py-4 flex justify-start">
          <div className="flex items-center gap-1 px-4 py-3">
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
