import { Minimize2, Plus, Menu as MenuIcon, Settings } from 'lucide-react'
import './ChatHeader.css'

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
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          className="chat-header__btn"
          onClick={onExitFullscreen}
          title="退出全屏"
        >
          <Minimize2 size={18} />
        </button>
        <div className="chat-header__title-group">
          <h1 className="chat-header__title">{title}</h1>
          {subtitle && <span className="chat-header__subtitle">{subtitle}</span>}
        </div>
      </div>
      <div className="chat-header__right">
        <button
          className="chat-header__btn"
          onClick={onNewChat}
          title="新建对话"
        >
          <Plus size={18} />
        </button>
        <button
          className={`chat-header__btn ${showHistory ? 'chat-header__btn--active' : ''}`}
          onClick={onToggleHistory}
          title="历史对话"
        >
          <MenuIcon size={18} />
        </button>
        <button
          className={`chat-header__btn ${showSettings ? 'chat-header__btn--active' : ''}`}
          onClick={onOpenSettings}
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
