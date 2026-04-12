# Phase 2.5: Block 捕获与上下文传递

## 优先级
P0 - 核心功能

## 目标
实现选中文字捕获为 Block 和上下文传递给 AI 的功能，为完整的 Block 系统奠定基础。

## 功能需求

### 1. 选中文字发送给 AI
- 用户在编辑器中选中文字
- 右键菜单显示"发送给 AI"选项
- 或使用快捷键 `Cmd/Ctrl + Shift + A`
- 选中内容作为上下文自动添加到 AI 对话

### 2. AI 回复捕获为 Block
- AI 回复下方显示"捕获为 Block"按钮
- 点击后弹出捕获对话框
- 可选添加标题和标签
- 保存到 Block 空间

### 3. Block 空间基础 UI
- 右侧面板新增"Block 空间"标签页
- 显示已捕获的 Block 列表
- 支持基础搜索和标签过滤
- 点击 Block 可查看详情

## 数据模型

### Block 接口
```typescript
interface Block {
  id: string                    // UUID
  content: string               // Block 内容
  type: 'text' | 'ai-generated' // Block 类型
  source: {
    type: 'editor' | 'ai'       // 来源类型
    documentId?: string         // 来源文档（编辑器）
    aiMessageId?: string        // 来源消息（AI）
    capturedAt: Date            // 捕获时间
  }
  metadata: {
    title?: string              // 可选标题
    tags: string[]              // 标签列表
    createdAt: Date
    updatedAt: Date
  }
}
```

### 存储方案
- 使用 IndexedDB 存储 Block 数据
- 数据库名: `blockos-db`
- Store 名: `blocks`
- 索引: `tags`, `createdAt`, `type`

## UI/UX 设计

### 1. 编辑器选中菜单
```
┌─────────────────┐
│ 复制            │
│ 粘贴            │
│ ─────────────── │
│ 📤 发送给 AI    │  ← 新增
└─────────────────┘
```

### 2. AI 消息操作按钮
```
┌──────────────────────────────┐
│ 🤖 AI 回复内容...            │
│                              │
│ [↗ 写入编辑器] [◆ 捕获为Block]│ ← 新增
└──────────────────────────────┘
```

### 3. Block 捕获对话框
```
┌─────────────────────────────┐
│ 捕获为 Block                 │
├─────────────────────────────┤
│ 标题（可选）                 │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ 标签                        │
│ [#tag1] [#tag2] [+ 添加]   │
│                             │
│ 预览                        │
│ ┌─────────────────────────┐ │
│ │ Block 内容预览...       │ │
│ └─────────────────────────┘ │
│                             │
│     [取消]  [捕获]          │
└─────────────────────────────┘
```

### 4. Block 空间面板
```
┌─────────────────────────────┐
│ [对话] [Block空间] [Session]│ ← 新增标签页
├─────────────────────────────┤
│ 🔍 搜索 Block...            │
│                             │
│ 标签: [全部▾] [#技术] [#AI]│
│                             │
│ ┌─────────────────────────┐ │
│ │ ◆ 产品定位核心观点      │ │
│ │   核心竞争力是「不打扰」│ │
│ │   #产品 #定位           │ │
│ │   📅 2026-04-09 14:32   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ◆ AI 生成的技术方案     │ │
│ │   使用 IndexedDB 存储...│ │
│ │   #技术 #AI生成         │ │
│ │   📅 2026-04-09 15:20   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 技术实现

### 1. IndexedDB 封装
```typescript
class BlockStore {
  private db: IDBDatabase
  
  async init(): Promise<void>
  async saveBlock(block: Block): Promise<string>
  async getBlock(id: string): Promise<Block | null>
  async getAllBlocks(): Promise<Block[]>
  async searchBlocks(query: string): Promise<Block[]>
  async getBlocksByTag(tag: string): Promise<Block[]>
  async deleteBlock(id: string): Promise<void>
}
```

### 2. 编辑器选中处理
```typescript
// 获取选中文字
const getSelectedText = (editor: Editor): string => {
  const { from, to } = editor.state.selection
  return editor.state.doc.textBetween(from, to, '\n')
}

// 发送给 AI
const sendSelectionToAI = (text: string) => {
  // 添加到 AI 输入框，带上下文标记
  setAIInput(`[上下文]\n${text}\n\n[我的问题]\n`)
}
```

### 3. Block 捕获逻辑
```typescript
const captureBlock = async (content: string, source: BlockSource) => {
  const block: Block = {
    id: generateUUID(),
    content,
    type: source.type === 'ai' ? 'ai-generated' : 'text',
    source: {
      ...source,
      capturedAt: new Date()
    },
    metadata: {
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  await blockStore.saveBlock(block)
  return block
}
```

### 4. 右侧面板标签页切换
```typescript
type PanelTab = 'chat' | 'blocks' | 'session'

const [activeTab, setActiveTab] = useState<PanelTab>('chat')

// 渲染对应内容
{activeTab === 'chat' && <ChatPanel />}
{activeTab === 'blocks' && <BlockSpacePanel />}
{activeTab === 'session' && <SessionPanel />}
```

## 验收标准

### 功能验收
- [ ] 可以选中编辑器文字并发送给 AI
- [ ] 选中内容作为上下文显示在 AI 输入框
- [ ] AI 回复可以捕获为 Block
- [ ] 捕获对话框可以添加标题和标签
- [ ] Block 保存到 IndexedDB
- [ ] Block 空间显示所有已捕获的 Block
- [ ] 可以按标签过滤 Block
- [ ] 可以搜索 Block 内容

### 性能验收
- [ ] Block 列表加载时间 < 100ms
- [ ] 搜索响应时间 < 50ms
- [ ] 捕获操作响应时间 < 100ms

### 用户体验验收
- [ ] 选中文字右键菜单流畅
- [ ] 捕获对话框交互自然
- [ ] Block 空间布局清晰
- [ ] 标签管理便捷

## 依赖

### 技术依赖
- TipTap 编辑器（已有）
- React 状态管理（已有）
- IndexedDB API（浏览器原生）

### 功能依赖
- Phase 2 AI 对话功能（已完成）
- 编辑器基础功能（已完成）

## 后续扩展

### Phase 3 功能
- 隐式 Block 系统（段落自动识别）
- 双向链接 `[[]]`
- 块引用 `(())`
- Block 关系图谱

### 增强功能
- Block 编辑和更新
- Block 删除和归档
- Block 导出（Markdown/JSON）
- Block 批量操作
