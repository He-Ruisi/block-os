import { Menu, Plus, Share2 } from 'lucide-react'
import './ChatHeader.css'

interface ChatHeaderProps {
  title: string
  subtitle?: string
  onToggleSidebar?: () => void
  onNewChat?: () => void
  onShare?: () => void
}

export function ChatHeader({
  title,
  subtitle,
  onToggleSidebar,
  onNewChat,
  onShare,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          className="chat-header__btn"
          onClick={onToggleSidebar}
          title="折叠侧边栏"
        >
          <Menu size={18} />
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
          className="chat-header__btn"
          onClick={onShare}
          title="分享"
        >
          <Share2 size={18} />
        </button>
      </div>
    </header>
  )
}
