# Container/View 拆分模式

## 目标
将复杂的业务组件拆分为"容器组件"和"展示组件"，实现逻辑与 UI 分离，提升可维护性和可测试性。

## 可用 Shell 组件清单

**重要规则**：View 组件只能使用以下已实现的 Shell 组件。如果需要新的 Shell 组件，必须先在 `components/shells/` 中实现，再使用。**禁止在 View 内部临时实现 shell 级组件**。

### 当前可用 Shell 组件（5 个）

1. **PanelShell** - 面板容器
   - 用途：右侧面板的统一容器
   - API: `{ children, className? }`
   
2. **PanelHeader** - 面板头部
   - 用途：面板标题栏（标题 + 关闭按钮 + 操作按钮）
   - API: `{ title, onClose?, actions?, className? }`
   
3. **SearchInput** - 搜索输入框
   - 用途：带搜索图标和清除按钮的输入框
   - API: `{ value, onChange: (value: string) => void, placeholder?, className? }`
   - **注意**：`onChange` 传 string，不传 Event
   
4. **BlockCardShell** - Block 卡片
   - 用途：展示 Block 的卡片容器
   - API: `{ title?, tags?, children, onClick?, onDragStart?, isActive?, draggable?, className? }`
   
5. **EmptyState** - 空状态占位
   - 用途：展示空状态的占位组件
   - API: `{ icon?: LucideIcon, title, description?, action?, className? }`

### Shell 组件完整 API 文档

详见：`src/components/shells/API.md`

### 如何添加新 Shell 组件

如果发现重复的 UI 模式，按以下步骤添加：

1. **在 `components/shells/` 中创建组件文件**
2. **定义 TypeScript 接口**（导出 Props 类型）
3. **实现组件**（基于 Shadcn UI，无业务逻辑）
4. **添加到 `index.ts`** 导出
5. **更新 `API.md`** 文档
6. **更新本清单**

**示例**：创建 ListItemShell

```typescript
// src/components/shells/ListItemShell.tsx
export interface ListItemShellProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;  // 不传 Event
  isActive?: boolean;
  className?: string;
}

export function ListItemShell({ title, description, icon, onClick, isActive, className }: ListItemShellProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent cursor-pointer',
        isActive && 'border-primary bg-accent',
        className
      )}
      onClick={onClick}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{title}</h4>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
    </div>
  );
}
```

## 核心原则

### Container（容器组件）负责
- **业务逻辑**：hooks 调用、状态管理
- **数据编排**：通过 hooks 获取数据，编排业务流程
- **数据转换**：将领域模型转换为 ViewModel（通过 mappers）
- **事件处理**：拖拽、选中、交互逻辑
- **编辑器集成**：与 TipTap 联动
- **副作用**：useEffect、数据订阅（通过 hooks）

**严格约束**：
- ❌ **禁止直接访问** `storage/*`（如 `blockStore.getAll()`）
- ✅ **必须通过** `features/<feature>/hooks/*` 间接访问
- ❌ **禁止直接订阅** store（如 `blockStore.subscribe()`）
- ✅ **必须通过** hooks 封装的订阅机制

**架构边界**：
```
Container (数据编排层)
    ↓ 只能调用
Hooks (数据接入层)
    ↓ 只能调用
Storage/Services (数据存储层)
```

### View（展示组件）负责
- **纯渲染**：接收 props，返回 JSX
- **Shadcn UI 组件**：Card、Input、Tabs、ScrollArea、Badge 等
- **Shell 组件**：PanelShell、BlockCardShell、SearchInput 等（见下方清单）
- **样式组合**：cn()、cva() 工具函数
- **无状态**：不使用 useState、useEffect（除非是纯 UI 状态如 hover）

**严格约束**：
- ❌ **禁止 import** `types/models/*`（领域模型类型）
- ✅ **只能 import** 本目录的 `types.ts`（ViewModel 类型）
- ❌ **禁止直接处理** Event 对象（如 `e.target.value`）
- ✅ **只接收处理后的值**（如 `onChange: (value: string) => void`）

## 文件组织结构

