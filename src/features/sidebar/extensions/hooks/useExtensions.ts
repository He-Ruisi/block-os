import { useEffect, useState } from 'react'
import { pluginRegistry } from '@/services/core/pluginRegistry'
import type { PluginRegistryEntry } from '@/types/common/plugin'

export function useExtensions() {
  const [plugins, setPlugins] = useState<PluginRegistryEntry[]>([])

  useEffect(() => {
    // 加载已安装的插件列表
    setPlugins(pluginRegistry.getAllPlugins())
  }, [])

  const handleUninstall = async (pluginId: string) => {
    if (!confirm('确定要卸载此插件吗？')) return

    try {
      await pluginRegistry.uninstallPlugin(pluginId)
      setPlugins(pluginRegistry.getAllPlugins())
    } catch (err) {
      alert('卸载失败：' + (err as Error).message)
    }
  }

  return {
    plugins,
    handleUninstall,
  }
}
