# AI 浮动工具栏（Inline AI Toolbar）

**状态**: 数据层已实现，编辑器层待实现  
**日期**: 2026-04-11  
**关联 ADR**: [content-style-template](../../architecture/content-style-template.md)

## 概述

将编辑器 BubbleMenu（选中文字浮动菜单）从纯格式操作改为 AI 操作菜单，支持六种操作：续写、改写、缩写/扩写、翻译、解释、存为块。

AI 操作产出的附属内容（翻译、解释）存入 Block 的 `annotations` 附属层，与主体内容和 release 版本完全独立。

## Block 数据模型联动

```
Block
├── content            ← 主体内容（唯一）
├── releases[]         ← 主体内容的历史快照（用户主动触发）
└── annotations{}      ← 附属层（不参与 release 版本管理）
    ├── translation[]  ← 翻译（append-only，带时间戳+语言）
    ├── explanation[]  ← 解释/注释（AI 生成的批注）
    ├── comment[]      ← 评论/备注（用户手动添加）
    └── footnote[]     ← 脚注
```

关键区别：
- `releases` 是主体内容的时间轴——"这段话我改成了什么样"
- `annotations` 是主体内容的空间维度——"围绕这段话还有哪些附属信息"
- 两者完全独立：翻译不影响 release，发布新 release 不会让翻译消失

## 操作行为定义

### 续写（Continue）→ 修改主体
- 触发：选中段落后点击「续写」
- 行为：AI 生成新段落，插入到选中段落正下方
- 临时态：SourceBlock（pending=true），底部显示「保留」「丢弃」
- 保留 → `updateAttributes({ pending: false })`，变为正常 SourceBlock
- 丢弃 → `deleteNode()`
- Block 联动：保留后创建新 Block（`source.type = 'ai'`）

### 改写（Rewrite）→ 修改主体
- 触发：选中文字后点击「改写」
- 行为：AI 生成替换文本，原文标记为"待替换态"
- 临时态：ProseMirror Decoration（原文半透明+删除线，旁边渲染 AI 预览）
- 确认 → `replaceWith` 替换原文
- 丢弃 → 移除 Decoration，原文恢复
- Block 联动：确认后 `appendEditRecord(blockId, 'ai', '改写')`

### 缩写 / 扩写（Shorten / Expand）→ 修改主体
- 行为同改写，mode 不同（AI prompt 约束输出长度）

### 翻译（Translate）→ 写入 annotations.translation
- 触发：选中文字后点击「翻译」
- 行为：AI 翻译选中文字
- **不替换原文**，翻译结果写入 Block 的 `annotations.translation[]`
- 编辑器中用 Decoration 在原文下方显示翻译预览
- Block 联动：`blockStore.addAnnotation(blockId, { type: 'translation', content, language, source: 'ai' })`
- 导出时可选包含：`exportRules.includeAnnotations: ['translation']` → 双语版本

### 解释（Explain）→ 写入 annotations.explanation
- 触发：选中文字后点击「解释」
- 行为：AI 生成解释，作为行内批注锚定在选中文字上
- 实现：CommentMark（选中文字加 mark）+ 侧边批注渲染
- Block 联动：`blockStore.addAnnotation(blockId, { type: 'explanation', content, anchor: { text: selectedText }, source: 'ai' })`
- mark 的 attrs 存 `annotationId`，渲染时从 Block.annotations 读取
- 即使 mark 被删除，annotation 仍存在于 Block 中
- 导出时可选包含：`exportRules.includeAnnotations: ['explanation']` → 注释版本

### 存为块（Capture as Block）→ 创建新 Block
- 触发：选中文字后点击「存为块」
- 行为：直接捕获为显式 Block，无 AI 调用，无临时态
- 来源：如果选中文字在 SourceBlock 内，继承其 `source` 信息；否则 `source.type = 'editor'`
- 调用：`blockCaptureService.captureSelectionAsBlock(text, sourceInfo?)`

