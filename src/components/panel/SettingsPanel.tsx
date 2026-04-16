import { useState } from 'react'
import { X, Cloud, HardDrive, User, LogOut, RefreshCw } from 'lucide-react'
import { useAutoSync } from '../../hooks/useAutoSync'
import { autoSyncService } from '../../services/integration/autoSyncService'
import { isSupabaseEnabled } from '../../lib/supabase'
import '../../styles/modules/panels.css'

interface SettingsPanelProps {
  username: string
  onClose: () => void
  onSignOut: () => void
  userId: string
}

export function SettingsPanel({ username, onClose, onSignOut, userId }: SettingsPanelProps) {
  const syncState = useAutoSync()
  const [activeTab, setActiveTab] = useState<'account' | 'sync'>('account')
  const [isSyncing, setIsSyncing] = useState(false)

  const handleManualSync = async () => {
    if (!isSupabaseEnabled || syncState.isOffline) return

    setIsSyncing(true)
    try {
      await autoSyncService.syncNow(userId)
    } catch (error) {
      console.error('手动同步失败:', error)
    } finally {
      setIsSyncing(false)
    }
  }

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

    return time.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">设置</h2>
          <button className="settings-panel__close" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="settings-panel__tabs">
          <button
            className={`settings-panel__tab ${activeTab === 'account' ? 'settings-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <User size={16} />
            <span>账号</span>
          </button>
          <button
            className={`settings-panel__tab ${activeTab === 'sync' ? 'settings-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('sync')}
          >
            <Cloud size={16} />
            <span>同步</span>
          </button>
        </div>

        <div className="settings-panel__content">
          {activeTab === 'account' && (
            <div className="settings-panel__section">
              <div className="settings-panel__group">
                <h3 className="settings-panel__group-title">账号信息</h3>
                <div className="settings-panel__item">
                  <div className="settings-panel__item-label">用户名</div>
                  <div className="settings-panel__item-value">{username}</div>
                </div>
                <div className="settings-panel__item">
                  <div className="settings-panel__item-label">用户 ID</div>
                  <div className="settings-panel__item-value settings-panel__item-value--user-id">{userId}</div>
                </div>
              </div>

              <div className="settings-panel__group">
                <h3 className="settings-panel__group-title">账号操作</h3>
                <button className="settings-panel__button settings-panel__button--danger" onClick={onSignOut}>
                  <LogOut size={16} />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="settings-panel__section">
              <div className="settings-panel__group">
                <h3 className="settings-panel__group-title">同步模式</h3>
                <div className="settings-panel__sync-mode-card">
                  {isSupabaseEnabled ? (
                    <>
                      <div className="settings-panel__sync-mode-icon settings-panel__sync-mode-icon--cloud">
                        <Cloud size={24} />
                      </div>
                      <div className="settings-panel__sync-mode-info">
                        <div className="settings-panel__sync-mode-title">云端同步模式</div>
                        <div className="settings-panel__sync-mode-desc">
                          数据自动同步到 Supabase，支持多设备协作
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="settings-panel__sync-mode-icon settings-panel__sync-mode-icon--local">
                        <HardDrive size={24} />
                      </div>
                      <div className="settings-panel__sync-mode-info">
                        <div className="settings-panel__sync-mode-title">本地模式</div>
                        <div className="settings-panel__sync-mode-desc">
                          数据仅保存在本地 IndexedDB，不同步到云端
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isSupabaseEnabled && (
                <>
                  <div className="settings-panel__group">
                    <h3 className="settings-panel__group-title">同步状态</h3>
                    <div className="settings-panel__sync-status-card">
                      <div className="settings-panel__sync-status-row">
                        <span className="settings-panel__sync-status-label">网络状态</span>
                        <span className={`settings-panel__sync-status-badge ${syncState.isOffline ? 'settings-panel__sync-status-badge--offline' : 'settings-panel__sync-status-badge--online'}`}>
                          {syncState.isOffline ? '离线' : '在线'}
                        </span>
                      </div>
                      <div className="settings-panel__sync-status-row">
                        <span className="settings-panel__sync-status-label">同步状态</span>
                        <span className={`settings-panel__sync-status-badge ${syncState.isSyncing ? 'settings-panel__sync-status-badge--syncing' : 'settings-panel__sync-status-badge--idle'}`}>
                          {syncState.isSyncing ? '同步中...' : '空闲'}
                        </span>
                      </div>
                      <div className="settings-panel__sync-status-row">
                        <span className="settings-panel__sync-status-label">上次同步</span>
                        <span className="settings-panel__sync-status-value">
                          {formatLastSyncTime(syncState.lastSyncTime)}
                        </span>
                      </div>
                      <div className="settings-panel__sync-status-row">
                        <span className="settings-panel__sync-status-label">待同步项</span>
                        <span className={`settings-panel__sync-status-badge ${syncState.pendingChangesCount > 0 ? 'settings-panel__sync-status-badge--pending' : 'settings-panel__sync-status-badge--synced'}`}>
                          {syncState.pendingChangesCount} 项
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="settings-panel__group">
                    <h3 className="settings-panel__group-title">同步操作</h3>
                    <button
                      className="settings-panel__button settings-panel__button--primary"
                      onClick={handleManualSync}
                      disabled={syncState.isOffline || syncState.isSyncing || isSyncing}
                    >
                      <RefreshCw size={16} className={isSyncing ? 'settings-panel__spinning' : ''} />
                      <span>{isSyncing ? '同步中...' : '立即同步'}</span>
                    </button>
                    <div className="settings-panel__hint">
                      自动同步每 30 秒检查一次待同步项
                    </div>
                  </div>

                  <div className="settings-panel__group">
                    <h3 className="settings-panel__group-title">同步配置</h3>
                    <div className="settings-panel__item">
                      <div className="settings-panel__item-label">自动同步间隔</div>
                      <div className="settings-panel__item-value">30 秒</div>
                    </div>
                    <div className="settings-panel__item">
                      <div className="settings-panel__item-label">离线模式</div>
                      <div className="settings-panel__item-value">
                        {syncState.isOffline ? '已启用（网络离线）' : '未启用'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isSupabaseEnabled && (
                <div className="settings-panel__group">
                  <h3 className="settings-panel__group-title">启用云端同步</h3>
                  <div className="settings-panel__hint">
                    要启用云端同步，请在 <code>.env</code> 文件中配置 Supabase：
                  </div>
                  <pre className="settings-panel__code">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                  </pre>
                  <div className="settings-panel__hint">
                    配置后重启开发服务器即可启用云端同步功能
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
