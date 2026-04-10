// 项目数据模型
export interface Project {
  id: string
  name: string
  description?: string
  documents: string[] // 文档 ID 列表
  metadata: {
    createdAt: Date
    updatedAt: Date
    color?: string // 项目颜色标记
    icon?: string  // 项目图标
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
