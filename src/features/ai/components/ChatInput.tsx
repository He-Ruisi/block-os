import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Paperclip, Search, Send, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
  showDeepThink?: boolean
  showSearch?: boolean
  onToggleDeepThink?: () => void
  onToggleSearch?: () => void
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Type a message...',
  showDeepThink,
  showSearch,
  onToggleDeepThink,
  onToggleSearch,
}: ChatInputProps) {
  const [deepThinkActive, setDeepThinkActive] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  const handleDeepThinkToggle = () => {
    setDeepThinkActive(!deepThinkActive)
    onToggleDeepThink?.()
  }

  const handleSearchToggle = () => {
    setSearchActive(!searchActive)
    onToggleSearch?.()
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-4">
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="flex items-center gap-2 px-3 pt-3">
          {showDeepThink ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleDeepThinkToggle}
              className={cn(
                'rounded-full',
                deepThinkActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              DeepThink
            </Button>
          ) : null}
          {showSearch ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSearchToggle}
              className={cn(
                'rounded-full',
                searchActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </Button>
          ) : null}
        </div>

        <div className="flex items-end gap-2 p-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Attach file">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[15px] shadow-none focus-visible:ring-0"
          />

          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="shrink-0 rounded-full"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        BlockOS AI can make mistakes. Verify important information.
      </p>
    </div>
  )
}
