import { useState, useEffect } from 'react'
import { Puzzle, Settings, Trash2, X } from 'lucide-react'
import { pluginRegistry } from '../../services/pluginRegistry'
import type { PluginRegistryEntry } from '../../types/plugin'
import './ExtensionsView.css'

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
        <div className="extensions-view">
          <div className="plugin-header">
            <h3>{plugin.metadata.name}</h3>
            <button className="plugin-close-btn" onClick={handleClose}>
              <X size={16} />
            </button>
          </div>
          <div className="plugin-content">
            {showSettings && plugin.renderSettings ? plugin.renderSettings() : plugin.render()}
          </div>
        </div>
      )
    }
  }
  
  // 插件列表视图
  return (
    <div className="extensions-view">
      <div className="extensions-header">
        <h3>已安装插件</h3>
      </div>
      
      {plugins.length === 0 ? (
        <div className="extensions-placeholder">
          <Puzzle size={48} className="extensions-icon" />
          <div className="extensions-title">暂无插件</div>
          <div className="extensions-hint">插件系统已就绪</div>
          <div className="extensions-desc">
            插件将在应用启动时自动注册
          </div>
        </div>
      ) : (
        <div className="plugins-list">
          {plugins.map(entry => (
            <div key={entry.metadata.id} className="plugin-item">
              <div className="plugin-info">
                <div className="plugin-icon">{entry.metadata.icon || '🔌'}</div>
                <div className="plugin-details">
                  <div className="plugin-name">{entry.metadata.name}</div>
                  <div className="plugin-description">{entry.metadata.description}</div>
                  <div className="plugin-meta">
                    <span className={`plugin-status plugin-status-${entry.status}`}>
                      {entry.status}
                    </span>
                    <span className="plugin-version">v{entry.metadata.version}</span>
                  </div>
                </div>
              </div>
              <div className="plugin-actions">
                <button
                  className="plugin-action-btn"
                  onClick={() => handleOpenPlugin(entry.metadata.id)}
                  title="打开插件"
                >
                  打开
                </button>
                {entry.instance?.renderSettings && (
                  <button
                    className="plugin-action-btn"
                    onClick={() => handleOpenSettings(entry.metadata.id)}
                    title="设置"
                  >
                    <Settings size={16} />
                  </button>
                )}
                <button
                  className="plugin-action-btn plugin-action-danger"
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
