# Container/View 拆分模式

## 目标
将复杂的业务组件拆分为"容器组件"和"展示组件"，实现逻辑与 UI 分离，提升可维护性和可测试性。

## 核心原则

### Container（容器组件）负责
- **业务逻辑**：hooks 调用、状态管理
- **数据处理**：store/service 调用、数据转换为 ViewModel
- **事件处理**：拖拽、选中、交互逻辑
- **编辑器集成**：与 TipTap 联动
- **副作用**：useEffect、数据订阅

### View（展示组件）负责
- **纯渲染**：接收 props，返回 JSX
- **Shadcn UI 组件**：Card、Input、Tabs、ScrollArea、Badge 等
- **Shell 组件**：PanelShell、BlockCardShell、SearchInput 等
- **样式组合**：cn()、cva() 工具函数
- **无状态**：不使用 useState、useEffect（除非是纯 UI 状态如 hover）

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

### Container 模板
```tsx
// DocumentBlocksPanelContainer.tsx
import { useState, useEffect } from 'react';
import { useBlockSearch } from '@/hooks/useBlockSearch';
import { useEditor } from '@/editor/EditorContext';
import { blockStore } from '@/storage/blockStore';
import { DocumentBlocksPanelView } from './DocumentBlocksPanelView';
import type { BlockViewModel } from './types';

interface Props {
  documentId: string;
}

export function DocumentBlocksPanelContainer({ documentId }: Props) {
  // 1. Hooks
  const { blocks, loading, searchTerm, setSearchTerm } = useBlockSearch(documentId);
  const { editor } = useEditor();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // 2. 数据转换为 ViewModel
  const blockViewModels: BlockViewModel[] = blocks.map(block => ({
    id: block.id,
    title: block.content.substring(0, 50),
    preview: block.content.substring(0, 100),
    tags: block.tags || [],
    createdAt: new Date(block.createdAt).toLocaleDateString(),
  }));

  // 3. 事件处理
  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
    editor?.commands.insertBlockReference(blockId);
  };

  const handleDragStart = (blockId: string) => {
    // 拖拽逻辑
  };

  // 4. 副作用
  useEffect(() => {
    // 订阅 block 变化
    const unsubscribe = blockStore.subscribe(() => {
      // 更新逻辑
    });
    return unsubscribe;
  }, [documentId]);

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

### View 模板
```tsx
// DocumentBlocksPanelView.tsx
import { PanelShell, PanelHeader, SearchInput, EmptyState } from '@/components/shells';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockListView } from './BlockListView';
import type { BlockViewModel } from './types';

interface Props {
  blocks: BlockViewModel[];
  loading: boolean;
  searchTerm: string;
  selectedBlockId: string | null;
  onSearchChange: (term: string) => void;
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
      <PanelHeader title="文档 Blocks" />
      
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="搜索 Blocks..."
      />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">加载中...</div>
        ) : blocks.length === 0 ? (
          <EmptyState message="暂无 Blocks" />
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

### ❌ 避免做法
- 不要在 View 中调用 hooks（除了纯 UI 状态）
- 不要在 View 中直接访问 store/service
- 不要在 Container 中写大量 JSX
- 不要创建全局 containers/ 目录
- 不要过度拆分（简单组件无需拆分）

## 适用场景

### 需要拆分
- 组件超过 200 行
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
