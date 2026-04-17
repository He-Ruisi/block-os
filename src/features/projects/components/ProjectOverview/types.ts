import type { ReactNode } from 'react';

export interface ProjectViewModel {
  id: string;
  name: string;
  description?: string;
  icon?: string | ReactNode;
  documentCount: number;
  blockReferenceCount: number;
  updatedAt: string;
}

export type SortBy = 'activity' | 'name' | 'documents';
