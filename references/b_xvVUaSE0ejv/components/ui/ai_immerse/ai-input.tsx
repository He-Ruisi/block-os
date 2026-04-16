"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { Sparkles, Search, Paperclip, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIInputProps {
  onSend: (message: string, options?: { deepThink?: boolean; search?: boolean }) => void
  disabled?: boolean
  placeholder?: string
}

export function AIInput({
  onSend,
  disabled = false,
  placeholder = "Ask AI anything...",
}: AIInputProps) {
  const [value, setValue] = useState("")
  const [deepThink, setDeepThink] = useState(false)
  const [search, setSearch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim(), { deepThink, search })
      setValue("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-[760px] mx-auto px-4 pb-4">
      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-3 pt-3">
          <button
            type="button"
            onClick={() => setDeepThink(!deepThink)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              deepThink
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            DeepThink
          </button>
          <button
            type="button"
            onClick={() => setSearch(!search)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              search
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>

        <div className="flex items-end gap-2 p-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 py-2"
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        BlockOS AI may make mistakes. Verify important information.
      </p>
    </div>
  )
}
