---
title: Shadcn UI 组件重构规范
inclusion: auto
priority: high
---

# Shadcn UI 组件重构规范

本项目正在进行 UI 组件的 Shadcn UI 重构。所有涉及 UI 组件的修改和新增都必须遵循以下规范。

## 核心原则

### 1. 优先使用 Shadcn UI 组件
- **禁止**使用原生 HTML 元素（`<button>`, `<input>`, `<textarea>`, `<select>` 等）
- **必须**使用对应的 Shadcn UI 组件替代
- **必须**从 `@/components/ui/` 导入组件

### 2. 已安装的 Shadcn UI 组件
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
