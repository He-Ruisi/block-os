import type { Block } from '@/types/models/block';
import type { BlockViewModel } from './types';

/**
 * 截断内容到指定长度
 */
function truncateContent(content: string, maxLength = 100): string {
  return content.length <= maxLength ? content : `${content.substring(0, maxLength)}...`;
}

/**
 * 将领域模型 Block 转换为 ViewModel
 */
export function toBlockViewModel(block: Block): BlockViewModel {
  return {
    id: block.id,
    title: block.metadata.title || block.content.substring(0, 30),
    content: block.content,
    preview: truncateContent(block.content),
    tags: block.metadata.tags,
    type: block.type,
  };
}

/**
 * 批量转换
 */
export function toBlockViewModels(blocks: Block[]): BlockViewModel[] {
  return blocks.map(toBlockViewModel);
}
