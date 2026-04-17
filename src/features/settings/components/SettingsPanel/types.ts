// ViewModel 类型定义

export interface SyncStateViewModel {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string; // 格式化后的时间字符串
  pendingChangesCount: number;
  hasPendingChanges: boolean;
}

export interface SettingsPanelViewProps {
  username: string;
  userId: string;
  activeTab: 'account' | 'sync';
  isSupabaseEnabled: boolean;
  syncState: SyncStateViewModel | null;
  isSyncing: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onTabChange: (tab: 'account' | 'sync') => void;
  onManualSync: () => void;
}
