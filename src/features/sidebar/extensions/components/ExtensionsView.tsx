import { Puzzle, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8">
        <EmptyState compact icon={Puzzle} title="暂无插件" description="插件会在应用启动时自动注册，安装后会显示在这里。" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="section-label w-fit">
        <span className="section-label__dot" />
        <span className="section-label__text">Extensions</span>
      </div>

      <div className="space-y-3">
        {plugins.map(plugin => (
          <Card key={plugin.id} className="bg-background/90">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-xl text-primary">
                  {plugin.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{plugin.name}</CardTitle>
                  <CardDescription>{plugin.description}</CardDescription>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        plugin.status === 'active' && 'bg-[rgb(var(--accent-green-rgb)_/_0.08)] text-[var(--accent-green-dark-hex)]',
                        plugin.status === 'error' && 'bg-destructive/10 text-destructive',
                        plugin.status === 'installed' && 'bg-primary/[0.08] text-primary',
                        plugin.status === 'inactive' && 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {plugin.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenPlugin(plugin.id)}>
                打开
              </Button>
              {plugin.hasSettings && (
                <Button variant="outline" size="sm" onClick={() => onOpenPluginSettings(plugin.id)}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onUninstall(plugin.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
