import { Puzzle, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shells/EmptyState'
import { cn } from '@/lib/utils'
import type { PluginViewModel } from './types'

interface ExtensionsViewProps {
  plugins: PluginViewModel[]
  onOpenPlugin: (pluginId: string) => void
  onOpenPluginSettings: (pluginId: string) => void
  onUninstall: (pluginId: string) => void
}

export function ExtensionsView({
  plugins,
  onOpenPlugin,
  onOpenPluginSettings,
  onUninstall,
}: ExtensionsViewProps) {
  if (plugins.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <h3 className="text-sm font-medium m-0">已安装插件</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <EmptyState
              icon={Puzzle}
              title="暂无插件"
              description="插件系统已就绪，插件将在应用启动时自动注册"
            />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-border">
        <h3 className="text-sm font-medium m-0">已安装插件</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {plugins.map(plugin => (
            <div
              key={plugin.id}
              className="flex flex-col gap-3 p-3 mb-2 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="text-2xl w-8 h-8 flex items-center justify-center shrink-0">
                  {plugin.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground mb-1">{plugin.name}</div>
                  <div className="text-xs text-muted-foreground mb-1.5 leading-relaxed break-words">
                    {plugin.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded font-medium uppercase',
                        plugin.status === 'active' &&
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        plugin.status === 'error' &&
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        plugin.status === 'installed' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        plugin.status === 'inactive' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {plugin.status}
                    </span>
                    <span className="text-muted-foreground">v{plugin.version}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPlugin(plugin.id)}
                  title="打开插件"
                >
                  打开
                </Button>
                {plugin.hasSettings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenPluginSettings(plugin.id)}
                    title="设置"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onUninstall(plugin.id)}
                  title="卸载"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
