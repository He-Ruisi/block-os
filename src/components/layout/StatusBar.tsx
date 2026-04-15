import { useAutoSync } from '../../hooks/useAutoSync'
import { Cloud, CloudOff, Save, FileText, Link } from 'lucide-react'
import { isSupabaseEnabled } from '../../lib/supabase'

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
    <div className="flex h-6 flex-shrink-0 items-center justify-between border-t border-border bg-secondary px-3 text-xs text-muted-foreground select-none">
      {/* 左侧：同步状态 */}
      <div className="flex items-center gap-3">
        {!isSupabaseEnabled ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-600 transition-colors hover:bg-muted" title="本地模式，数据仅保存在当前设备">
            <CloudOff size={14} />
            <span>本地模式</span>
          </div>
        ) : syncState.isOffline ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-orange-500 transition-colors hover:bg-muted" title="网络离线">
            <CloudOff size={14} />
            <span>离线</span>
          </div>
        ) : syncState.isSyncing ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-blue-500 transition-colors hover:bg-muted" title="正在同步到云端">
            <Cloud size={14} className="animate-spin" />
            <span>同步中</span>
          </div>
        ) : syncState.pendingChangesCount > 0 ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-purple-600 transition-colors hover:bg-muted" title={`${syncState.pendingChangesCount} 项待同步`}>
            <Cloud size={14} />
            <span>{syncState.pendingChangesCount} 项待同步</span>
          </div>
        ) : syncState.lastSyncTime ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-green-600 transition-colors hover:bg-muted" title="已同步到云端">
            <Cloud size={14} />
            <span>已同步</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-600 transition-colors hover:bg-muted" title="尚未执行过云端同步">
            <Cloud size={14} />
            <span>未同步</span>
          </div>
        )}
      </div>

      {/* 中间：自动保存状态 */}
      <div className="flex flex-1 items-center justify-center gap-3">
        {autoSaveStatus === 'saving' ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-blue-500 transition-colors hover:bg-muted" title="正在保存">
            <Save size={14} className="animate-spin" />
            <span>保存中...</span>
          </div>
        ) : autoSaveStatus === 'unsaved' ? (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-orange-500 transition-colors hover:bg-muted" title="有未保存的更改">
            <Save size={14} />
            <span>未保存</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded px-1.5 py-0.5 text-green-600 transition-colors hover:bg-muted" title={formatLastSaved(lastSaved)}>
            <Save size={14} />
            <span>{formatLastSaved(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* 右侧：文档统计 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-muted" title="字数">
          <FileText size={14} />
          <span>{wordCount.toLocaleString()} 字</span>
        </div>
        <div className="h-3.5 w-px bg-border" />
        <div className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-muted" title="引用块数量">
          <Link size={14} />
          <span>{blockCount} 块</span>
        </div>
        {linkCount > 0 && (
          <>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-muted" title="双向链接数量">
              <span>🔗 {linkCount} 链接</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
