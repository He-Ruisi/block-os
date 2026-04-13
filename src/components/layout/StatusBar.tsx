import { useAutoSync } from '../../hooks/useAutoSync'
import { Cloud, CloudOff, Save, FileText, Link } from 'lucide-react'
import './StatusBar.css'

interface StatusBarProps {
  wordCount: number
  blockCount: number
  linkCount: number
  autoSaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSaved: Date | null
}

export function StatusBar({
  wordCount,
  blockCount,
  linkCount,
  autoSaveStatus,
  lastSaved,
}: StatusBarProps) {
  const syncState = useAutoSync()

  const formatLastSaved = (time: Date | null): string => {
    if (!time) return '从未保存'
    const now = new Date()
    const diff = now.getTime() - time.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 5) return '刚刚保存'
    if (seconds < 60) return `${seconds} 秒前保存`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} 分钟前保存`
    return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="status-bar">
      {/* 左侧：同步状态 */}
      <div className="status-bar-section status-bar-left">
        {syncState.isOffline ? (
          <div className="status-item status-offline" title="网络离线">
            <CloudOff size={14} />
            <span>离线</span>
          </div>
        ) : syncState.isSyncing ? (
          <div className="status-item status-syncing" title="正在同步到云端">
            <Cloud size={14} className="spinning" />
            <span>同步中</span>
          </div>
        ) : syncState.pendingChangesCount > 0 ? (
          <div className="status-item status-pending" title={`${syncState.pendingChangesCount} 项待同步`}>
            <Cloud size={14} />
            <span>{syncState.pendingChangesCount} 项待同步</span>
          </div>
        ) : (
          <div className="status-item status-synced" title="已同步到云端">
            <Cloud size={14} />
            <span>已同步</span>
          </div>
        )}
      </div>

      {/* 中间：自动保存状态 */}
      <div className="status-bar-section status-bar-center">
        {autoSaveStatus === 'saving' ? (
          <div className="status-item status-saving" title="正在保存">
            <Save size={14} className="spinning" />
            <span>保存中...</span>
          </div>
        ) : autoSaveStatus === 'unsaved' ? (
          <div className="status-item status-unsaved" title="有未保存的更改">
            <Save size={14} />
            <span>未保存</span>
          </div>
        ) : (
          <div className="status-item status-saved" title={formatLastSaved(lastSaved)}>
            <Save size={14} />
            <span>{formatLastSaved(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* 右侧：文档统计 */}
      <div className="status-bar-section status-bar-right">
        <div className="status-item" title="字数">
          <FileText size={14} />
          <span>{wordCount.toLocaleString()} 字</span>
        </div>
        <div className="status-separator" />
        <div className="status-item" title="引用块数量">
          <Link size={14} />
          <span>{blockCount} 块</span>
        </div>
        {linkCount > 0 && (
          <>
            <div className="status-separator" />
            <div className="status-item" title="双向链接数量">
              <span>🔗 {linkCount} 链接</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
