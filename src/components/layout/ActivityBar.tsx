import { Folder, Search, List, Puzzle, Newspaper, Palette, User, LogOut, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SidebarView } from '../../types/common/layout'

interface ActivityBarProps {
  activeView: SidebarView
  onViewChange: (view: SidebarView) => void
  sidebarCollapsed: boolean
  username?: string
  onSignOut?: () => void
  onOpenSettings?: () => void
  theme?: string
  onToggleTheme?: () => void
}

const VIEWS: { view: SidebarView; Icon: LucideIcon; title: string }[] = [
  { view: 'explorer', Icon: Folder, title: '资源管理器' },
  { view: 'search', Icon: Search, title: '搜索' },
  { view: 'starred', Icon: Star, title: '置顶' },
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
  theme,
  onToggleTheme,
}: ActivityBarProps) {
  return (
    <div className="flex h-screen w-12 flex-shrink-0 flex-col border-r border-border bg-secondary">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1 py-2">
        {VIEWS.map(({ view, Icon, title }) => (
          <div
            key={view}
            className={`relative flex h-12 w-12 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground ${
              activeView === view && !sidebarCollapsed
                ? 'bg-background text-purple-600 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-r before:bg-purple-600'
                : ''
            }`}
            onClick={() => onViewChange(view)}
            title={title}
          >
            <Icon size={22} />
          </div>
        ))}
      </div>

      {/* Bottom icons */}
      <div className="mt-auto flex flex-col items-center gap-1 border-t border-border py-2">
        {onToggleTheme && (
          <div
            className="flex h-12 w-12 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            onClick={onToggleTheme}
            title={theme === 'newsprint' ? 'Newsprint' : '默认主题'}
          >
            {theme === 'newsprint' ? <Newspaper size={20} /> : <Palette size={20} />}
          </div>
        )}
        {username && (
          <>
            <div 
              className="flex h-12 w-12 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:rounded hover:bg-muted hover:text-foreground" 
              title={`${username} - 点击打开设置`}
              onClick={onOpenSettings}
            >
              <User size={20} />
            </div>
            {onSignOut && (
              <div
                className="flex h-12 w-12 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={onSignOut}
                title="登出"
              >
                <LogOut size={20} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
