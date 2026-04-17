// Container 组件 - 负责业务逻辑和数据编排

import { useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { autoSyncService } from '@/services/integration/autoSyncService';
import { isSupabaseEnabled } from '@/lib/supabase';
import { SettingsPanelView } from './SettingsPanelView';
import { toSyncStateViewModel } from './mappers';

interface SettingsPanelContainerProps {
  username: string;
  userId: string;
  onClose: () => void;
  onSignOut: () => void;
}

export function SettingsPanelContainer({
  username,
  userId,
  onClose,
  onSignOut,
}: SettingsPanelContainerProps) {
  // 1. Hooks（数据接入层）
  const syncState = useAutoSync();
  const [activeTab, setActiveTab] = useState<'account' | 'sync'>('account');
  const [isSyncing, setIsSyncing] = useState(false);

  // 2. 数据转换为 ViewModel
  const syncStateViewModel = isSupabaseEnabled
    ? toSyncStateViewModel({
        isOnline: !syncState.isOffline,
        isSyncing: syncState.isSyncing,
        lastSyncTime: syncState.lastSyncTime,
        pendingChangesCount: syncState.pendingChangesCount,
        hasPendingChanges: syncState.hasPendingChanges,
      })
    : null;

  // 3. 事件处理
  const handleManualSync = async () => {
    if (!isSupabaseEnabled || syncState.isOffline) return;

    setIsSyncing(true);
    try {
      await autoSyncService.syncNow(userId);
    } catch (error) {
      console.error('手动同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. 渲染 View
  return (
    <SettingsPanelView
      username={username}
      userId={userId}
      activeTab={activeTab}
      isSupabaseEnabled={isSupabaseEnabled}
      syncState={syncStateViewModel}
      isSyncing={isSyncing}
      onClose={onClose}
      onSignOut={onSignOut}
      onTabChange={setActiveTab}
      onManualSync={handleManualSync}
    />
  );
}