## 操作与 Block 层的映射

| 操作 | 影响层 | Block 字段 | 是否触发 release |
|------|--------|-----------|-----------------|
| 续写 | 主体 | 新 Block.content | 否（用户手动） |
| 改写 | 主体 | Block.content + editHistory | 否 |
| 缩写/扩写 | 主体 | Block.content + editHistory | 否 |
| 翻译 | 附属层 | annotations.translation[] | 否 |
| 解释 | 附属层 | annotations.explanation[] | 否 |
| 存为块 | 新 Block | 新 Block 实体 | 自动 v1 |

## TipTap 实现方案

### 1. SourceBlock + pending 属性（续写用）

复用现有 SourceBlock，新增 `attrs.pending: boolean`：
- `pending = true`：渲染「保留/丢弃」按钮，CSS 类 `source-block--pending`
- `pending = false`：正常 SourceBlock
- 导出时 `pending` 块被过滤

符合三层分离：
- 内容层：`source.type = 'ai'` 始终保留
- 样式层：`source-block--pending` 控制临时态视觉
- 模板层：`pending` 块导出时可过滤

### 2. AIReplaceDecoration（改写/缩写/扩写用）

ProseMirror Plugin state 管理 Decoration：
- 原文用 Decoration 标记为半透明+删除线
- AI 结果用 widget Decoration 渲染在旁边
- 确认 → `replaceWith` transaction
- 丢弃 → 清除 Plugin state

### 3. AnnotationDecoration + Block（翻译/解释用）

翻译和解释不修改主体内容，而是写入 annotations 附属层：
- 翻译：Decoration 在原文下方渲染翻译文本，同时 append 到 `annotations.translation[]`
- 解释：CommentMark 锚定选中文字，attrs 存 `annotationId`，内容存入 `annotations.explanation[]`
- 两者都是 append-only，不覆盖之前的记录

## AI 服务（已实现）

`sendInlineAIRequest` 函数：
- 每种 mode 有专用 system prompt（不走 `---CONTENT---` 分隔符）
- 翻译 temperature=0.3（更精确），其他 0.7
- 支持 AbortSignal 取消请求

## 导出联动（已实现）

`exportService.exportBlocks` 支持 `includeAnnotations` 配置：
- 导出正式文章 → 只取 content
- 导出双语版本 → content + translation
- 导出注释版本 → content + explanation + footnote
- 导出审阅版本 → content + comment

## 并发控制

全局 `activeAIOperation` 状态（TipTap Plugin state）：
- 新操作开始前，取消未完成的操作（通过 AbortController）
- 同一时间只允许一个 inline AI 操作

## 已完成

- [x] Block 类型新增 `annotations` 附属层（`BlockAnnotation`, `BlockAnnotations`, `AnnotationType`）
- [x] `BlockRole` 新增 `'annotation'` 角色
- [x] `blockStore` 新增附属层 CRUD（`addAnnotation`, `getAnnotations`, `getLatestAnnotation`, `getAnnotationAt`, `getAnnotationsSummary`）
- [x] `aiService` 新增 `sendInlineAIRequest`（六种模式专用 prompt + 流式响应 + AbortSignal）
- [x] `blockCaptureService` 新增 `captureSelectionAsBlock`（编辑器选中文字捕获，继承 source）
- [x] `exportService` 支持 `includeAnnotations` 导出附属层内容
- [x] `TemplateExportRules` 新增 `includeAnnotations` 配置

## 待实现

- [ ] BubbleMenu 改为 AI 操作菜单 UI
- [ ] SourceBlock `pending` 属性 + 保留/丢弃按钮
- [ ] AIReplaceDecoration Plugin（改写/缩写/扩写临时态）
- [ ] AnnotationDecoration（翻译预览）
- [ ] CommentMark（解释锚定）
- [ ] 并发控制 Plugin（activeAIOperation）
