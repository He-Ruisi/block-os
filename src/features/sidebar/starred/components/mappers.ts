import type { StarredItem } from '@/types/common/layout'
import type { StarredItemViewModel } from './types'

/**
 * 将 StarredItem 转换为 StarredItemViewModel
 */
export function toStarredItemViewModel(
  item: StarredItem,
  displayName: string
): StarredItemViewModel {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    displayName,
    projectId: item.projectId,
    starredAt: item.starredAt,
  }
}

/**
 * 批量转换
 */
export function toStarredItemViewModels(
  items: StarredItem[],
  itemNames: Record<string, string>
): StarredItemViewModel[] {
  return items.map(item => toStarredItemViewModel(item, itemNames[item.id] || item.name))
}
