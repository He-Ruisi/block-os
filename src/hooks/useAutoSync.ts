import { useState, useEffect } from 'react'
import { autoSyncService } from '../services/integration/autoSyncService'

export function useAutoSync() {
  const [syncState, setSyncState] = useState(autoSyncService.getState())

  useEffect(() => {
    // 订阅同步状态变化
    const unsubscribe = autoSyncService.subscribe(setSyncState)
    return unsubscribe
  }, [])

  return {
    isSyncing: syncState.isSyncing,
    isOnline: syncState.isOnline,
    lastSyncTime: syncState.lastSyncTime,
    pendingChangesCount: autoSyncService.getPendingChangesCount(),
    hasPendingChanges: autoSyncService.hasPendingChanges(),
    isOffline: autoSyncService.isOffline(),
  }
}
