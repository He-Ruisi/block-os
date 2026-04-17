import type { Block, BlockRelease, BlockUsage } from '@/types/models/block';
import { formatRelativeTime } from '@/utils/date';
import type { BlockDetailViewModel, ReleaseViewModel, UsageViewModel } from './types';

/**
 * 将领域模型 Block 转换为 BlockDetailViewModel
 */
export function toBlockDetailViewModel(block: Block): BlockDetailViewModel {
  return {
    id: block.id,
    title: block.metadata.title || 'Block 详情',
    content: block.content,
    type: block.type,
    tags: block.metadata.tags,
    createdAt: formatRelativeTime(block.metadata.createdAt),
  };
}

/**
 * 将 BlockRelease 转换为 ReleaseViewModel
 */
export function toReleaseViewModel(release: BlockRelease): ReleaseViewModel {
  return {
    version: release.version,
    title: release.title,
    content: release.content,
    releasedAt: formatRelativeTime(release.releasedAt),
  };
}

/**
 * 批量转换 releases
 */
export function toReleaseViewModels(releases: BlockRelease[]): ReleaseViewModel[] {
  return releases.map(toReleaseViewModel);
}

/**
 * 将 BlockUsage 转换为 UsageViewModel
 */
export function toUsageViewModel(usage: BlockUsage): UsageViewModel {
  return {
    id: usage.id,
    documentTitle: usage.documentTitle,
    releaseVersion: usage.releaseVersion,
    insertedAt: formatRelativeTime(usage.insertedAt),
  };
}

/**
 * 批量转换 usages
 */
export function toUsageViewModels(usages: BlockUsage[]): UsageViewModel[] {
  return usages.map(toUsageViewModel);
}
