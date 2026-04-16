import { useState } from 'react'
import type { Session } from '@/types/models/chat'
import { groupSessionsByDate, exportSessionAsJSON } from '@/features/ai'
import { sessionStore } from '@/storage/sessionStore'
import '@/styles/modules/panels.css'

interface SessionHistoryPanelProps {
  sessions: Session[]
  currentSessionId: string
  onSelect: (session: Session) => void
  onDelete: (sessionId: string) => void
  onRefresh: () => Promise<void>
}

export function SessionHistoryPanel({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onRefresh,
}: SessionHistoryPanelProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; session: Session } | null>(null)

  const groups = groupSessionsByDate(sessions)

  const handleContextMenu = (e: React.MouseEvent, session: Session) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, session })
  }

  const handleDelete = async (sessionId: string) => {
    await sessionStore.deleteSession(sessionId)
    await onRefresh()
    onDelete(sessionId)
    setContextMenu(null)
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  if (sessions.length === 0) {
    return (
      <div className="session-history-panel__empty">
        <div className="session-history-panel__empty-icon">💬</div>
        <div className="session-history-panel__empty-text">还没有历史对话</div>
        <div className="session-history-panel__empty-hint">开始对话后会自动保存</div>
      </div>
    )
  }

  return (
    <div className="session-history-panel" onClick={() => setContextMenu(null)}>
      {groups.map(group => (
        <div key={group.date} className="session-history-panel__group">
          <div className="session-history-panel__group-label">{group.label}</div>
          {group.sessions.map(session => (
            <div
              key={session.id}
              className={`session-history-panel__item ${session.id === currentSessionId ? 'session-history-panel__item--active' : ''}`}
              onClick={() => onSelect(session)}
              onContextMenu={e => handleContextMenu(e, session)}
            >
              <div className="session-history-panel__item-title">{session.title}</div>
              <div className="session-history-panel__item-meta">
                <span>{session.messages.length} 条消息</span>
                <span>{formatTime(session.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {contextMenu && (
        <div
          className="session-history-panel__context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="session-history-panel__context-menu-button"
            onClick={() => {
              exportSessionAsJSON(contextMenu.session)
              setContextMenu(null)
            }}
          >
            导出 JSON
          </button>
          <button
            className="session-history-panel__context-menu-button session-history-panel__context-menu-button--danger"
            onClick={() => handleDelete(contextMenu.session.id)}
          >
            删除
          </button>
        </div>
      )}
    </div>
  )
}
