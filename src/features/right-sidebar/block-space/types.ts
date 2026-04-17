// ViewModel 类型定义
export interface BlockViewModel {
  id: string;
  title: string;
  content: string;
  preview: string;
  tags: string[];
  type: string;  // 使用 string 而不是限制类型
}

export interface BlockSpaceStats {
  totalBlocks: number;
  filteredBlocks: number;
  allTags: string[];
}
