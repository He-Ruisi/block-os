import { Bot, Maximize2, MessageSquare, Minimize2, Pin, PinOff, Plus, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { AIFloatPanelViewProps } from './types'

export function AIFloatPanelView({
  mode,
  messages,
  isLoading,
  input,
  contextText,
  contextSent,
  position,
  onInputChange,
  onSend,
  onInsert,
  onNewSession,
  onModeChange,
  onClose,
  onDragStart,
  messagesEndRef,
  inputRef,
}: AIFloatPanelViewProps) {
  return (
    <Card
      className={cn(
        'z-50 flex w-full flex-col overflow-hidden border shadow-xl',
        mode === 'bubble' && 'fixed bottom-6 right-6 h-[32rem] max-w-md',
        mode === 'float' && 'fixed h-[34rem] max-w-md',
        mode === 'sidebar' && 'h-full rounded-none border-y-0 border-r-0 shadow-none'
      )}
      style={position}
    >
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between gap-3 border-b px-4 py-3',
          mode === 'float' && 'cursor-move'
        )}
        onMouseDown={onDragStart}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">
              {mode === 'sidebar' ? 'Docked mode' : 'Quick chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {mode !== 'bubble' ? (
            <Button variant="ghost" size="icon" onClick={() => onModeChange('bubble')}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          ) : null}
          {mode !== 'float' ? (
            <Button variant="ghost" size="icon" onClick={() => onModeChange('float')}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => onModeChange('bubble')}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {mode !== 'sidebar' ? (
            <Button variant="ghost" size="icon" onClick={() => onModeChange('sidebar')}>
              <Pin className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => onModeChange('float')}>
              <PinOff className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onNewSession}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4 p-4">
          {contextText && !contextSent ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Context</p>
              <p className="text-sm text-foreground">
                {contextText.slice(0, 200)}
                {contextText.length > 200 ? '...' : ''}
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'space-y-2',
                message.role === 'user' ? 'ml-10' : 'mr-10'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-muted text-foreground'
                    : 'border bg-background text-foreground'
                )}
              >
                {message.content}
              </div>
              {message.role === 'assistant' && !message.insertedToEditor ? (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => onInsert(message.id)}>
                    Insert
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' ? (
            <div className="flex items-center gap-1 px-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </CardContent>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void onSend()
              }
            }}
            rows={mode === 'bubble' ? 2 : 3}
            placeholder="Ask AI anything..."
            className="min-h-0 resize-none"
          />
          <Button onClick={() => void onSend()} disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
