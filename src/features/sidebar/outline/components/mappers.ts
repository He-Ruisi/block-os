import type { OutlineItem } from '../hooks/useOutline'
import type { OutlineItemViewModel } from './types'

/**
 * 将 OutlineItem 转换为 OutlineItemViewModel
 */
export function toOutlineItemViewModel(item: OutlineItem): OutlineItemViewModel {
  return {
    id: item.id,
    level: item.level,
    text: item.text,
  }
}

/**
 * 批量转换
 */
export function toOutlineItemViewModels(items: OutlineItem[]): OutlineItemViewModel[] {
  return items.map(toOutlineItemViewModel)
}
