// 账号标签页 View

import { LogOut } from 'lucide-react';

interface AccountTabViewProps {
  username: string;
  userId: string;
  onSignOut: () => void;
}

export function AccountTabView({ username, userId, onSignOut }: AccountTabViewProps) {
  return (
    <div className="settings-panel__section">
      <div className="settings-panel__group">
        <h3 className="settings-panel__group-title">账号信息</h3>
        <div className="settings-panel__item">
          <div className="settings-panel__item-label">用户名</div>
          <div className="settings-panel__item-value">{username}</div>
        </div>
        <div className="settings-panel__item">
          <div className="settings-panel__item-label">用户 ID</div>
          <div className="settings-panel__item-value settings-panel__item-value--user-id">
            {userId}
          </div>
        </div>
      </div>

      <div className="settings-panel__group">
        <h3 className="settings-panel__group-title">账号操作</h3>
        <button
          className="settings-panel__button settings-panel__button--danger"
          onClick={onSignOut}
        >
          <LogOut size={16} />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );
}
