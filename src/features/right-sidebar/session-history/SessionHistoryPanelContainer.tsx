import type { Session } from '@/types/models/chat';
import { groupSessionsByDate, exportSessionAsJSON } from '@/features/ai';
import { sessionStore } from '@/storage/sessionStore';
import { toSessionGroupViewModels } from './mappers';
import { SessionHistoryPanelView } from './SessionHistoryPanelView';

interface SessionHistoryPanelContainerProps {
  sessions: Session[];
  currentSessionId: string;
  onSelect: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onRefresh: () => Promise<void>;
}

export function SessionHistoryPanelContainer({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onRefresh,
}: SessionHistoryPanelContainerProps) {
  // 删除处理
  const handleDelete = async (sessionId: string) => {
    await sessionStore.deleteSession(sessionId);
    await onRefresh();
    onDelete(sessionId);
  };

  // 导出处理
  const handleExport = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      exportSessionAsJSON(session);
    }
  };

  // 选择处理
  const handleSelect = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      onSelect(session);
    }
  };

  // 转换为 ViewModel
  const groupViewModels = toSessionGroupViewModels(sessions, currentSessionId, groupSessionsByDate);

  return (
    <SessionHistoryPanelView
      groups={groupViewModels}
      onSelect={handleSelect}
      onDelete={handleDelete}
      onExport={handleExport}
    />
  );
}