### 推荐：Feature 内部拆分
```
src/features/<feature>/components/<ComponentName>/
├── <ComponentName>Container.tsx    # 容器组件
├── <ComponentName>View.tsx         # 主展示组件
├── <SubComponent>View.tsx          # 子展示组件
├── types.ts                        # ViewModel 类型定义（可选）
└── index.ts                        # 导出入口
```

### 示例：DocumentBlocksPanel
```
src/features/blocks/components/DocumentBlocksPanel/
├── DocumentBlocksPanelContainer.tsx  # 逻辑容器
├── DocumentBlocksPanelView.tsx       # 主面板展示
├── BlockListView.tsx                 # Block 列表展示
├── BlockItemView.tsx                 # 单个 Block 展示
├── types.ts                          # ViewModel 接口
└── index.ts                          # 导出 Container
```

## 代码模板

### Mappers 模板（数据转换层）

**规则**：当 ViewModel 转换逻辑超过 5 行或被多处使用时，必须抽到 `mappers.ts`，作为纯函数。

```tsx
// DocumentBlocksPanel/mappers.ts
import type { DocumentBlock } from '@/types/models/document';
import type { BlockViewModel } from './types';

/**
 * 将领域模型 DocumentBlock 转换为 ViewModel
 */
export function toBlockViewModel(block: DocumentBlock, index: number): BlockViewModel {
  return {
    id: block.id,
    nodeType: block.nodeType,
    content: block.content,
    links: block.links,
    index: index + 1,
  };
}

/**
 * 批量转换
 */
export function toBlockViewModels(blocks: DocumentBlock[]): BlockViewModel[] {
  return blocks.map((block, index) => toBlockViewModel(block, index));
}
```

**为什么重要**：
1. **可单测**：纯函数易于测试，无需 mock hooks 或 store
2. **Container 更干净**：Container 只负责编排，不负责转换细节
3. **可复用**：多个 Container 可复用同一个 mapper

### Container 模板
```tsx
// DocumentBlocksPanelContainer.tsx
import { useState, useEffect } from 'react';
import { useEditor } from '@/editor/EditorContext';
import { useBlockSearch } from '@/hooks/useBlockSearch';  // ✅ 通过 hook 访问数据
import { DocumentBlocksPanelView } from './DocumentBlocksPanelView';
import { toBlockViewModels } from './mappers';  // ✅ 使用 mapper 转换数据
import type { BlockViewModel } from './types';

interface Props {
  documentId: string;
}

export function DocumentBlocksPanelContainer({ documentId }: Props) {
  // 1. Hooks（数据接入层）
  const { blocks, loading, searchTerm, setSearchTerm, subscribe } = useBlockSearch(documentId);  // ✅ 通过 hook
  const { editor } = useEditor();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // 2. 数据转换为 ViewModel（使用 mapper）
  const blockViewModels: BlockViewModel[] = toBlockViewModels(blocks);  // ✅ 使用 mapper

  // 3. 事件处理
  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
    editor?.commands.insertBlockReference(blockId);
  };

  const handleDragStart = (blockId: string) => {
    // 拖拽逻辑
  };

  // 4. 副作用（通过 hook 的订阅机制）
  useEffect(() => {
    const unsubscribe = subscribe?.();  // ✅ 通过 hook 提供的订阅
    return unsubscribe;
  }, [subscribe]);

  // 5. 渲染 View
  return (
    <DocumentBlocksPanelView
      blocks={blockViewModels}
      loading={loading}
      searchTerm={searchTerm}
      selectedBlockId={selectedBlockId}
      onSearchChange={setSearchTerm}
      onBlockClick={handleBlockClick}
      onDragStart={handleDragStart}
    />
  );
}
```

**关键点**：
- ✅ 通过 `useBlockSearch` hook 访问数据（不直接访问 `blockStore`）
- ✅ 使用 `toBlockViewModels` mapper 转换数据（不在 Container 内转换）
- ✅ 通过 hook 提供的 `subscribe` 订阅数据变化（不直接调用 `blockStore.subscribe`）

