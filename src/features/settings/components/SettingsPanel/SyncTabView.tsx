// 同步标签页 View

import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-6">
      {/* 同步模式 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">同步模式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
            {isSupabaseEnabled ? (
              <>
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Cloud className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">云端同步模式</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    数据自动同步到 Supabase，支持多设备协作
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">本地模式</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    数据仅保存在本地 IndexedDB，不同步到云端
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 云端同步功能 */}
      {isSupabaseEnabled && syncState && (
        <>
          {/* 同步状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">同步状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">网络状态</span>
                <Badge
                  variant={syncState.isOnline ? 'default' : 'secondary'}
                  className={cn(
                    syncState.isOnline && 'bg-green-500 hover:bg-green-600'
                  )}
                >
                  {syncState.isOnline ? '在线' : '离线'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">同步状态</span>
                <Badge
                  variant={syncState.isSyncing ? 'default' : 'secondary'}
                  className={cn(
                    syncState.isSyncing && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {syncState.isSyncing ? '同步中...' : '空闲'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">上次同步</span>
                <span className="text-sm">{syncState.lastSyncTime}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">待同步项</span>
                <Badge
                  variant={syncState.pendingChangesCount > 0 ? 'default' : 'secondary'}
                  className={cn(
                    syncState.pendingChangesCount > 0 && 'bg-purple-500 hover:bg-purple-600'
                  )}
                >
                  {syncState.pendingChangesCount} 项
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 同步操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">同步操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={onManualSync}
                disabled={!syncState.isOnline || syncState.isSyncing || isSyncing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
                <span>{isSyncing ? '同步中...' : '立即同步'}</span>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                自动同步每 30 秒检查一次待同步项
              </p>
            </CardContent>
          </Card>

          {/* 同步配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">同步配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">自动同步间隔</span>
                <span className="text-sm">30 秒</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">离线模式</span>
                <span className="text-sm">
                  {syncState.isOnline ? '未启用' : '已启用（网络离线）'}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 本地模式提示 */}
      {!isSupabaseEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">启用云端同步</CardTitle>
            <CardDescription>
              要启用云端同步，请在 <code className="text-xs">.env</code> 文件中配置 Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              <code>{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}</code>
            </pre>
            <p className="text-xs text-muted-foreground">
              配置后重启开发服务器即可启用云端同步功能
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
