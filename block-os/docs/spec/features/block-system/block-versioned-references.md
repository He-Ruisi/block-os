# Block 版本化引用系统

**状态**: 待实施  
**优先级**: P1  
**依赖**: Block 派生系统（已完成）、SourceBlock 节点（已完成）

## 概述

采用 working copy + release 模型。源块实时保存当前编辑内容，用户主动"发布"为 release 版本。引用时选择具体 release 版本，不受源块后续编辑影响。

## 数据模型

```typescript
// Block 新增 releases 字段（内嵌）
interface BlockRelease {
  version: number           // 自增版本号
  content: string           // 该版本的内容快照
  title: string             // 用户起的版本标题
  releasedAt: Date
}

interface Block {
  // ... 现有字段
  content: string           // working copy，实时保存
  releases?: BlockRelease[] // 用户主动发布的版本快照
}

// Usage 单独存储（独立 object store）
interface BlockUsage {
  id: string                // usage 记录 ID
  blockId: string           // 引用的 Block ID
  releaseVersion: number    // 引用的 release 版本号
  documentId: string        // 使用该 Block 的文档 ID
  documentTitle: string     // 文档标题
  insertedAt: Date
}
```

### 设计决策：usages 独立存储

usages 不放在 Block 里，而是单独一张 IndexedDB object store。原因：
- 引用关系是文档侧产生的事件，不应让 Block 维护
- 文档删除/引用变更时直接操作 usage 表，Block 不用动
- 按 blockId 索引查询"这个 Block 被用在哪里"

## 用户流程

1. AI 回复被捕获为 Block → content 为原始内容，自动创建 release v1（"原始版本"）
2. 用户在文档中修改 Block 内容 → content 实时更新（自动保存）
3. 用户点"保存为新版本" → 创建 release v2，带用户起的标题
4. 另一篇文档引用此 Block → 版本选择器显示 v1/v2/v3，选一个插入
5. 插入的是 release 快照，不随源块继续编辑而变化

## 存储层

### database.ts
新增 `usages` object store（DB 版本升级到 5）

### blockStore 新增方法
- `createRelease(blockId, title)` — 将当前 content 快照为新 release
- `getReleases(blockId)` — 获取所有 release 版本

### usageStore（新文件）
- `addUsage(blockId, releaseVersion, documentId, title)` — 记录引用
- `getUsagesByBlock(blockId)` — 查询 Block 的所有使用记录
- `getUsagesByDocument(documentId)` — 查询文档中的所有引用
- `removeUsage(id)` — 删除单条引用记录
- `removeUsagesByDocument(documentId)` — 文档删除时清理所有引用

## 编辑器层

- SourceBlock attrs 新增 `blockId` + `releaseVersion`
- 拖入/插入时调用 `usageStore.addUsage()`
- 修改后提示"保存为新版本？"

## UI 层

### 版本选择器（增强 BlockDerivativeSelector）
- 每个版本显示：标题 + 前两行内容预览 + 发布时间
- 操作：插入指定版本、基于指定版本创建新版本

### Block 详情面板
- Block 空间点击卡片 → 展开详情
- 显示：当前内容、release 列表、usage 列表（被哪些文档引用）
- `(())` 块引用触发版本选择器

## 与现有 derivation 的关系

releases 内嵌在 Block 中，替代之前"每个派生版本是独立 Block"的模式。现有 derivation 字段保留向后兼容，新功能使用 releases。
