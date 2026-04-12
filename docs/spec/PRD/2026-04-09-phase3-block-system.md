# Phase 3: Block 系统

## 优先级
P1 - 重要功能

## 目标
实现知识块（Block）系统，支持双向链接和块引用。

## 功能需求

### 1. Block 数据模型
```typescript
interface Block {
  id: string
  content: string
  type: 'text' | 'heading' | 'list' | 'code'
  metadata: {
    createdAt: Date
    updatedAt: Date
    tags: string[]
  }
  links: {
    outgoing: string[]  // 引用的其他 blocks
    incoming: string[]  // 被哪些 blocks 引用
  }
}
```

### 2. 双向链接 `[[]]`
- 输入 `[[` 触发块搜索
- 自动补全现有块
- 创建新块
- 链接关系自动维护

### 3. 块引用 `(())`
- 输入 `((` 触发块引用
- 引用内容实时同步
- 支持嵌入显示

### 4. 块空间界面
- 块列表视图
- 关系图谱可视化
- 标签过滤
- 搜索功能

## 技术方案

### 存储层
- IndexedDB 本地存储
- 块索引建立
- 全文搜索支持

### 编辑器扩展
- TipTap 自定义节点
- 链接语法解析
- 引用渲染

### 关系图谱
- 使用 D3.js 或 Cytoscape.js
- 力导向布局
- 交互式导航

## 验收标准
- [ ] 可以创建和编辑 Block
- [ ] `[[]]` 语法正常工作
- [ ] `(())` 引用实时同步
- [ ] 块空间可视化展示

## 依赖
- Phase 2 AI 集成完成
- 本地存储方案确定
