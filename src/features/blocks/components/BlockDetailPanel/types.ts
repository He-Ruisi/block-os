// ViewModel 类型定义
export interface BlockDetailViewModel {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  createdAt: string;
}

export interface ReleaseViewModel {
  version: number;
  title: string;
  content: string;
  releasedAt: string;
}

export interface UsageViewModel {
  id: string;
  documentTitle: string;
  releaseVersion: number;
  insertedAt: string;
}

export interface BlockDetailStats {
  totalReleases: number;
  totalUsages: number;
}
