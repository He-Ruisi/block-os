---
title: Shadcn UI 组件重构规范
inclusion: auto
priority: high
---

# Shadcn UI 组件重构规范

本项目正在进行 UI 组件的 Shadcn UI 重构。所有涉及 UI 组件的修改和新增都必须遵循以下规范。

## 核心原则

### 1. 三层组件架构
```
components/
├── ui/           # Shadcn UI 基础组件（Button、Input、Dialog 等）
├── shells/       # 项目级展示壳组件（PanelShell、SearchInput 等）
└── layout/       # 应用框架组件（Sidebar、TabBar、StatusBar 等）
```

**组件分层规则**：
- **components/ui/** - 只放 Shadcn UI 基础组件
  - 禁止：放业务逻辑、放 feature 专属 UI
  - 允许：Button、Card、Input、Dialog、Tabs 等基础组件
  
- **components/shells/** - 项目级展示壳组件
  - 基于 Shadcn UI 组合而成，无业务逻辑
  - 用于减少重复的 className，提供统一的 UI 模式
  - 例如：PanelShell、PanelHeader、SearchInput、BlockCardShell、EmptyState
  
- **components/layout/** - 应用框架组件
  - 应用级的布局组件，可以包含状态管理
  - 例如：Sidebar、TabBar、StatusBar、ActivityBar

- **features/*/components/** - 功能模块组件
  - 包含业务逻辑的功能组件
  - 例如：BlockSpacePanel、EditorToolbar、SessionHistoryPanel

### 2. 优先使用 Shadcn UI 组件
- **禁止**使用原生 HTML 元素（`<button>`, `<input>`, `<textarea>`, `<select>` 等）
- **必须**使用对应的 Shadcn UI 组件替代
- **必须**从 `@/components/ui/` 导入基础组件
- **优先**使用 `@/components/shells/` 中的壳组件（如果适用）

### 3. Shell 组件清单（项目级展示壳组件）

**重要规则**：
- ✅ **优先使用** Shell 组件（如果适用）
- ❌ **禁止在 View 内部临时实现** shell 级组件
- ✅ **如果需要新的 Shell 组件**，必须先在 `components/shells/` 中实现，再使用

#### 当前可用 Shell 组件（5 个）

```typescript
// 1. PanelShell - 面板容器
import { PanelShell } from '@/components/shells/PanelShell'
// 用途：右侧面板的统一容器
// API: { children, className? }

// 2. PanelHeader - 面板头部
import { PanelHeader } from '@/components/shells/PanelHeader'
// 用途：面板标题栏（标题 + 关闭按钮 + 操作按钮）
// API: { title, onClose?, actions?, className? }

// 3. SearchInput - 搜索输入框
import { SearchInput } from '@/components/shells/SearchInput'
// 用途：带搜索图标和清除按钮的输入框
// API: { value, onChange: (value: string) => void, placeholder?, className? }
// 注意：onChange 传 string，不传 Event

// 4. BlockCardShell - Block 卡片
import { BlockCardShell } from '@/components/shells/BlockCardShell'
// 用途：Block 卡片容器（标题 + 标签 + 内容）
// API: { title?, tags?, children, onClick?, onDragStart?, isActive?, draggable?, className? }

// 5. EmptyState - 空状态占位
import { EmptyState } from '@/components/shells/EmptyState'
// 用途：空状态占位（图标 + 标题 + 描述 + 操作按钮）
// API: { icon?: LucideIcon, title, description?, action?, className? }
```

#### Shell 组件完整 API 文档

详见：`src/components/shells/API.md`

#### Shell 组件使用示例

```tsx
import { PanelShell, PanelHeader, SearchInput, BlockCardShell, EmptyState } from '@/components/shells';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox } from 'lucide-react';

function MyPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [blocks, setBlocks] = useState([]);

  return (
    <PanelShell>
      {/* 头部 */}
      <PanelHeader
        title="Block 空间"
        onClose={() => setShowPanel(false)}
      />

      {/* 搜索栏 */}
      <div className="p-4 border-b">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}  // 直接传函数，不处理 Event
          placeholder="搜索 Block..."
        />
      </div>

      {/* 内容区域 */}
      <ScrollArea className="flex-1">
        {blocks.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="还没有 Block"
            description="创建你的第一个 Block 开始使用"
          />
        ) : (
          <div className="p-4 space-y-2">
            {blocks.map(block => (
              <BlockCardShell
                key={block.id}
                title={block.title}
                tags={block.tags}
                onClick={() => handleBlockClick(block.id)}
                isActive={selectedBlockId === block.id}
              >
                <p className="text-sm text-muted-foreground">{block.content}</p>
              </BlockCardShell>
            ))}
          </div>
        )}
      </ScrollArea>
    </PanelShell>
  );
}
```

#### 如何添加新 Shell 组件

如果发现重复的 UI 模式，按以下步骤添加：

1. **在 `components/shells/` 中创建组件文件**
2. **定义 TypeScript 接口**（导出 Props 类型）
3. **实现组件**（基于 Shadcn UI，无业务逻辑）
4. **回调统一传值**（传 string/boolean/id，不传 Event）
5. **添加到 `index.ts`** 导出
6. **更新 `API.md`** 文档
7. **更新本清单**

### 4. 已安装的 Shadcn UI 组件
```typescript
// 按钮和交互
import { Button } from '@/components/ui/button'

