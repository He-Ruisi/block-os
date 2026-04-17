// ViewModel 类型定义
export interface BlockSummaryViewModel {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  contextTitle?: string;
  modifications?: string;
}

export interface DerivativeTreeViewModel {
  source: BlockSummaryViewModel;
  derivatives: BlockSummaryViewModel[];
}
