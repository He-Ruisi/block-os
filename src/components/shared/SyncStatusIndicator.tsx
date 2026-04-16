import { useAutoSync } from '../../hooks/useAutoSync'
import { isSupabaseEnabled } from '../../lib/supabase'

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
    <div className="flex items-center px-2 py-1 text-xs select-none">
      {!isSupabaseEnabled && (
        <div className="flex items-center gap-1.5 rounded bg-orange-500/10 px-2 py-1 transition-opacity hover:cursor-help hover:opacity-80" title="本地模式，数据仅保存在当前设备">
          <span className="text-sm leading-none">💾</span>
          <span className="font-medium text-muted-foreground">本地模式</span>
        </div>
      )}

      {isSupabaseEnabled && isOffline && (
        <div className="flex items-center gap-1.5 rounded bg-orange-500/10 px-2 py-1 transition-opacity hover:cursor-help hover:opacity-80" title="网络离线，数据将在恢复网络后自动同步">
          <span className="text-sm leading-none">⚠️</span>
          <span className="font-medium text-orange-500">离线模式</span>
          {pendingChangesCount > 0 && (
            <span className="ml-1 text-[11px] text-muted-foreground">{pendingChangesCount} 项待同步</span>
          )}
        </div>
      )}

      {isSupabaseEnabled && !isOffline && isSyncing && (
        <div className="flex items-center gap-1.5 rounded bg-blue-500/10 px-2 py-1 transition-opacity hover:cursor-help hover:opacity-80" title="正在同步到云端...">
          <span className="text-sm leading-none animate-spin">🔄</span>
          <span className="font-medium text-blue-500">同步中...</span>
        </div>
      )}

      {isSupabaseEnabled && !isOffline && !isSyncing && pendingChangesCount > 0 && (
        <div className="flex items-center gap-1.5 rounded bg-purple-600/10 px-2 py-1 transition-opacity hover:cursor-help hover:opacity-80" title={`${pendingChangesCount} 项变更等待同步`}>
          <span className="text-sm leading-none">⏳</span>
          <span className="font-medium text-purple-600">{pendingChangesCount} 项待同步</span>
        </div>
      )}

      {isSupabaseEnabled && !isOffline && !isSyncing && pendingChangesCount === 0 && lastSyncTime && (
        <div className="flex items-center gap-1.5 rounded bg-green-600/10 px-2 py-1 transition-opacity hover:cursor-help hover:opacity-80" title={`上次同步: ${formatLastSyncTime(lastSyncTime)}`}>
          <span className="text-sm leading-none">✓</span>
          <span className="font-medium text-green-600">已同步</span>
        </div>
      )}
    </div>
  )
}
