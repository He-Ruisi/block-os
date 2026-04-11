# Block 版本化引用系统

**状态**: 待实施  
**优先级**: P1  
**依赖**: Block 派生系统（已完成）、SourceBlock 节点（已完成）

## 概述

完善 Block 派生系统，实现"带版本历史的块引用"：源块 → 多个派生版本 → 每个版本记录来源和使用位置。用户引用时可查看所有版本，选择最合适的或再派生新版本。

## 数据层

Block 类型新增 `usages` 字段：
```typescript
usages?: {
  documentId: string
  documentTitle: string
  insertedAt: Date
  currentContent?: string  // 在该文档中的当前内容快照
}[]
```

blockStore 新增方法：
- `addUsage(blockId, documentId, title)` — 记录 Block 被使用
- `getUsages(blockId)` — 获取 Block 的所有使用记录

## 编辑器层

- 拖入 SourceBlock 时，同时调用 `addUsage()` 记录使用
- SourceBlock attrs 新增 `blockId` 指向源 Block
- 用户修改 SourceBlock 内容后，提示"保存为新派生版本？"
- 接入 `autoCreateDerivativeIfModified` 到编辑器 onUpdate 流程

## UI 层

- Block 空间点击 Block 卡片 → 展开详情面板
- 显示：源块内容、派生版本列表（修改摘要+使用文档+时间）
- 操作：插入此版本、基于此版本派生
- `(())` 块引用触发时也显示版本选择器

## 存储方案

直接存快照（IndexedDB），不引入 git。每个派生版本是独立的 Block 记录，通过 `derivation.sourceBlockId` 关联。
