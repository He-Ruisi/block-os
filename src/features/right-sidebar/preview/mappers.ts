import type { Block } from '@/types/models/block';
import type { PreviewBlockViewModel } from './types';

/**
 * 将领域模型 Block 转换为 PreviewBlockViewModel
 */
export function toPreviewBlockViewModel(block: Block): PreviewBlockViewModel {
  return {
    id: block.id,
    content: block.content,
    type: block.type,
  };
}

/**
 * 批量转换
 */
export function toPreviewBlockViewModels(blocks: Block[]): PreviewBlockViewModel[] {
  return blocks.map(toPreviewBlockViewModel);
}

/**
 * 获取模板名称
 */
export function getTemplateName(id: string): string {
  const names: Record<string, string> = {
    'novel': '小说',
    'blog': '博客',
    'outline': '大纲',
  };
  return names[id] || id;
}

/**
 * 获取模式名称
 */
export function getModeName(id: string): string {
  const names: Record<string, string> = {
    'preview': '预览模式',
    'review': '审阅模式',
    'editing': '编辑模式',
  };
  return names[id] || id;
}
