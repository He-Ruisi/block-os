// ============================================================
// Block 数据模型 — 内容/样式/模板 三层解耦
// ============================================================

// ---------- 内容层（Content）：纯粹的意义 ----------

/** Block 来源信息，可追溯 */
export interface BlockSource {
  type: 'editor' | 'ai' | 'import'
  documentId?: string       // 来源文档
  aiMessageId?: string      // AI 消息 ID
  conversationId?: string   // AI 会话 ID
  originalPrompt?: string   // 触发 AI 的原始提示
  capturedAt: Date
}

/** 编辑历史条目 */
export interface BlockEditRecord {
  editedAt: Date
  editedBy: 'user' | 'ai'
  summary?: string          // 修改摘要
}

// ---------- 样式层（Style）：视觉表现配置 ----------

/** AI 块的视觉处理方式 */
export type AIBlockTreatment = 'accent-border' | 'subtle-bg' | 'invisible'

/** 单个 Block 的样式覆盖 */
export interface BlockStyle {
  aiBlockTreatment?: AIBlockTreatment   // AI 块显示方式
  showSourceLabel?: boolean             // 是否显示来源标签
  accentColor?: string                  // 强调色
  customClass?: string                  // 自定义 CSS 类名
}

// ---------- 模板层（Template）：结构角色 + 导出规则 ----------

/** Block 在文档结构中的角色 */
export type BlockRole = 'paragraph' | 'heading' | 'quote' | 'separator' | 'list' | 'code' | 'scene' | 'dialogue' | 'annotation'

/** 导出时对 AI 块的处理策略 */
export type AIBlockExportStrategy = 'merge-as-paragraph' | 'keep-as-quote' | 'remove'

/** 单个 Block 的模板属性 */
export interface BlockTemplate {
  role: BlockRole                        // 结构角色
  level?: number                         // heading 层级 (1-6)
  group?: string                         // 分组/章节标识
  order?: number                         // 组内排序
  exportStrategy?: AIBlockExportStrategy // 导出时的处理策略
}

// ---------- 附属层（Annotations）：内容的空间维度 ----------

/** 附属层类型 */
export type AnnotationType = 'translation' | 'explanation' | 'comment' | 'footnote'

/** 单条附属记录（append-only log） */
export interface BlockAnnotation {
  id: string                // 记录 ID
  type: AnnotationType      // 附属类型
  content: string           // 附属内容
  language?: string         // 翻译目标语言（仅 translation 类型）
  source: 'user' | 'ai'    // 来源
  createdAt: Date
  /** 锚定信息：附属内容关联的原文片段 */
  anchor?: {
    text: string            // 锚定的原文片段
    from?: number           // 在主体 content 中的起始偏移（可选）
    to?: number             // 结束偏移（可选）
  }
}

/** Block 附属层集合 */
export interface BlockAnnotations {
  translation?: BlockAnnotation[]
  explanation?: BlockAnnotation[]
  comment?: BlockAnnotation[]
  footnote?: BlockAnnotation[]
}

// ---------- Block 主体 ----------

/** Block 版本快照（用户主动发布） */
export interface BlockRelease {
  version: number           // 自增版本号
  content: string           // 该版本的内容快照
  title: string             // 用户起的版本标题
  releasedAt: Date
}

/** Block 使用记录（独立存储，不内嵌在 Block 中） */
export interface BlockUsage {
  id: string                // usage 记录 ID
  blockId: string           // 引用的 Block ID
  releaseVersion: number    // 引用的 release 版本号
  documentId: string        // 使用该 Block 的文档 ID
  documentTitle: string     // 文档标题
  insertedAt: Date
}

export interface Block {
  id: string
  content: string
  type: 'text' | 'ai-generated' | 'heading' | 'list' | 'code'
  implicit?: boolean  // true = 隐式（不显示在 Block 空间）

  // 内容层
  source: BlockSource
  editHistory?: BlockEditRecord[]