// 表单组件
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 对话框和弹出层
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// 布局和容器
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// 反馈组件
import { Toast, Toaster } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
```

## 组件替换规则

### Button 组件
```tsx
// ❌ 错误：使用原生 button
<button className="my-button" onClick={handleClick}>
  点击
</button>

// ✅ 正确：使用 Shadcn Button
import { Button } from '@/components/ui/button'

<Button variant="default" size="default" onClick={handleClick}>
  点击
</Button>

// 常用 variants
<Button variant="default">默认按钮</Button>
<Button variant="destructive">危险操作</Button>
<Button variant="outline">次要按钮</Button>
<Button variant="secondary">辅助按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="link">链接按钮</Button>

// 常用 sizes
<Button size="default">默认大小</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>
<Button size="icon">图标按钮</Button>

// 图标按钮示例
<Button variant="ghost" size="icon">
  <Plus size={16} />
</Button>
```

### Input 组件
```tsx
// ❌ 错误：使用原生 input
<input 
  type="text" 
  className="my-input" 
  value={value} 
  onChange={e => setValue(e.target.value)} 
/>

// ✅ 正确：使用 Shadcn Input
import { Input } from '@/components/ui/input'

<Input 
  type="text" 
  value={value} 
  onChange={e => setValue(e.target.value)}
  placeholder="请输入..."
/>
```

### Textarea 组件
```tsx
// ❌ 错误：使用原生 textarea
<textarea 
  className="my-textarea" 
  value={value} 
  onChange={e => setValue(e.target.value)}
  rows={3}
/>

// ✅ 正确：使用 Shadcn Textarea
import { Textarea } from '@/components/ui/textarea'

<Textarea 
  value={value} 
  onChange={e => setValue(e.target.value)}
  rows={3}
  placeholder="请输入..."
/>
```

### Dialog 组件
```tsx
// ❌ 错误：使用自定义对话框
{showDialog && (
  <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
    <div className="dialog-content">
      <h3>标题</h3>
      <input type="text" />
      <button onClick={handleSubmit}>确定</button>
    </div>
  </div>
)}

// ✅ 正确：使用 Shadcn Dialog
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述文本（可选）</DialogDescription>
    </DialogHeader>
    <Input type="text" />
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowDialog(false)}>
        取消
      </Button>
      <Button onClick={handleSubmit}>确定</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### DropdownMenu 组件
```tsx
// ❌ 错误：使用自定义下拉菜单
{showMenu && (
  <div className="menu">
    <button onClick={handleAction1}>操作1</button>
    <button onClick={handleAction2}>操作2</button>
    <button onClick={handleDelete}>删除</button>
  </div>
)}

// ✅ 正确：使用 Shadcn DropdownMenu
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical size={16} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleAction1}>
      操作1
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleAction2}>
      操作2
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      删除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### ScrollArea 组件
```tsx
// ❌ 错误：使用原生滚动容器
<div className="overflow-y-auto max-h-[500px]">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>

// ✅ 正确：使用 Shadcn ScrollArea
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="max-h-[500px]">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</ScrollArea>
```

## Shell 组件使用示例

### PanelShell + PanelHeader
```tsx
// ✅ 使用 Shell 组件构建面板
import { PanelShell } from '@/components/shells/PanelShell'
import { PanelHeader } from '@/components/shells/PanelHeader'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

