import type { PluginRegistryEntry } from '@/types/common/plugin'
import type { PluginWorkspaceViewModel } from './types'

/**
 * 将 PluginRegistryEntry 转换为 PluginWorkspaceViewModel
 */
export function toPluginWorkspaceViewModel(entry: PluginRegistryEntry): PluginWorkspaceViewModel {
  return {
    id: entry.metadata.id,
    name: entry.metadata.name,
    version: entry.metadata.version,
    description: entry.metadata.description,
    author: entry.metadata.author,
    icon: entry.metadata.icon || '🔌',
    permissions: entry.metadata.permissions,
    canShowSettings: Boolean(entry.instance?.renderSettings),
  }
}
