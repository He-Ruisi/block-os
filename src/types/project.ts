// 项目数据模型
export interface Project {
  id: string
  name: string
  description?: string
  icon?: string | React.ReactNode // 项目图标（字符串或 React 组件）
  documents: string[] // 文档 ID 列表
  metadata: {
    createdAt: Date
    updatedAt: Date
    color?: string // 项目颜色标记
    icon?: string  // 项目图标（已废弃，使用顶层 icon）
  }
}

// 标签页数据模型
export interface Tab {
  id: string
  type: 'today' | 'project' | 'document'
  projectId?: string
  documentId?: string
  title: string
  isDirty: boolean // 是否有未保存的更改
}
