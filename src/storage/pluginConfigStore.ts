// src/storage/pluginConfigStore.ts

/** 插件配置存储（基于 localStorage） */
export class PluginConfigStore {
  private prefix = 'plugin:'
  
  /** 获取插件配置 */
  get<T = unknown>(pluginId: string, key: string): T | null {
    const storageKey = `${this.prefix}${pluginId}:${key}`
    const value = localStorage.getItem(storageKey)
    return value ? JSON.parse(value) : null
  }
  
  /** 保存插件配置 */
  set<T = unknown>(pluginId: string, key: string, value: T): void {
    const storageKey = `${this.prefix}${pluginId}:${key}`
    localStorage.setItem(storageKey, JSON.stringify(value))
  }
  
  /** 删除插件配置 */
  remove(pluginId: string, key: string): void {
    const storageKey = `${this.prefix}${pluginId}:${key}`
    localStorage.removeItem(storageKey)
  }
  
  /** 获取插件所有配置 */
  getAll(pluginId: string): Record<string, unknown> {
    const prefix = `${this.prefix}${pluginId}:`
    const config: Record<string, unknown> = {}
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length)
        const value = localStorage.getItem(key)
        config[configKey] = value ? JSON.parse(value) : null
      }
    })
    
    return config
  }
  
  /** 清空插件所有配置 */
  clearAll(pluginId: string): void {
    const prefix = `${this.prefix}${pluginId}:`
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

export const pluginConfigStore = new PluginConfigStore()