### View 模板
```tsx
// DocumentBlocksPanelView.tsx
import { PanelShell, SearchInput } from '@/components/shells';  // ✅ 使用 Shell 组件
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockListView } from './BlockListView';
import type { BlockViewModel } from './types';  // ✅ 只 import ViewModel 类型

interface Props {
  blocks: BlockViewModel[];
  loading: boolean;
  searchTerm: string;
  selectedBlockId: string | null;
  onSearchChange: (term: string) => void;  // ✅ 传 string，不传 Event
  onBlockClick: (blockId: string) => void;
  onDragStart: (blockId: string) => void;
}

export function DocumentBlocksPanelView({
  blocks,
  loading,
  searchTerm,
  selectedBlockId,
  onSearchChange,
  onBlockClick,
  onDragStart,
}: Props) {
  return (
    <PanelShell>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}  // ✅ 直接传函数，不处理 Event
        placeholder="搜索 Blocks..."
      />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">加载中...</div>
        ) : blocks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">暂无 Blocks</div>
        ) : (
          <BlockListView
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onBlockClick={onBlockClick}
            onDragStart={onDragStart}
          />
        )}
      </ScrollArea>
    </PanelShell>
  );
}
```

**关键点**：
- ✅ 只 import `types.ts` 中的 ViewModel 类型（不 import `types/models/*`）
- ✅ 使用 Shell 组件（`PanelShell`、`SearchInput`）
- ✅ `onSearchChange` 接收 string，不处理 Event

### 子 View 模板
```tsx
// BlockListView.tsx
import { BlockItemView } from './BlockItemView';
import type { BlockViewModel } from './types';

interface Props {
  blocks: BlockViewModel[];
  selectedBlockId: string | null;
  onBlockClick: (blockId: string) => void;
  onDragStart: (blockId: string) => void;
}

export function BlockListView({ blocks, selectedBlockId, onBlockClick, onDragStart }: Props) {
  return (
    <div className="space-y-2 p-2">
      {blocks.map(block => (
        <BlockItemView
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onClick={() => onBlockClick(block.id)}
          onDragStart={() => onDragStart(block.id)}
        />
      ))}
    </div>
  );
}
```

```tsx
// BlockItemView.tsx
import { BlockCardShell } from '@/components/shells';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlockViewModel } from './types';

interface Props {
  block: BlockViewModel;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: () => void;
}

export function BlockItemView({ block, isSelected, onClick, onDragStart }: Props) {
  return (
    <BlockCardShell
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-colors',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{block.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{block.preview}</p>
        
        {block.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {block.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">{block.createdAt}</div>
      </div>
    </BlockCardShell>
  );
}
```

### ViewModel 类型定义
```tsx
// types.ts
export interface BlockViewModel {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  createdAt: string;
}
```

### 导出入口
```tsx
// index.ts
export { DocumentBlocksPanelContainer as DocumentBlocksPanel } from './DocumentBlocksPanelContainer';
export type { BlockViewModel } from './types';
```

## 拆分步骤

### 1. 分析现有组件
- 识别业务逻辑（hooks、store、service）
- 识别展示逻辑（JSX、样式）
- 识别事件处理函数

### 2. 创建目录结构
```bash
mkdir -p src/features/<feature>/components/<ComponentName>
```

### 3. 定义 ViewModel
- 创建 `types.ts`
- 定义展示层需要的数据结构
- 避免暴露 store 内部类型

### 4. 实现 Container
- 移动所有 hooks 到 Container
- 转换数据为 ViewModel
- 实现事件处理函数
- 渲染 View 并传递 props

### 5. 实现 View
- 接收 props（数据 + 回调）
- 使用 Shadcn UI 和 Shell 组件
- 拆分子 View 组件（列表、卡片等）
- 只负责渲染，无业务逻辑

### 6. 更新导出
- 在 `index.ts` 中导出 Container
- 保持对外接口不变

## 注意事项

### ✅ 推荐做法
- Container 只渲染一个 View，不包含 JSX 细节
- View 组件可以嵌套，但保持单一职责
- ViewModel 只包含展示需要的字段
- 事件回调使用明确的函数名（onBlockClick 而非 onClick）
- 使用 TypeScript 严格类型检查
- **ViewModel 转换逻辑超过 5 行或被多处使用时，必须抽到 `mappers.ts`**
- **Container 通过 hooks 访问数据，不直接访问 storage**
- **View 只 import ViewModel 类型，不 import 领域模型类型**
- **Shell 组件回调传值（string/boolean/id），不传 Event 对象**

