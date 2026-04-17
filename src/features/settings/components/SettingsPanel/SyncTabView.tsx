// 同步标签页 View

import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SyncStateViewModel } from './types';

interface SyncTabViewProps {
  isSupabaseEnabled: boolean;
  syncState: SyncStateViewModel | null;
  isSyncing: boolean;
  onManualSync: () => void;
}

export function SyncTabView({
  isSupabaseEnabled,
  syncState,
  isSyncing,
  onManualSync,
}: SyncTabViewProps) {
  return (
    <div className="settings-panel__section">
      {/* 同步模式 */}
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

      {/* 云端同步功能 */}
      {isSupabaseEnabled && syncState && (
        <>
          {/* 同步状态 */}
          <div className="settings-panel__group">
            <h3 className="settings-panel__group-title">同步状态</h3>
            <div className="settings-panel__sync-status-card">
              <div className="settings-panel__sync-status-row">
                <span className="settings-panel__sync-status-label">网络状态</span>
                <span
                  className={cn(
                    'settings-panel__sync-status-badge',
                    !syncState.isOnline
                      ? 'settings-panel__sync-status-badge--offline'
                      : 'settings-panel__sync-status-badge--online'
                  )}
                >
                  {syncState.isOnline ? '在线' : '离线'}
                </span>
              </div>
              <div className="settings-panel__sync-status-row">
                <span className="settings-panel__sync-status-label">同步状态</span>
                <span
                  className={cn(
                    'settings-panel__sync-status-badge',
                    syncState.isSyncing
                      ? 'settings-panel__sync-status-badge--syncing'
                      : 'settings-panel__sync-status-badge--idle'
                  )}
                >
                  {syncState.isSyncing ? '同步中...' : '空闲'}
                </span>
              </div>
              <div className="settings-panel__sync-status-row">
                <span className="settings-panel__sync-status-label">上次同步</span>
                <span className="settings-panel__sync-status-value">
                  {syncState.lastSyncTime}
                </span>
              </div>
              <div className="settings-panel__sync-status-row">
                <span className="settings-panel__sync-status-label">待同步项</span>
                <span
                  className={cn(
                    'settings-panel__sync-status-badge',
                    syncState.pendingChangesCount > 0
                      ? 'settings-panel__sync-status-badge--pending'
                      : 'settings-panel__sync-status-badge--synced'
                  )}
                >
                  {syncState.pendingChangesCount} 项
                </span>
              </div>
            </div>
          </div>

          {/* 同步操作 */}
          <div className="settings-panel__group">
            <h3 className="settings-panel__group-title">同步操作</h3>
            <button
              className="settings-panel__button settings-panel__button--primary"
              onClick={onManualSync}
              disabled={!syncState.isOnline || syncState.isSyncing || isSyncing}
            >
              <RefreshCw size={16} className={isSyncing ? 'settings-panel__spinning' : ''} />
              <span>{isSyncing ? '同步中...' : '立即同步'}</span>
            </button>
            <div className="settings-panel__hint">自动同步每 30 秒检查一次待同步项</div>
          </div>

          {/* 同步配置 */}
          <div className="settings-panel__group">
            <h3 className="settings-panel__group-title">同步配置</h3>
            <div className="settings-panel__item">
              <div className="settings-panel__item-label">自动同步间隔</div>
              <div className="settings-panel__item-value">30 秒</div>
            </div>
            <div className="settings-panel__item">
              <div className="settings-panel__item-label">离线模式</div>
              <div className="settings-panel__item-value">
                {syncState.isOnline ? '未启用' : '已启用（网络离线）'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 本地模式提示 */}
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
          <div className="settings-panel__hint">配置后重启开发服务器即可启用云端同步功能</div>
        </div>
      )}
    </div>
  );
}
