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

// 置顶项目
export interface StarredItem {
  id: string
  type: 'project' | 'document'
  name: string
  projectId?: string // 如果是文档，记录所属项目
  starredAt: Date
}
