// 侧边栏视图类型
export type SidebarView = 'explorer' | 'search' | 'outline' | 'extensions'

// 插件清单（预留接口）
export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  activate: () => void
  deactivate: () => void
}
