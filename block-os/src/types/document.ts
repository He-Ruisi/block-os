// 文档数据模型
export interface Document {
  id: string
  title: string
  content: string // JSON 格式的编辑器内容
  blocks: DocumentBlock[] // 文档中的隐式 Block
  projectId?: string // 所属项目 ID（可选）
  metadata: {
    createdAt: Date
    updatedAt: Date
  }
}

// 文档中的隐式 Block
export interface DocumentBlock {
  id: string // Block ID
  nodeType: string // paragraph, heading, listItem 等
  content: string // 纯文本内容
  position: number // 在文档中的位置
  links: string[] // 该段落中的链接
}
