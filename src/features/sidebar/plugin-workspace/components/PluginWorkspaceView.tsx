import { ArrowLeft, ChevronRight, PanelTop, Settings, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PluginWorkspaceViewModel } from './types'

interface PluginWorkspaceViewProps {
  plugin: PluginWorkspaceViewModel | null
  showSettings: boolean
  onClose: () => void
  onToggleSettings: () => void
  renderWorkspace: () => React.ReactNode
  renderSettings: () => React.ReactNode
}

export function PluginWorkspaceView({
  plugin,
  showSettings,
  onClose,
  onToggleSettings,
  renderWorkspace,
  renderSettings,
}: PluginWorkspaceViewProps) {
  if (!plugin) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2">返回插件列表</span>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          插件未找到或尚未加载完成
        </div>
      </div>
    )
  }

  const currentTab = showSettings ? 'settings' : 'workspace'

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-6 py-3 text-sm text-muted-foreground">
          <button
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <ArrowLeft size={15} />
            <span>插件列表</span>
          </button>
          <ChevronRight size={14} />
          <span>{plugin.name}</span>
          <ChevronRight size={14} />
          <span>{showSettings ? '设置页' : '工作台'}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-2xl shadow-sm">
              {plugin.icon}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 text-xl font-semibold text-foreground">{plugin.name}</h1>
                <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                  v{plugin.version}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  插件工作台
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {plugin.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-background px-2 py-1">ID: {plugin.id}</span>
                <span className="rounded-md bg-background px-2 py-1">作者: {plugin.author}</span>
                <span className="rounded-md bg-background px-2 py-1">
                  权限: {plugin.permissions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">返回插件列表</span>
            </Button>
            {plugin.canShowSettings && (
              <Button variant="outline" onClick={onToggleSettings}>
                <Settings className="h-4 w-4" />
                <span className="ml-2">{showSettings ? '查看工作台' : '查看设置'}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 pb-4">
          <Tabs value={currentTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger
                value="workspace"
                onClick={() => {
                  if (showSettings) {
                    onToggleSettings()
                  }
                }}
                className="gap-2"
              >
                <Workflow size={16} />
                <span>插件页</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                disabled={!plugin.canShowSettings}
                onClick={() => {
                  if (plugin.canShowSettings && !showSettings) {
                    onToggleSettings()
                  }
                }}
                className="gap-2"
              >
                <PanelTop size={16} />
                <span>设置页</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {showSettings ? renderSettings() : renderWorkspace()}
      </div>
    </div>
  )
}
