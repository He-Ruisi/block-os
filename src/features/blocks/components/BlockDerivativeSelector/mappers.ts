import type { Block } from '@/types/models/block';
import { formatDateTime } from '@/utils/date';
import type { BlockSummaryViewModel, DerivativeTreeViewModel } from './types';

/**
 * 将领域模型 Block 转换为 BlockSummaryViewModel
 */
export function toBlockSummaryViewModel(block: Block): BlockSummaryViewModel {
  return {
    id: block.id,
    title: block.metadata.title || '无标题',
    content: block.content,
    tags: block.metadata.tags,
    createdAt: formatDateTime(block.metadata.createdAt),
    contextTitle: block.derivation?.contextTitle,
    modifications: block.derivation?.modifications,
  };
}

/**
 * 将派生树转换为 ViewModel
 */
export function toDerivativeTreeViewModel(tree: { source: Block; derivatives: Block[] }): DerivativeTreeViewModel {
  return {
    source: toBlockSummaryViewModel(tree.source),
    derivatives: tree.derivatives.map(toBlockSummaryViewModel),
  };
}
