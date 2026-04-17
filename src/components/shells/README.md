# Shell Components - 项目级展示壳组件

这一层组件基于 Shadcn UI 基础组件组合而成，提供项目级的通用 UI 模式。

## 设计理念

### 为什么需要 Shell 组件？

在 Shadcn UI 基础组件和业务组件之间，我们需要一个中间层来：
1. **减少重复代码**：避免在多个地方重复相同的 className 组合
2. **统一视觉风格**：确保相似的 UI 模式在整个应用中保持一致
3. **提高开发效率**：开发者可以直接使用预组合的 UI 模式
4. **保持灵活性**：Shell 组件无业务逻辑，易于复用和定制

### 三层组件架构

```
components/
├── ui/           # Shadcn UI 基础组件（Button、Input、Dialog 等）
│                 # - 最底层，纯 UI 组件
│                 # - 通过 Shadcn CLI 安装
│                 # - 禁止放业务逻辑
│
├── shells/       # 项目级展示壳组件（PanelShell、SearchInput 等）
│                 # - 中间层，组合 UI 组件
│                 # - 提供通用 UI 模式
│                 # - 无业务逻辑，可复用
│
└── layout/       # 应用框架组件（Sidebar、TabBar 等）
                  # - 顶层，应用级组件
                  # - 可以包含状态管理
                  # - 应用特定的布局
```

## 可用组件

### PanelShell
面板容器壳组件，用于右侧面板的统一容器。

```tsx
import { PanelShell } from '@/components/shells/PanelShell'

<PanelShell>
  {/* 面板内容 */}
</PanelShell>
```

**Props**:
- `children: React.ReactNode` - 面板内容
- `className?: string` - 自定义类名

### PanelHeader
面板头部壳组件，包含标题、关闭按钮和可选的操作按钮。

```tsx
import { PanelHeader } from '@/components/shells/PanelHeader'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

<PanelHeader
  title="Block 空间"
  onClose={() => setShowPanel(false)}
  actions={
    <Button variant="ghost" size="icon">
      <Settings size={16} />
    </Button>
  }
/>
```

**Props**:
- `title: string` - 面板标题
- `onClose?: () => void` - 关闭回调
- `actions?: React.ReactNode` - 操作按钮
- `className?: string` - 自定义类名

### SearchInput
搜索输入框壳组件，带搜索图标和清除按钮。

```tsx
import { SearchInput } from '@/components/shells/SearchInput'

<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="搜索 Block..."
/>
```

**Props**:
- `value: string` - 输入值
- `onChange: (value: string) => void` - 值变化回调
- `placeholder?: string` - 占位符文本
- `className?: string` - 自定义类名

### BlockCardShell
Block 卡片壳组件，用于展示 Block 的卡片容器。

```tsx
import { BlockCardShell } from '@/components/shells/BlockCardShell'

<BlockCardShell
  title="Block 标题"
  tags={['标签1', '标签2']}
  onClick={() => handleBlockClick(block.id)}
  isActive={selectedBlockId === block.id}
>
  <p className="text-sm text-muted-foreground">Block 内容预览...</p>
</BlockCardShell>
```

**Props**:
- `title?: string` - 卡片标题
- `tags?: string[]` - 标签列表
- `children: React.ReactNode` - 卡片内容
- `onClick?: () => void` - 点击回调
- `isActive?: boolean` - 是否激活状态
- `className?: string` - 自定义类名

### EmptyState
空状态壳组件，用于展示空状态的占位组件。

```tsx
import { EmptyState } from '@/components/shells/EmptyState'
import { Inbox } from 'lucide-react'

<EmptyState
  icon={Inbox}
  title="还没有 Block"
  description="创建你的第一个 Block 开始使用"
  action={{
    label: '创建 Block',
    onClick: handleCreateBlock,
  }}
/>
```

**Props**:
- `icon?: LucideIcon` - 图标组件
- `title: string` - 标题
- `description?: string` - 描述文本
- `action?: { label: string; onClick: () => void }` - 操作按钮
- `className?: string` - 自定义类名

## 使用示例

### 完整的面板示例

```tsx
import { PanelShell } from '@/components/shells/PanelShell'
import { PanelHeader } from '@/components/shells/PanelHeader'
import { SearchInput } from '@/components/shells/SearchInput'
import { BlockCardShell } from '@/components/shells/BlockCardShell'
import { EmptyState } from '@/components/shells/EmptyState'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, Inbox } from 'lucide-react'

function BlockSpacePanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [blocks, setBlocks] = useState([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  const filteredBlocks = blocks.filter(block =>
    block.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PanelShell>
      {/* 头部 */}
      <PanelHeader
        title="Block 空间"
        onClose={() => setShowPanel(false)}
        actions={
          <Button variant="ghost" size="icon">
            <Settings size={16} />
          </Button>
        }
      />

      {/* 搜索栏 */}
      <div className="p-4 border-b">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索 Block..."
        />
      </div>

      {/* 内容区域 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredBlocks.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="还没有 Block"
              description="创建你的第一个 Block 开始使用"
              action={{
                label: '创建 Block',
                onClick: handleCreateBlock,
              }}
            />
          ) : (
            filteredBlocks.map(block => (
              <BlockCardShell
                key={block.id}
                title={block.title}
                tags={block.tags}
                onClick={() => setSelectedBlockId(block.id)}
                isActive={selectedBlockId === block.id}
              >
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {block.content}
                </p>
              </BlockCardShell>
            ))
          )}
        </div>
      </ScrollArea>
    </PanelShell>
  )
}
```

## 创建新的 Shell 组件

如果你发现重复的 UI 模式，可以创建新的 Shell 组件：

### 步骤

1. **识别重复模式**：在多个地方使用相同的 UI 组合
2. **提取为 Shell 组件**：创建新的组件文件
3. **保持无业务逻辑**：只处理 UI 展示，不包含业务逻辑
4. **添加到 index.ts**：导出新组件
5. **更新文档**：在 README 中添加使用说明

### 示例：创建 ListItemShell

```tsx
// src/components/shells/ListItemShell.tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'

interface ListItemShellProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  isActive?: boolean
  className?: string
}

export function ListItemShell({
  title,
  description,
  icon,
  actions,
  onClick,
  isActive,
  className,
}: ListItemShellProps) {
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
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  )
}
```

## 最佳实践

### ✅ 应该做的

1. **保持简单**：Shell 组件应该简单、专注
2. **无业务逻辑**：只处理 UI 展示，不包含业务逻辑
3. **可定制**：通过 props 和 className 支持定制
4. **使用 Shadcn UI**：基于 Shadcn UI 基础组件组合
5. **使用 cn()**：使用 `cn()` 工具函数处理类名

### ❌ 不应该做的

1. **不要添加业务逻辑**：如数据获取、状态管理等
2. **不要过度抽象**：如果只用一次，不需要创建 Shell 组件
3. **不要硬编码**：避免硬编码文本、颜色等
4. **不要依赖外部状态**：Shell 组件应该是纯展示组件
5. **不要使用原生 HTML 元素**：使用 Shadcn UI 组件

## 参考资源

- Shadcn UI 文档：https://ui.shadcn.com/
- Tailwind CSS 文档：https://tailwindcss.com/docs
- lucide-react 图标：https://lucide.dev/
- 项目规范：`.kiro/steering/shadcn-ui-refactor.md`
