import type { SuggestionItem } from '@/features/editor/extensions/suggestion'
import type { SearchResultViewModel } from './types'

/**
 * 将 SuggestionItem 转换为 SearchResultViewModel
 */
export function toSearchResultViewModel(item: SuggestionItem): SearchResultViewModel {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
  }
}

/**
 * 批量转换
 */
export function toSearchResultViewModels(items: SuggestionItem[]): SearchResultViewModel[] {
  return items.map(toSearchResultViewModel)
}
