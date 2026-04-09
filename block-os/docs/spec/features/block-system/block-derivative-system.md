# Block 版本派生系统

## 功能概述

Block 版本派生系统允许用户在不同文档中引用同一个源 Block，并对其进行修改，系统会自动记录每个派生版本的来源、上下文和修改内容。

---

## 核心概念

### 1. 源 Block（Source Block）
- 最初创建的 Block（通常是 AI 回复）
- 作为所有派生版本的基础
- 保持不变，作为参考版本

### 2. 派生版本（Derivative）
- 从源 Block 引用并修改后生成
- 记录使用的文档/上下文
- 记录修改说明
- 可以被再次引用

### 3. 派生树（Derivative Tree）
- 源 Block + 所有派生版本
- 展示 Block 的使用历史
- 支持版本对比

---

## 数据模型

### Block 扩展字段

```typescript
interface Block {
  // ... 原有字段
  
  derivation?: {
    isDerivative: boolean      // 是否是派生版本
    sourceBlockId?: string     // 源 Block ID
    derivedFrom?: string       // 直接派生自哪个版本
    contextDocumentId?: string // 使用的文档/上下文
    contextTitle?: string      // 文档标题
    modifications?: string     // 修改说明
  }
}
```

---

## 核心功能

### 1. AI 回复自动创建隐式 Block ✅

**触发时机**：
- AI 完成回复后自动触发

**创建逻辑**：
```typescript
const aiBlock: Block = {
  id: assistantId,
  content: assistantMessage,
  type: 'ai-generated',
  source: {
    type: 'ai',
    aiMessageId: assistantId,
    capturedAt: new Date()
  },
  metadata: {
    title: `AI 回复 - ${new Date().toLocaleString()}`,
    tags: ['AI回复', '自动生成'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

await blockStore.saveBlock(aiBlock)
```

**特点**：
- 每个 AI 回复都是一个独立的 Block
- 自动添加标签：`AI回复`、`自动生成`
- 使用消息 ID 作为 Block ID
- 无需用户手动操作

---

### 2. 创建派生版本 ✅

**API**：
```typescript
async createDerivative(
  sourceBlockId: string,
  modifiedContent: string,
  contextDocumentId: string,
  contextTitle: string,
  modifications: string = '用户修改'
): Promise<Block>
```

**使用场景**：
1. 用户在文档 A 中引用 Block X
2. 用户修改了 Block X 的内容
3. 系统自动创建派生版本 X'
4. 记录：来源 X、文档 A、修改内容

**示例**：
```typescript
// 源 Block
const sourceBlock = {
  id: 'block-001',
  content: '这是一个产品特点列表',
  type: 'ai-generated'
}

// 用户在文档中修改后
const derivative = await blockStore.createDerivative(
  'block-001',
  '这是一个产品特点列表（已针对技术文档优化）',
  'doc-tech-001',
  '技术文档',
  '针对技术受众优化表述'
)
```

---

### 3. 查看派生树 ✅

**API**：
```typescript
async getDerivativeTree(blockId: string): Promise<{
  source: Block | null
  derivatives: Block[]
}>
```

**返回数据**：
```typescript
{
  source: {
    id: 'block-001',
    content: '原始内容',
    // ...
  },
  derivatives: [
    {
      id: 'block-002',
      content: '修改版本 1',
      derivation: {
        isDerivative: true,
        sourceBlockId: 'block-001',
        contextTitle: '技术文档',
        modifications: '针对技术受众优化'
      }
    },
    {
      id: 'block-003',
      content: '修改版本 2',
      derivation: {
        isDerivative: true,
        sourceBlockId: 'block-001',
        contextTitle: '营销文档',
        modifications: '针对营销场景调整'
      }
    }
  ]
}
```

---

### 4. 版本选择器 ✅

**组件**：`BlockDerivativeSelector`

**功能**：
- 显示源 Block 和所有派生版本
- 支持单选
- 显示每个版本的：
  - 内容预览
  - 使用文档
  - 创建时间
  - 修改说明

**使用流程**：
1. 用户点击"引用 Block"
2. 弹出版本选择器
3. 显示源 Block 和所有派生版本
4. 用户选择要使用的版本
5. 插入到编辑器

---

### 5. 自动检测修改 ✅

**API**：
```typescript
async autoCreateDerivativeIfModified(
  sourceBlockId: string,
  currentContent: string,
  contextDocumentId: string,
  contextTitle: string
): Promise<Block | null>
```

**工作原理**：
1. 比较当前内容和源 Block 内容
2. 如果有修改，自动创建派生版本
3. 如果无修改，返回 null

**使用场景**：
- 用户在编辑器中修改引用的 Block
- 保存时自动检测并创建派生版本

---

## Git 集成

### 1. 自动提交 ✅

**配置**：
```typescript
await gitIntegration.init({
  enabled: true,
  autoCommit: true,
  commitInterval: 300 // 5 分钟
})
```

