# ADR: 内容/样式/模板三层解耦 + 附属层

**状态**: 已实施  
**日期**: 2026-04-11  
**版本**: v0.9.0

## 背景

Block 的数据模型最初是扁平的——content、type、source、metadata 全部混在一起。AI 块的"AI 来源"既是内容属性（这段来自 AI），又是样式属性（金色左边框），还是模板属性（导出时可以被转为正文）。这导致：

- 用户改写 AI 内容后，来源信息丢失
- 预览模式只能"去掉标记"，无法"换一套样式"
- 导出时无法区分 AI 内容和用户内容，无法按策略处理

## 决策

将 Block 数据模型拆分为三层，每层独立变化、互不干扰。

### 内容层（Content）

纯粹的意义。包括文本内容和来源追溯信息。

```typescript
interface BlockSource {
  type: 'editor' | 'ai' | 'import'
  aiMessageId?: string
  conversationId?: string
  capturedAt: Date
}

interface BlockEditRecord {
  editedAt: Date
  editedBy: 'user' | 'ai'
  summary?: string
}
```

用户改写 AI 内容后，`source` 信息保留（可追溯），`editHistory` 记录修改历史。

### 样式层（Style）

视觉表现配置。与内容身份解耦。

```typescript
type AIBlockTreatment = 'accent-border' | 'subtle-bg' | 'invisible'

interface BlockStyle {
  aiBlockTreatment?: AIBlockTreatment
  showSourceLabel?: boolean
  accentColor?: string
}

interface StyleTheme {
  id: string              // 'editing' | 'preview' | 'review'
  name: string
  aiBlockTreatment: AIBlockTreatment
  showSourceLabels: boolean
}
```

预置三套主题：编辑模式（金色边框+标签）、预览模式（隐藏标记）、审阅模式（淡背景+标签）。

### 模板层（Template）

结构角色和导出规则。

```typescript
type BlockRole = 'paragraph' | 'heading' | 'quote' | 'separator' | 'list' | 'code'
type AIBlockExportStrategy = 'merge-as-paragraph' | 'keep-as-quote' | 'remove'

interface DocumentTemplate {
  id: string              // 'novel' | 'blog' | 'outline'
  exportRules: {
    aiBlocks: AIBlockExportStrategy
    indentFirstLine: boolean
    format: 'markdown' | 'html' | 'plain-text'
  }
}
```

同一份内容，小说模板融入正文，博客模板保留为引用，大纲模板移除 AI 块。

### 附属层（Annotations）

内容的空间维度。与主体内容和 release 版本完全独立。

```typescript
type AnnotationType = 'translation' | 'explanation' | 'comment' | 'footnote'

interface BlockAnnotation {
  id: string
  type: AnnotationType
  content: string
  language?: string         // 翻译目标语言
  source: 'user' | 'ai'
  createdAt: Date
  anchor?: {
    text: string            // 锚定的原文片段
    from?: number
    to?: number
  }
}

interface BlockAnnotations {
  translation?: BlockAnnotation[]
  explanation?: BlockAnnotation[]
  comment?: BlockAnnotation[]
  footnote?: BlockAnnotation[]
}
```

附属层是 append-only log，每次修改追加一条记录，不覆盖。用户想看某个时间点的翻译，查时间戳即可。

```
Block
├── content            ← 主体（唯一）
├── releases[]         ← 主体的时间轴（全量快照，用户主动触发）
└── annotations{}      ← 主体的空间维度（append-only，不参与 release）
    ├── translation[]  ← 翻译（多语言）
    ├── explanation[]  ← 解释/注释
    ├── comment[]      ← 评论/备注
    └── footnote[]     ← 脚注
```

导出时按模板配置自由组合：
- 导出正式文章 → 只取 content
- 导出双语版本 → content + translation
- 导出注释版本 → content + explanation + footnote
- 导出审阅版本 → content + comment

## 编辑器实现：SourceBlock 节点

TipTap 自定义节点 `SourceBlock`，在编辑器层面实现三层分离：

- `attrs.source`（ai / inspiration / user）：内容层元数据，存在节点属性中，用户编辑内容不影响
- `attrs.blockId`：关联的 Block ID，用于内容同步和版本发布
- `attrs.releaseVersion`：引用的 release 版本号
- CSS 类名 `source-block--{source}`：样式层，可被主题类覆盖
- 导出时读取 `source` 属性：模板层，按策略处理

```
┌─────────────────────────────────────────────────┐
│ source-block--ai                                │  ← 样式层
│ ┌─────────────────────────────────────────────┐ │
│ │ ◆ AI 生成        [📦 发布版本] [📋 版本]  │ │  ← 标签 + hover 操作栏
│ ├─────────────────────────────────────────────┤ │
│ │ 内容文字...                      [可编辑]  │ │  ← 内容层（block+）
│ └─────────────────────────────────────────────┘ │
│ attrs: { source, blockId, releaseVersion }      │  ← 元数据
│ 内容变化 → debounce 500ms → 同步到 Block.content│  ← 实时同步
└─────────────────────────────────────────────────┘
```

### 内容同步机制

编辑器中 SourceBlock 的内容通过 MutationObserver 监听变化，debounce 500ms 后自动同步回 IndexedDB 中 Block.content。这保证了 `content` 始终是最新的 working copy，`createRelease` 直接读取即可。

## 关键文件

- `src/types/block.ts` — 三层类型定义 + 附属层类型 + 预置主题/模板
- `src/editor/extensions/sourceBlock.ts` — SourceBlock TipTap 节点
- `src/storage/blockStore.ts` — Block 存储 + 附属层 CRUD
- `src/services/aiService.ts` — AI 对话 + Inline AI 操作（六种模式）
- `src/services/blockCaptureService.ts` — Block 捕获（AI 消息 + 编辑器选中文字）
- `src/services/exportService.ts` — 多形态导出服务（支持附属层组合）
- `src/components/panel/PreviewPanel.tsx` — 预览导出面板

## 权衡

- **为什么不用 ProseMirror marks？** marks 是行内标记，不适合块级容器。SourceBlock 需要包裹多个段落。
- **为什么 style/template 是可选字段？** 向后兼容。旧数据没有这些字段，使用时 fallback 到默认值。
- **为什么标签用 contentEditable=false？** 标签是元数据的视觉展示，不是内容本身。用户不应该编辑它。
- **为什么 annotations 不参与 release？** 附属层的更新频率和主体完全不同。改一个翻译不代表主体有变化，如果每次改翻译都触发 release，版本列表会被噪音淹没。
- **为什么 annotations 是 append-only？** 轻量文本增量存储体积很小。用户可以按时间戳查看历史，不需要和主体 release 绑定。导出时取指定时间点最近的记录即可。