<PanelShell>
  <PanelHeader
    title="Block 空间"
    onClose={() => setShowPanel(false)}
    actions={
      <Button variant="ghost" size="icon">
        <Settings size={16} />
      </Button>
    }
  />
  <div className="flex-1 overflow-y-auto p-4">
    {/* 面板内容 */}
  </div>
</PanelShell>
```

### SearchInput
```tsx
// ✅ 使用 SearchInput 组件
import { SearchInput } from '@/components/shells/SearchInput'

<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="搜索 Block..."
/>
```

### BlockCardShell
```tsx
// ✅ 使用 BlockCardShell 展示 Block
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

### EmptyState
```tsx
// ✅ 使用 EmptyState 展示空状态
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

## 样式规范

### 1. 使用 cn() 工具函数
```tsx
import { cn } from '@/lib/utils'

// ✅ 正确：使用 cn() 动态组合类名
<Button 
  className={cn(
    'my-custom-class',
    isActive && 'bg-purple-100 text-purple-600',
    isDisabled && 'opacity-50'
  )}
>
  按钮
</Button>
```

### 2. 使用 Tailwind CSS 语义化颜色
```tsx
// ✅ 使用语义化颜色变量
bg-background       // 背景色
bg-foreground       // 前景色
bg-card             // 卡片背景
bg-popover          // 弹出层背景
bg-primary          // 主色
bg-secondary        // 次要色
bg-muted            // 柔和色
bg-accent           // 强调色
bg-destructive      // 危险色

text-foreground     // 文本色
text-muted-foreground  // 柔和文本色
text-primary        // 主色文本
text-destructive    // 危险文本

border-border       // 边框色
border-input        // 输入框边框
```

### 3. 使用 Tailwind 工具类
```tsx
// ✅ 优先使用 Tailwind 工具类，避免自定义 CSS
<div className="flex items-center gap-2 p-4 rounded-lg border bg-card">
  <Button variant="ghost" size="icon" className="h-8 w-8">
    <Plus size={16} />
  </Button>
  <span className="text-sm text-muted-foreground">添加项目</span>
</div>
```

## 图标规范

### 使用 lucide-react 图标库
```tsx
import { Plus, Trash2, Edit, MoreVertical, X, Check } from 'lucide-react'

// ✅ 正确：使用 lucide-react 图标
<Button variant="ghost" size="icon">
  <Plus size={16} />
</Button>

// 常用图标
Plus          // 添加
Trash2        // 删除
Edit, Pencil  // 编辑
MoreVertical  // 更多操作
X             // 关闭
Check         // 确认
ChevronDown   // 下拉
ChevronRight  // 右箭头
Search        // 搜索
Settings      // 设置
```

## 重构检查清单

在提交代码前，请确保：

- [ ] 所有原生 HTML 元素已替换为 Shadcn UI 组件
- [ ] 使用 `cn()` 工具函数动态组合类名
- [ ] 使用 Tailwind CSS 语义化颜色变量
- [ ] 使用 lucide-react 图标库
- [ ] 保留所有原有功能，无破坏性变更
- [ ] TypeScript 类型检查通过（`bun run type-check`）
- [ ] 所有交互功能正常工作
- [ ] 响应式设计保持不变

## 常见问题

### Q: 如何安装新的 Shadcn UI 组件？
```bash
# 使用 Shadcn CLI 安装组件
bunx shadcn@latest add <component-name>

# 例如：安装 Badge 组件
bunx shadcn@latest add badge
```

### Q: 如何处理自定义样式？
```tsx
// 优先使用 Tailwind 工具类
<Button className="bg-purple-500 hover:bg-purple-600">
  自定义颜色
</Button>

// 如果必须使用自定义 CSS，使用 Tailwind 任意值
<div className="[&_h1]:text-2xl [&_p]:text-sm">
  {htmlContent}
</div>
```

### Q: 如何处理复杂的条件样式？
```tsx
import { cn } from '@/lib/utils'

<Button 
  className={cn(
    'base-class',
    variant === 'primary' && 'bg-blue-500',
    variant === 'secondary' && 'bg-gray-500',
    isActive && 'ring-2 ring-blue-300',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  按钮
</Button>
```

## 参考资源

- Shadcn UI 官方文档：https://ui.shadcn.com/
- Tailwind CSS 文档：https://tailwindcss.com/docs
- lucide-react 图标库：https://lucide.dev/
- 项目已安装组件列表：`docs/guide/shadcn-components-installed.md`