**功能**：
- 自动跟踪文件变更
- 定时提交（默认 5 分钟）
- 生成提交消息

**提交消息格式**：
```
auto: update <filename> at <timestamp>
auto: update 3 files at 2026-04-09T17:30:00Z
```

---

### 2. 手动提交 ✅

**API**：
```typescript
await gitIntegration.commitNow('feat: add new feature')
```

**使用场景**：
- 用户完成重要修改
- 达到里程碑
- 需要立即保存

---

### 3. 导出为 Markdown ✅

**Block 导出**：
```typescript
const markdown = blockToMarkdown(block)
```

**输出格式**：
```markdown
# Block 标题

Block 内容...

---
ID: block-001
Type: ai-generated
Created: 2026-04-09T17:30:00Z
Tags: AI回复, 自动生成

## Derivation Info
Source Block: block-000
Context: 技术文档
Modifications: 针对技术受众优化
```

**文档导出**：
```typescript
const markdown = documentToMarkdown(document)
```

---

## 使用流程

### 场景 1: AI 回复自动成为 Block

```
1. 用户发送消息给 AI
   ↓
2. AI 回复内容
   ↓
3. 系统自动创建隐式 Block
   - ID: 消息 ID
   - 内容: AI 回复
   - 标签: AI回复, 自动生成
   ↓
4. Block 保存到 IndexedDB
   ↓
5. 可在 Block 空间查看
```

---

### 场景 2: 引用 Block 并修改

```
1. 用户在文档中输入 [[
   ↓
2. 触发 Block 搜索
   ↓
3. 选择一个 Block
   ↓
4. 弹出版本选择器
   - 显示源 Block
   - 显示所有派生版本
   ↓
5. 用户选择版本（源或派生）
   ↓
6. 插入到编辑器
   ↓
7. 用户修改内容
   ↓
8. 保存时自动检测修改
   ↓
9. 创建新的派生版本
   - 记录源 Block ID
   - 记录当前文档
   - 记录修改说明
   ↓
10. 下次引用时可选择此派生版本
```

---

### 场景 3: 查看 Block 使用历史

```
1. 打开 Block 空间
   ↓
2. 点击某个 Block
   ↓
3. 查看派生树
   - 源 Block 信息
   - 所有派生版本列表
   ↓
4. 每个派生版本显示：
   - 使用的文档
   - 修改时间
   - 修改说明
   - 内容预览
   ↓
5. 可以对比不同版本
```

---

## 技术实现

### 1. 数据库结构

**IndexedDB Stores**：
- `blocks` - 存储所有 Block（包括源和派生）
- `documents` - 存储文档

**索引**：
- `blocks.tags` - 按标签查询
- `blocks.createdAt` - 按时间排序
- `blocks.type` - 按类型过滤

---

### 2. 派生版本识别

**判断是否为派生版本**：
```typescript
const isDerivative = block.derivation?.isDerivative === true
```

**获取源 Block**：
```typescript
const sourceBlockId = block.derivation?.sourceBlockId
const sourceBlock = await blockStore.getBlock(sourceBlockId)
```

---

### 3. 内容修改检测

**简单对比**：
```typescript
isContentModified(original: string, modified: string): boolean {
  return original.trim() !== modified.trim()
}
```

**未来改进**：
- 使用 diff 算法
- 计算相似度
- 高亮修改部分

---

## 性能优化

### 1. 索引优化
- 为 `derivation.sourceBlockId` 创建索引
- 加速派生版本查询

### 2. 缓存策略
- 缓存派生树
- 减少数据库查询

### 3. 懒加载
- 派生版本列表分页
- 按需加载内容

---

## 未来扩展

### 1. 版本对比
- 可视化 diff
- 高亮修改部分
- 支持合并

### 2. 版本合并
- 将派生版本合并回源 Block
- 创建新的源版本

### 3. 版本分支
- 支持从派生版本再派生
- 形成版本树

### 4. 协作功能
- 多人编辑
- 冲突解决
- 版本审核

---

## 验收标准

### 功能验收
- ✅ AI 回复自动创建隐式 Block
- ✅ 可以创建派生版本
- ✅ 可以查看派生树
- ✅ 版本选择器正常工作
- ✅ 自动检测内容修改
- ✅ Git 自动提交功能
- ✅ 导出为 Markdown

### 性能验收
- ✅ 创建派生版本 < 100ms
- ✅ 查询派生树 < 200ms
- ✅ 版本选择器加载 < 300ms

### 用户体验验收
- ✅ AI 回复自动保存，无需手动操作
- ✅ 版本选择界面清晰直观
- ✅ 派生版本信息完整
- ✅ 修改历史可追溯

---

**文档版本**: v1.0  
**创建日期**: 2026-04-09  
**最后更新**: 2026-04-09  
**状态**: 已实现

