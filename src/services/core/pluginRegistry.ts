// src/services/pluginRegistry.ts

import type { IPlugin, PluginRegistryEntry, PluginStatus } from '../../types/common/plugin'
import type { IPluginAPI } from './pluginAPI'

/** 插件注册表（单例） */
export class PluginRegistry {
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private pluginAPI: IPluginAPI | null = null
  
  /** 设置插件 API 实例 */
  setPluginAPI(api: IPluginAPI): void {
    this.pluginAPI = api
  }
  
  /** 注册插件 */
  async registerPlugin(pluginClass: new (api: IPluginAPI) => IPlugin): Promise<void> {
    if (!this.pluginAPI) {
      throw new Error('PluginAPI not initialized')
    }
    
    const instance = new pluginClass(this.pluginAPI)
    const metadata = instance.metadata
    
    if (this.plugins.has(metadata.id)) {
      throw new Error(`Plugin "${metadata.id}" is already registered`)
    }
    
    const entry: PluginRegistryEntry = {
      metadata,
      instance,
      status: 'installed',
      installedAt: new Date(),
    }
    
    this.plugins.set(metadata.id, entry)
    
    // 自动激活
    await this.activatePlugin(metadata.id)
  }
  
  /** 激活插件 */
  async activatePlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId)
    if (!entry) throw new Error(`Plugin "${pluginId}" not found`)
    if (!entry.instance) throw new Error(`Plugin "${pluginId}" instance not available`)
    
    try {
      await entry.instance.activate()
      entry.status = 'active'
      entry.lastActivatedAt = new Date()
      entry.error = undefined
    } catch (error) {
      entry.status = 'error'
      entry.error = (error as Error).message
      throw error
    }
  }
  
  /** 停用插件 */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId)
    if (!entry) throw new Error(`Plugin "${pluginId}" not found`)
    if (!entry.instance) throw new Error(`Plugin "${pluginId}" instance not available`)
    
    try {
      await entry.instance.deactivate()
      entry.status = 'inactive'
    } catch (error) {
      entry.status = 'error'
      entry.error = (error as Error).message
      throw error
    }
  }
  
  /** 卸载插件 */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId)
    if (!entry) throw new Error(`Plugin "${pluginId}" not found`)
    
    if (entry.status === 'active') {
      await this.deactivatePlugin(pluginId)
    }
    
    // 清理插件配置
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(`plugin:${pluginId}:`)) {
        localStorage.removeItem(key)
      }
    })
    
    this.plugins.delete(pluginId)
  }
  
  /** 获取插件实例 */
  getPlugin(pluginId: string): IPlugin | null {
    return this.plugins.get(pluginId)?.instance || null
  }
  
  /** 获取所有插件 */
  getAllPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }
  
  /** 获取插件状态 */
  getPluginStatus(pluginId: string): PluginStatus | null {
    return this.plugins.get(pluginId)?.status || null
  }
}

/** 全局插件注册表实例 */
export const pluginRegistry = new PluginRegistry()
