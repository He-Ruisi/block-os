import type { Session } from '@/types/models/chat';
import type { SessionViewModel, SessionGroupViewModel } from './types';

/**
 * 格式化时间
 */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 将领域模型 Session 转换为 SessionViewModel
 */
export function toSessionViewModel(session: Session, currentSessionId: string): SessionViewModel {
  return {
    id: session.id,
    title: session.title,
    messageCount: session.messages.length,
    updatedAt: formatTime(session.updatedAt),
    isActive: session.id === currentSessionId,
  };
}

/**
 * 批量转换并分组
 */
export function toSessionGroupViewModels(
  sessions: Session[],
  currentSessionId: string,
  groupFn: (sessions: Session[]) => Array<{ date: string; label: string; sessions: Session[] }>
): SessionGroupViewModel[] {
  const groups = groupFn(sessions);
  
  return groups.map(group => ({
    date: group.date,
    label: group.label,
    sessions: group.sessions.map(session => toSessionViewModel(session, currentSessionId)),
  }));
}
