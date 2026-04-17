// ViewModel 类型定义
export interface SessionViewModel {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
  isActive: boolean;
}

export interface SessionGroupViewModel {
  date: string;
  label: string;
  sessions: SessionViewModel[];
}
