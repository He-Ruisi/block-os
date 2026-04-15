"use client"

import { X, MessageSquare, Trash2, Settings2, Moon, Sun, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface ChatHistoryItem {
  id: string
  title: string
  preview: string
  timestamp: Date
  messageCount: number
}

interface AISidebarProps {
  isOpen: boolean
  mode: "history" | "settings"
  onClose: () => void
  chatHistory?: ChatHistoryItem[]
  onSelectChat?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}

export function AISidebar({
  isOpen,
  mode,
  onClose,
  chatHistory = [],
  onSelectChat,
  onDeleteChat,
}: AISidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 lg:w-[25%] max-w-sm bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-semibold text-foreground">
              {mode === "history" ? "Chat History" : "Settings"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === "history"
                ? `${chatHistory.length} conversations`
                : "Configure AI assistant"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mode === "history" ? (
            <HistoryContent
              chatHistory={chatHistory}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
            />
          ) : (
            <SettingsContent />
          )}
        </div>
      </aside>
    </>
  )
}

function HistoryContent({
  chatHistory,
  onSelectChat,
  onDeleteChat,
}: {
  chatHistory: ChatHistoryItem[]
  onSelectChat?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}) {
  if (chatHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No chat history yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start a conversation to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="p-2">
      {chatHistory.map((chat) => (
        <div
          key={chat.id}
          className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onSelectChat?.(chat.id)}
        >
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {chat.title}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {chat.preview}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(chat.timestamp)} · {chat.messageCount} messages
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteChat?.(chat.id)
            }}
            aria-label="Delete chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}

function SettingsContent() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          General
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Sound Effects</span>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <h3 className="text-sm font-medium text-foreground">AI Behavior</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Auto-scroll to new messages</span>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Show typing indicator</span>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Enable markdown rendering</span>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <h3 className="text-sm font-medium text-foreground">Data</h3>

        <Button variant="outline" className="w-full justify-start text-sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear all chat history
        </Button>
      </div>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
