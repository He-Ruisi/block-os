import type { PluginRegistryEntry } from '@/types/common/plugin'
import type { PluginViewModel } from './types'

/**
 * 将 PluginRegistryEntry 转换为 PluginViewModel
 */
export function toPluginViewModel(entry: PluginRegistryEntry): PluginViewModel {
  return {
    id: entry.metadata.id,
    name: entry.metadata.name,
    description: entry.metadata.description,
    version: entry.metadata.version,
    icon: entry.metadata.icon || '🔌',
    status: entry.status,
    hasSettings: Boolean(entry.instance?.renderSettings),
  }
}

/**
 * 批量转换
 */
export function toPluginViewModels(entries: PluginRegistryEntry[]): PluginViewModel[] {
  return entries.map(toPluginViewModel)
}
