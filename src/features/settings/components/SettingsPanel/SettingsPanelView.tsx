// View 组件 - 负责纯渲染

import { User, Cloud } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'account' | 'sync')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>账号</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span>同步</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="account" className="mt-0">
              <AccountTabView
                username={username}
                userId={userId}
                onSignOut={onSignOut}
              />
            </TabsContent>

            <TabsContent value="sync" className="mt-0">
              <SyncTabView
                isSupabaseEnabled={isSupabaseEnabled}
                syncState={syncState}
                isSyncing={isSyncing}
                onManualSync={onManualSync}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
