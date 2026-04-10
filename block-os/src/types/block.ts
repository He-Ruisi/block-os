// Block 数据模型
export interface Block {
  id: string
  content: string
  type: 'text' | 'ai-generated' | 'heading' | 'list' | 'code'
  source: {
    type: 'editor' | 'ai'
    documentId?: string
    aiMessageId?: string
    capturedAt: Date
  }
  metadata: {
    title?: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }
  links?: {
    outgoing: string[]  // 引用的其他 blocks
    incoming: string[]  // 被哪些 blocks 引用
  }
  // 版本派生相关
  derivation?: {
    isDerivative: boolean      // 是否是派生版本
    sourceBlockId?: string     // 源 Block ID
    derivedFrom?: string       // 直接派生自哪个版本
    contextDocumentId?: string // 使用的文档/上下文
    contextTitle?: string      // 文档标题
    modifications?: string     // 修改说明
  }
}

// Block 派生版本
export interface BlockDerivative {
  id: string                   // 派生版本 ID
  sourceBlockId: string        // 源 Block ID
  content: string              // 修改后的内容
  contextDocumentId: string    // 使用的文档
  contextTitle: string         // 文档标题
  modifications: string        // 修改说明
  createdAt: Date
  createdBy: string            // 创建者（用户 ID）
}
