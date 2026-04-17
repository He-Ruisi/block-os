// 账号标签页 View

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccountTabViewProps {
  username: string;
  userId: string;
  onSignOut: () => void;
}

export function AccountTabView({ username, userId, onSignOut }: AccountTabViewProps) {
  return (
    <div className="space-y-6">
      {/* 账号信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">账号信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">用户名</span>
            <span className="text-sm font-medium">{username}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">用户 ID</span>
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {userId}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* 账号操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">账号操作</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>退出登录</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