  // 样式层（可选，未设置时使用全局默认）
  style?: BlockStyle

  // 模板层（可选，未设置时根据 type 推断）
  template?: BlockTemplate

  // 元数据
  metadata: {
    title?: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }

  // 关系
  links?: {
    outgoing: string[]
    incoming: string[]
  }

  // 版本派生
  derivation?: {
    isDerivative: boolean
    sourceBlockId?: string
    derivedFrom?: string
    contextDocumentId?: string
    contextTitle?: string
    modifications?: string
  }

  // 版本快照（用户主动发布的 release）
  releases?: BlockRelease[]

  // 附属层（不参与 release 版本管理，独立追踪）
  annotations?: BlockAnnotations
}

// Block 派生版本（保持兼容）
export interface BlockDerivative {
  id: string
  sourceBlockId: string
  content: string
  contextDocumentId: string
  contextTitle: string
  modifications: string
  createdAt: Date
  createdBy: string
}

// ============================================================
// 全局样式配置 + 文档模板
// ============================================================

/** 全局样式主题配置 */
export interface StyleTheme {
  id: string
  name: string                          // "编辑模式" | "预览模式" | "小说导出"
  aiBlockTreatment: AIBlockTreatment
  showSourceLabels: boolean
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  customCSS?: string
}

/** 文档导出模板 */
export interface DocumentTemplate {
  id: string
  name: string                          // "小说" | "博客" | "大纲" | "剧本"
  description?: string
  structure: TemplateStructureRule[]
  exportRules: TemplateExportRules
}

/** 模板结构规则 */
export interface TemplateStructureRule {
  role: BlockRole
  level?: number
  minBlocks?: number
  maxBlocks?: number
  optional?: boolean
}

/** 模板导出规则 */
export interface TemplateExportRules {
  aiBlocks: AIBlockExportStrategy
  indentFirstLine: boolean
  pageSize?: 'A4' | 'A5' | 'Letter'
  format: 'markdown' | 'html' | 'plain-text'
  includeMetadata?: boolean
  /** 导出时包含哪些附属层（默认不包含） */
  includeAnnotations?: AnnotationType[]
}

// ============================================================
// 预置样式主题
// ============================================================

export const DEFAULT_STYLE_THEMES: StyleTheme[] = [
  {
    id: 'editing',
    name: '编辑模式',
    aiBlockTreatment: 'accent-border',
    showSourceLabels: true,
  },
  {
    id: 'preview',
    name: '预览模式',
    aiBlockTreatment: 'invisible',
    showSourceLabels: false,
  },
  {
    id: 'review',
    name: '审阅模式',
    aiBlockTreatment: 'subtle-bg',
    showSourceLabels: true,
  },
]

// ============================================================
// 预置文档模板
// ============================================================

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'novel',
    name: '小说',
    description: '章节标题 + 正文段落，首行缩进，AI 块融入正文',
    structure: [
      { role: 'heading', level: 1 },
      { role: 'paragraph', minBlocks: 1 },
      { role: 'separator', optional: true },
    ],
    exportRules: {
      aiBlocks: 'merge-as-paragraph',
      indentFirstLine: true,
      pageSize: 'A4',
      format: 'plain-text',
    },
  },
  {
    id: 'blog',
    name: '博客',
    description: 'Markdown 格式，AI 块保留为引用块',
    structure: [
      { role: 'heading', level: 1 },
      { role: 'paragraph' },
      { role: 'quote', optional: true },
    ],
    exportRules: {
      aiBlocks: 'keep-as-quote',
      indentFirstLine: false,
      format: 'markdown',
    },
  },
  {
    id: 'outline',
    name: '大纲',
    description: '纯结构 + 层级缩进，移除 AI 块',
    structure: [
      { role: 'heading', level: 1 },
      { role: 'heading', level: 2, optional: true },
      { role: 'list', optional: true },
    ],
    exportRules: {
      aiBlocks: 'remove',
      indentFirstLine: false,
      format: 'plain-text',
    },
  },
]
