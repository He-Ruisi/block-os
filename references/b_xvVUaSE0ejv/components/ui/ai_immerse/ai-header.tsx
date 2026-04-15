"use client"

import { X, Plus, History, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIHeaderProps {
  messageCount: number
  onExit: () => void
  onNewChat: () => void
  onToggleHistory: () => void
  onToggleSettings: () => void
}

export function AIHeader({
  messageCount,
  onExit,
  onNewChat,
  onToggleHistory,
  onToggleSettings,
}: AIHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Exit fullscreen"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            AI Assistant
          </h1>
          <span className="text-xs text-muted-foreground">
            {messageCount} {messageCount === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleHistory}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="History"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSettings}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
