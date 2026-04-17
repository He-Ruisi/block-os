import { Folder, Search, List, Puzzle, User, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SidebarView } from '../../types/common/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActivityBarProps {
  activeView: SidebarView
  onViewChange: (view: SidebarView) => void
  sidebarCollapsed: boolean
  username?: string
  onSignOut?: () => void
  onOpenSettings?: () => void
}

const VIEWS: { view: SidebarView; Icon: LucideIcon; title: string }[] = [
  { view: 'explorer', Icon: Folder, title: '资源管理器' },
  { view: 'search', Icon: Search, title: '搜索' },
  { view: 'outline', Icon: List, title: '大纲' },
  { view: 'extensions', Icon: Puzzle, title: '插件' },
]

export function ActivityBar({
  activeView,
  onViewChange,
  sidebarCollapsed,
  username,
  onSignOut,
  onOpenSettings,
}: ActivityBarProps) {
  return (
    <div className="surface-glow flex h-screen w-14 flex-shrink-0 flex-col border-r border-border/80 bg-background/95">
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        {VIEWS.map(({ view, Icon, title }) => (
          <Button
            key={view}
            variant="ghost"
            size="icon"
            className={cn(
              'relative h-11 w-11 rounded-2xl text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/[0.06] hover:text-foreground',
              activeView === view &&
                !sidebarCollapsed &&
                'bg-primary/[0.08] text-primary shadow-[var(--shadow-sm)] before:absolute before:left-[-0.65rem] before:top-2 before:bottom-2 before:w-0.5 before:rounded-r before:bg-primary'
            )}
            onClick={() => onViewChange(view)}
            title={title}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2 border-t border-border/80 px-2 py-3">
        {username && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground"
              title={`${username} - 点击打开设置`}
              onClick={onOpenSettings}
            >
              <User className="h-5 w-5" />
            </Button>
            {onSignOut && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={onSignOut}
                title="登出"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
