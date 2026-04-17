import { useEffect, useRef, useState } from 'react'
import { Check, Copy, FileInput, GripVertical, SquareDashedBottom } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AIMessageViewModel } from './types'

interface MessageContentProps {
  messages: AIMessageViewModel[]
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
      {messages.map((message) => {
        const isUser = message.role === 'user'
        const showToolbar = hoveredMessageId === message.id && !isUser
        const isCopied = copiedMessageId === message.id

        return (
          <div
            key={message.id}
            className={cn('py-4', isUser ? 'flex justify-end' : 'flex justify-start')}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className={cn('relative', isUser ? 'ml-auto max-w-[85%]' : 'mr-auto w-full')}>
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
                  isUser ? 'bg-muted text-foreground' : 'bg-transparent text-foreground'
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}
              </div>

              {message.role === 'assistant' && message.editorContent ? (
                <Card className="mt-3 bg-muted/20">
                  <CardContent className="p-4">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">
                      Editor Content
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={message.editorContent} />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {!isUser ? (
                <div
                  className={cn(
                    'mt-2 flex items-center gap-1 transition-opacity duration-200',
                    showToolbar ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <Button variant="ghost" size="sm" onClick={() => onInsertToEditor?.(message.id)}>
                    <FileInput className="h-3.5 w-3.5" />
                    {message.insertedToEditor ? 'Inserted' : 'Insert'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onCapture?.(message.id)}>
                    <SquareDashedBottom className="h-3.5 w-3.5" />
                    Capture
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(message.id, message.content)}>
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDrag?.(message.id)}
                    aria-label="Drag message"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}

      {isLoading && messages[messages.length - 1]?.role !== 'assistant' ? (
        <div className="flex justify-start py-4">
          <div className="flex items-center gap-1 px-4 py-3">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : null}

      <div ref={messagesEndRef} />
    </div>
  )
}
