import { pluginRegistry } from '@/services/core/pluginRegistry'
import { PluginWorkspaceView } from './PluginWorkspaceView'
import { toPluginWorkspaceViewModel } from './mappers'

interface PluginWorkspaceContainerProps {
  pluginId: string
  showSettings: boolean
  onClose: () => void
  onToggleSettings: () => void
}

export function PluginWorkspaceContainer({
  pluginId,
  showSettings,
  onClose,
  onToggleSettings,
}: PluginWorkspaceContainerProps) {
  // 从所有插件中找到对应的 entry
  const pluginEntry = pluginRegistry.getAllPlugins().find(entry => entry.metadata.id === pluginId)

  if (!pluginEntry || !pluginEntry.instance) {
    return (
      <PluginWorkspaceView
        plugin={null}
        showSettings={showSettings}
        onClose={onClose}
        onToggleSettings={onToggleSettings}
        renderWorkspace={() => null}
        renderSettings={() => null}
      />
    )
  }

  const pluginViewModel = toPluginWorkspaceViewModel(pluginEntry)

  return (
    <PluginWorkspaceView
      plugin={pluginViewModel}
      showSettings={showSettings}
      onClose={onClose}
      onToggleSettings={onToggleSettings}
      renderWorkspace={() => pluginEntry.instance!.render()}
      renderSettings={() => pluginEntry.instance!.renderSettings?.() || null}
    />
  )
}