### ❌ 避免做法
- 不要在 View 中调用 hooks（除了纯 UI 状态）
- 不要在 View 中直接访问 store/service
- 不要在 Container 中写大量 JSX
- 不要创建全局 containers/ 目录
- 不要过度拆分（简单组件无需拆分）
- **不要在 Container 中直接 import `storage/*`**（如 `blockStore`）
- **不要在 Container 中直接订阅 store**（如 `blockStore.subscribe()`）
- **不要在 View 中 import `types/models/*`**（领域模型类型）
- **不要在 View 中处理 Event 对象**（如 `e.target.value`）
- **不要在 View 内部临时实现 shell 级组件**（必须先在 `components/shells/` 中实现）

### 架构边界严格约束

#### 1. Container 数据访问边界
```
❌ 错误示例：
import { blockStore } from '@/storage/blockStore';
const blocks = await blockStore.getAll();
const unsubscribe = blockStore.subscribe(() => {...});

✅ 正确示例：
import { useBlocks } from '@/features/blocks/hooks/useBlocks';
const { blocks, subscribe } = useBlocks(documentId);
useEffect(() => subscribe?.(), [subscribe]);
```

**原因**：
- Container 是"数据编排层"，不应直接访问"数据存储层"
- Hooks 是"数据接入层"，封装 store 访问逻辑
- 这样架构边界清晰，易于测试和维护

#### 2. View 类型导入边界
```
❌ 错误示例：
import type { Block } from '@/types/models/block';
import type { Document } from '@/types/models/document';

✅ 正确示例：
import type { BlockViewModel } from './types';
import type { DocumentViewModel } from './types';
```

**原因**：
- View 只关心展示，不应知道领域模型的内部结构
- ViewModel 是展示层的"防腐层"，隔离领域模型变化
- 领域模型变化时，只需修改 mapper，View 不受影响

#### 3. Shell 组件回调边界
```
❌ 错误示例：
<SearchInput
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}  // 处理 Event
/>

✅ 正确示例：
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}  // 直接传值
/>
```

**原因**：
- View 层不应处理 Event 对象细节
- Shell 组件内部处理 Event，对外提供简单接口
- 提高可测试性（测试时无需 mock Event）

#### 4. ViewModel 转换边界
```
❌ 错误示例（Container 内转换）：
const blockViewModels = blocks.map(block => ({
  id: block.id,
  title: block.content.substring(0, 50),
  preview: block.content.substring(0, 100),
  tags: block.tags || [],
  createdAt: new Date(block.createdAt).toLocaleDateString(),
}));

✅ 正确示例（使用 mapper）：
import { toBlockViewModels } from './mappers';
const blockViewModels = toBlockViewModels(blocks);
```

**原因**：
- 转换逻辑超过 5 行时，Container 会变得臃肿
- Mapper 是纯函数，易于单测
- 多个 Container 可复用同一个 mapper

## 适用场景

### 需要拆分
- 组件超过 300 行
- 包含复杂业务逻辑（多个 hooks、store 调用）
- 需要与 TipTap/拖拽等复杂交互
- 需要单独测试展示层

### 无需拆分
- 简单展示组件（< 100 行）
- 纯 UI 组件（无业务逻辑）
- Shell 组件（已经是展示层）

## 测试策略

### Container 测试
- Mock hooks 和 store
- 测试数据转换逻辑
- 测试事件处理函数

### View 测试
- 传入 mock props
- 测试渲染结果
- 测试用户交互（点击、拖拽）

## 迁移优先级

1. **DocumentBlocksPanel** - 最复杂，最需要美化
2. **BlockDetailPanel** - 详情展示，逻辑较多
3. **BlockSpacePanel** - 全局 Block 管理
4. **BlockDerivativeSelector** - 派生选择器

## 参考资源

- [Shadcn UI 组件库](https://ui.shadcn.com/)
- [Container/Presentational Pattern](https://www.patterns.dev/posts/presentational-container-pattern)
- 项目规范：`.kiro/steering/shadcn-ui-refactor.md`
