// View 组件 - 负责纯渲染

import { X, User, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountTabView } from './AccountTabView';
import { SyncTabView } from './SyncTabView';
import type { SettingsPanelViewProps } from './types';

export function SettingsPanelView({
  username,
  userId,
  activeTab,
  isSupabaseEnabled,
  syncState,
  isSyncing,
  onClose,
  onSignOut,
  onTabChange,
  onManualSync,
}: SettingsPanelViewProps) {
  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">设置</h2>
          <button className="settings-panel__close" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-panel__tabs">
          <button
            className={cn(
              'settings-panel__tab',
              activeTab === 'account' && 'settings-panel__tab--active'
            )}
            onClick={() => onTabChange('account')}
          >
            <User size={16} />
            <span>账号</span>
          </button>
          <button
            className={cn(
              'settings-panel__tab',
              activeTab === 'sync' && 'settings-panel__tab--active'
            )}
            onClick={() => onTabChange('sync')}
          >
            <Cloud size={16} />
            <span>同步</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-panel__content">
          {activeTab === 'account' && (
            <AccountTabView
              username={username}
              userId={userId}
              onSignOut={onSignOut}
            />
          )}

          {activeTab === 'sync' && (
            <SyncTabView
              isSupabaseEnabled={isSupabaseEnabled}
              syncState={syncState}
              isSyncing={isSyncing}
              onManualSync={onManualSync}
            />
          )}
        </div>
      </div>
    </div>
  );
}
