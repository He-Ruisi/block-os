import { useAutoSync } from '../../hooks/useAutoSync'
import { isSupabaseEnabled } from '../../lib/supabase'
import './SyncStatusIndicator.css'

export function SyncStatusIndicator() {
  const { isSyncing, lastSyncTime, pendingChangesCount, isOffline } = useAutoSync()

  const formatLastSyncTime = (time: Date | null): string => {
    if (!time) return '从未同步'
    const now = new Date()
    const diff = now.getTime() - time.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    return time.toLocaleDateString()
  }

  return (
    <div className="sync-status-indicator">
      {!isSupabaseEnabled && (
        <div className="sync-status local" title="本地模式，数据仅保存在当前设备">
          <span className="status-icon">💾</span>
          <span className="status-text">本地模式</span>
        </div>
      )}

      {isSupabaseEnabled && isOffline && (
        <div className="sync-status offline" title="网络离线，数据将在恢复网络后自动同步">
          <span className="status-icon">⚠️</span>
          <span className="status-text">离线模式</span>
          {pendingChangesCount > 0 && (
            <span className="pending-count">{pendingChangesCount} 项待同步</span>
          )}
        </div>
      )}

      {isSupabaseEnabled && !isOffline && isSyncing && (
        <div className="sync-status syncing" title="正在同步到云端...">
          <span className="status-icon spinning">🔄</span>
          <span className="status-text">同步中...</span>
        </div>
      )}

      {isSupabaseEnabled && !isOffline && !isSyncing && pendingChangesCount > 0 && (
        <div className="sync-status pending" title={`${pendingChangesCount} 项变更等待同步`}>
          <span className="status-icon">⏳</span>
          <span className="status-text">{pendingChangesCount} 项待同步</span>
        </div>
      )}

      {isSupabaseEnabled && !isOffline && !isSyncing && pendingChangesCount === 0 && lastSyncTime && (
        <div className="sync-status synced" title={`上次同步: ${formatLastSyncTime(lastSyncTime)}`}>
          <span className="status-icon">✓</span>
          <span className="status-text">已同步</span>
        </div>
      )}
    </div>
  )
}
