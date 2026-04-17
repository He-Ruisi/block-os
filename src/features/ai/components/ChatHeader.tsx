import { History, Minimize2, Plus, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onExitFullscreen} title="Exit full screen">
          <Minimize2 className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onNewChat} title="New chat">
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(showHistory && 'bg-primary/10 text-primary hover:bg-primary/15')}
          onClick={onToggleHistory}
          title="History"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(showSettings && 'bg-primary/10 text-primary hover:bg-primary/15')}
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
