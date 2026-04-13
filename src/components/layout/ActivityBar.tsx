import { Folder, Search, List, Puzzle, Newspaper, Palette, User, LogOut, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SidebarView } from '../../types/layout'
import './ActivityBar.css'

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
    <div className="activity-bar">
      <div className="activity-bar-top">
        {VIEWS.map(({ view, Icon, title }) => (
          <div
            key={view}
            className={`activity-icon ${activeView === view && !sidebarCollapsed ? 'active' : ''}`}
            onClick={() => onViewChange(view)}
            title={title}
          >
            <Icon size={22} />
          </div>
        ))}
      </div>

      <div className="activity-bar-bottom">
        {onToggleTheme && (
          <div
            className="activity-icon"
            onClick={onToggleTheme}
            title={theme === 'newsprint' ? 'Newsprint' : '默认主题'}
          >
            {theme === 'newsprint' ? <Newspaper size={20} /> : <Palette size={20} />}
          </div>
        )}
        {username && (
          <>
            <div 
              className="activity-icon user-icon" 
              title={`${username} - 点击打开设置`}
              onClick={onOpenSettings}
            >
              <User size={20} />
            </div>
            {onSignOut && (
              <div
                className="activity-icon"
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
