"use client"

import { useState } from "react"
import { FileInput, SquareDashedBottom, GripVertical, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIMessageProps {
  message: Message
  onInsertToEditor?: (content: string) => void
  onCaptureAsBlock?: (content: string) => void
}

export function AIMessage({
  message,
  onInsertToEditor,
  onCaptureAsBlock,
}: AIMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)

  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "group py-4",
        isUser ? "flex justify-end" : "flex justify-start"
      )}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      <div
        className={cn(
          "relative max-w-[85%]",
          isUser ? "ml-auto" : "mr-auto w-full"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
            isUser
              ? "bg-muted text-foreground"
              : "bg-transparent text-foreground"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>

        {!isUser && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 transition-opacity duration-200",
              showToolbar ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
              onClick={() => onInsertToEditor?.(message.content)}
            >
              <FileInput className="h-3.5 w-3.5" />
              Insert to Editor
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
              onClick={() => onCaptureAsBlock?.(message.content)}
            >
              <SquareDashedBottom className="h-3.5 w-3.5" />
              Capture as Block
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab"
              aria-label="Drag"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-muted p-3 rounded-lg overflow-x-auto">
          <code className={lang ? `language-${lang}` : ""}>
            {codeLines.join("\n")}
          </code>
        </pre>
      )
      i++
      continue
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-semibold text-base mt-4 mb-2">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-semibold text-lg mt-4 mb-2">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="font-semibold text-xl mt-4 mb-2">
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc">
          {renderInlineMarkdown(line.slice(2))}
        </li>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^\d+\.\s(.*)/)
      if (match) {
        elements.push(
          <li key={i} className="ml-4 list-decimal">
            {renderInlineMarkdown(match[1])}
          </li>
        )
      }
    } else if (line.trim() === "") {
      elements.push(<br key={i} />)
    } else {
      elements.push(
        <p key={i} className="my-2">
          {renderInlineMarkdown(line)}
        </p>
      )
    }
    i++
  }

  return <>{elements}</>
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const codeMatch = remaining.match(/`([^`]+)`/)

    let firstMatch: { type: "bold" | "code"; index: number; match: RegExpMatchArray } | null = null

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = { type: "bold", index: boldMatch.index, match: boldMatch }
    }
    if (codeMatch && codeMatch.index !== undefined) {
      if (!firstMatch || codeMatch.index < firstMatch.index) {
        firstMatch = { type: "code", index: codeMatch.index, match: codeMatch }
      }
    }

    if (firstMatch) {
      if (firstMatch.index > 0) {
        parts.push(remaining.slice(0, firstMatch.index))
      }

      if (firstMatch.type === "bold") {
        parts.push(
          <strong key={key++} className="font-semibold">
            {firstMatch.match[1]}
          </strong>
        )
      } else {
        parts.push(
          <code
            key={key++}
            className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
          >
            {firstMatch.match[1]}
          </code>
        )
      }

      remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length)
    } else {
      parts.push(remaining)
      break
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export function AIMessageLoading() {
  return (
    <div className="py-4 flex justify-start">
      <div className="flex items-center gap-1 px-4 py-3">
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
