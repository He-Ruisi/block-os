import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send, Paperclip, Zap, Search } from 'lucide-react'

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
  placeholder = '输入消息...',
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
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
    <div className="w-full max-w-[760px] mx-auto px-4 pb-4">
      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* 功能按钮组 */}
        <div className="flex items-center gap-2 px-3 pt-3">
          {showDeepThink && (
            <button
              type="button"
              onClick={handleDeepThinkToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                deepThinkActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              DeepThink
            </button>
          )}
          {showSearch && (
            <button
              type="button"
              onClick={handleSearchToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                searchActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex items-end gap-2 p-3">
          <button
            type="button"
            className="h-9 w-9 shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="附件"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 py-2"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            aria-label="发送"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 底部说明 */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        BlockOS AI 可能会出错，请核实重要信息
      </p>
    </div>
  )
}
