// ViewModel 类型定义
export interface BlockViewModel {
  id: string;
  nodeType: string;
  content: string;
  links: string[];
  index: number;
}

export interface DocumentBlocksStats {
  totalBlocks: number;
  totalLinks: number;
}
