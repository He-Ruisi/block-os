import { useState, useEffect } from 'react'
import { Puzzle, Settings, Trash2, X } from 'lucide-react'
import { pluginRegistry } from '../../services/pluginRegistry'
import type { PluginRegistryEntry } from '../../types/plugin'

export function ExtensionsView() {
  const [plugins, setPlugins] = useState<PluginRegistryEntry[]>([])
  const [activePluginId, setActivePluginId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  useEffect(() => {
    // 加载已安装的插件列表
    setPlugins(pluginRegistry.getAllPlugins())
  }, [])
  
  const handleUninstall = async (pluginId: string) => {
    if (!confirm('确定要卸载此插件吗？')) return
    
    try {
      await pluginRegistry.uninstallPlugin(pluginId)
      setPlugins(pluginRegistry.getAllPlugins())
      if (activePluginId === pluginId) {
        setActivePluginId(null)
      }
    } catch (err) {
      alert('卸载失败：' + (err as Error).message)
    }
  }
  
  const handleOpenPlugin = (pluginId: string) => {
    setActivePluginId(pluginId)
    setShowSettings(false)
  }
  
  const handleOpenSettings = (pluginId: string) => {
    setActivePluginId(pluginId)
    setShowSettings(true)
  }
  
  const handleClose = () => {
    setActivePluginId(null)
    setShowSettings(false)
  }
  
  // 如果有活动插件，渲染插件 UI
  if (activePluginId) {
    const plugin = pluginRegistry.getPlugin(activePluginId)
    if (plugin) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <h3 className="text-sm font-medium m-0">{plugin.metadata.name}</h3>
            <button className="p-1 border-none bg-transparent text-muted-foreground cursor-pointer rounded flex items-center justify-center transition-colors hover:bg-muted" onClick={handleClose}>
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {showSettings && plugin.renderSettings ? plugin.renderSettings() : plugin.render()}
          </div>
        </div>
      )
    }
  }
  
  // 插件列表视图
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-border">
        <h3 className="text-sm font-medium m-0">已安装插件</h3>
      </div>
      
      {plugins.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-5">
          <Puzzle size={48} className="mb-4 opacity-50 text-muted-foreground" />
          <div className="text-base font-semibold text-foreground mb-2">暂无插件</div>
          <div className="text-sm text-muted-foreground mb-3">插件系统已就绪</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            插件将在应用启动时自动注册
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          {plugins.map(entry => (
            <div key={entry.metadata.id} className="flex flex-col gap-3 p-3 mb-2 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-3 w-full">
                <div className="text-2xl w-8 h-8 flex items-center justify-center shrink-0">{entry.metadata.icon || '🔌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground mb-1">{entry.metadata.name}</div>
                  <div className="text-xs text-muted-foreground mb-1.5 leading-relaxed break-words">{entry.metadata.description}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded font-medium uppercase ${
                      entry.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      entry.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.status}
                    </span>
                    <span className="text-muted-foreground">v{entry.metadata.version}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full justify-end">
                <button
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer transition-colors flex items-center justify-center hover:bg-muted"
                  onClick={() => handleOpenPlugin(entry.metadata.id)}
                  title="打开插件"
                >
                  打开
                </button>
                {entry.instance?.renderSettings && (
                  <button
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs cursor-pointer transition-colors flex items-center justify-center hover:bg-muted"
                    onClick={() => handleOpenSettings(entry.metadata.id)}
                    title="设置"
                  >
                    <Settings size={16} />
                  </button>
                )}
                <button
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-destructive text-xs cursor-pointer transition-colors flex items-center justify-center hover:bg-destructive/10"
                  onClick={() => handleUninstall(entry.metadata.id)}
                  title="卸载"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
