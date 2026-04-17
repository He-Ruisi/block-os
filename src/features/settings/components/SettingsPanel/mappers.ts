// 数据转换层

import type { SyncStateViewModel } from './types';

/**
 * 格式化最后同步时间
 */
export function formatLastSyncTime(time: Date | null): string {
  if (!time) return '从未同步';
  
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;

  return time.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 将 useAutoSync 返回的数据转换为 ViewModel
 */
export function toSyncStateViewModel(syncState: {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChangesCount: number;
  hasPendingChanges: boolean;
}): SyncStateViewModel {
  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    lastSyncTime: formatLastSyncTime(syncState.lastSyncTime),
    pendingChangesCount: syncState.pendingChangesCount,
    hasPendingChanges: syncState.hasPendingChanges,
  };
}
