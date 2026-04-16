import { Minimize2, Plus, Menu as MenuIcon, Settings } from 'lucide-react'

interface ChatHeaderProps {
  title: string
  subtitle?: string
  onExitFullscreen?: () => void
  onNewChat?: () => void
  onToggleHistory?: () => void
  onOpenSettings?: () => void
  showHistory?: boolean
  showSettings?: boolean
}

export function ChatHeader({
  title,
  subtitle,
  onExitFullscreen,
  onNewChat,
  onToggleHistory,
  onOpenSettings,
  showHistory,
  showSettings,
}: ChatHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-md"
          onClick={onExitFullscreen}
          title="退出全屏"
        >
          <Minimize2 size={16} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-xs text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-md"
          onClick={onNewChat}
          title="新建对话"
        >
          <Plus size={16} />
        </button>
        <button
          className={`flex items-center justify-center h-8 w-8 transition-colors rounded-md ${
            showHistory
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={onToggleHistory}
          title="历史对话"
        >
          <MenuIcon size={16} />
        </button>
        <button
          className={`flex items-center justify-center h-8 w-8 transition-colors rounded-md ${
            showSettings
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          onClick={onOpenSettings}
          title="设置"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
