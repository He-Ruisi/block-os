import { useExtensions } from '../hooks/useExtensions'
import { ExtensionsView } from './ExtensionsView'
import { toPluginViewModels } from './mappers'

interface ExtensionsContainerProps {
  onOpenPlugin: (pluginId: string) => void
  onOpenPluginSettings: (pluginId: string) => void
}

export function ExtensionsContainer({
  onOpenPlugin,
  onOpenPluginSettings,
}: ExtensionsContainerProps) {
  const { plugins, handleUninstall } = useExtensions()

  const pluginViewModels = toPluginViewModels(plugins)

  return (
    <ExtensionsView
      plugins={pluginViewModels}
      onOpenPlugin={onOpenPlugin}
      onOpenPluginSettings={onOpenPluginSettings}
      onUninstall={handleUninstall}
    />
  )
}
