---
name: ui-refactor
description: View 层 Shadcn UI 重构专家 - 仅对 View/Shell/Layout 组件生效
activation: manual
tags: [ui, refactor, shadcn, tailwind, view-layer]
---

# UI Refactor Skill - View 层 Shadcn UI 重构专家

## ⚠️ 作用域限定

**本 skill 仅对以下组件生效**：
- ✅ **View 组件**（`*View.tsx`，如 `BlockSpacePanelView.tsx`）
- ✅ **Shell 组件**（`src/components/shells/*`）
- ✅ **Layout 组件**（`src/components/layout/*`）

**禁止用于以下组件**：
- ❌ **Container 组件**（`*Container.tsx`）
- ❌ **Hook 文件**（`src/hooks/*`、`src/features/*/hooks/*`）
- ❌ **Service 文件**（`src/services/*`、`src/features/*/services/*`）

**重要规则**：
- 如果发现 Container 中仍有大量 JSX（超过 50 行），**必须先触发 `container-view-pattern` skill 进行拆分**
- 不要在本 skill 中处理 Container 的 JSX，这会破坏架构边界

---

你是一个专业的 View 层 UI 重构专家，负责将 View 组件中的原生 HTML 元素迁移到 Shadcn UI 组件，并使用 Tailwind CSS 替代自定义 CSS。

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

### 2. 必须使用 Shadcn UI 组件

**必须替换为 Shadcn UI 的**：
- `<button>` → `<Button>`
- `<input>` → `<Input>`
- `<textarea>` → `<Textarea>`
- `<select>` → `<Select>`
- 自定义 dialog/dropdown/popover/tabs/card → 对应的 Shadcn UI 组件

**允许保留的原生 HTML**：
- `<div>`、`<span>`、`<section>`、`<header>`、`<nav>`、`<main>`、`<aside>`
- `<ul>`、`<li>`、`<a>`、`<p>`、`<h1>~<h6>`
- `<form>`、`<label>`

**优先使用 Shells**：
- 已存在 shells 的场景必须用 shells，不允许在 View 内重复实现 shell 级 UI
- 如果 shells 中没有，必须先在 `components/shells/` 中实现，再使用

### 3. 必须使用 Tailwind CSS

**禁止为 View / Shell 组件创建新的 CSS 文件**。

**允许保留的 CSS 文件**：
- Tiptap 内容样式（`editor-wysiwyg.css`）
- 全局 design tokens / reset / responsive（`styles/global/*`）

**业务组件视觉样式必须使用**：
- Tailwind CSS 工具类
- `cn()` 工具函数动态组合类名
- `cva()` 定义状态变体
- Tailwind 语义化颜色变量

### 4. className 控制规则

**长度上限**：
- 单元素 Tailwind 类不超过 **8 个**
- 超过 8 个时，必须使用 `cn()` 拆行
- 如果是状态变体（≥2 个状态），必须使用 `cva()`

**禁止行为**：
- ❌ 严禁原样粘贴 v0 导出的长 className
- ❌ 禁止字符串拼接（`className={a + ' ' + b}`）
- ❌ 禁止条件三元组合（`className={a ? 'x' : 'y'} + ' ' + {b ? 'z' : 'w'}`）

**必须行为**：
- ✅ 条件样式必须使用 `cn()`
- ✅ 状态变体必须使用 `cva()`
- ✅ 同一段 className 出现在 ≥2 个 View 中，必须抽 shell 或 cva

### 5. cva 使用规范

**使用场景**：
当一个 View 元素出现 ≥2 个状态（如 default / selected / dragging / editing）时，**必须使用 `cva` 定义变体**，禁止用一堆 `cn(condition && '...')` 堆叠。

**适用场景**：
- BlockCardShell（default / selected / dragging）
- PanelHeader（collapsed / expanded）
- 按钮组（primary / secondary / ghost）
- 状态标签（success / warning / error）

**cva 模板**：
```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  // 基础样式
  'rounded-lg border p-4 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        selected: 'bg-accent text-accent-foreground border-primary',
        dragging: 'opacity-50 cursor-grabbing',
      },
      size: {
        sm: 'p-2 text-sm',
        md: 'p-4 text-base',
        lg: 'p-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface CardProps extends VariantProps<typeof cardVariants> {
  className?: string
  children: React.ReactNode
}

function Card({ variant, size, className, children }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, size }), className)}>
      {children}
    </div>
  )
}
```

### 6. View 组件 Import 边界

**View 组件 Import 白名单**（只能 import 这些）：
- ✅ `@/components/ui/*`（Shadcn UI 基础组件）
- ✅ `@/components/shells/*`（Shell 组件）
- ✅ `@/components/layout/*`（仅当 View 是 layout 子组件）
- ✅ `@/lib/utils`（cn、cva 等工具函数）
- ✅ `lucide-react`（图标）
- ✅ 同目录下的子 View 与 ViewModel 类型

**View 组件 Import 黑名单**（禁止 import）：
- ❌ `@/storage/*`（store）
- ❌ `@/services/*`（service）
- ❌ `@/features/*/hooks/*`（业务 hooks）
- ❌ `@/features/*/services/*`（feature service）
- ❌ 任何 Tiptap editor 实例
- ❌ 任何 store 实例
- ❌ `@/types/models/*`（领域模型类型，必须经过 ViewModel 转换）

### 7. 图标使用规范

**统一使用 `lucide-react`**：
- ✅ 统一使用 `lucide-react`
- ❌ 禁止混用 `react-icons` / `heroicons` / 自定义 SVG（除非业务必需）

**图标尺寸规则**：
- 默认图标尺寸通过 className 控制：`className="h-4 w-4"`
- 不使用 `size` 属性，统一用 className，方便响应式
- 常用尺寸：`h-3 w-3`（12px）、`h-4 w-4`（16px）、`h-5 w-5`（20px）、`h-6 w-6`（24px）

**示例**：
```typescript
import { Plus, Trash2, Edit, MoreVertical } from 'lucide-react'

<Button variant="ghost" size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### 8. 保持功能完整
- **必须**保留所有原有功能
- **必须**保持所有交互逻辑不变
- **必须**保持响应式设计
- **必须**通过 TypeScript 类型检查

## 工作流程

### 1. 分析现有组件 🔍

**检查清单**：
- [ ] 识别所有原生 HTML 元素（button, input, textarea, select, dialog 等）
- [ ] 识别所有自定义 CSS 类
- [ ] 识别所有交互逻辑和状态管理
- [ ] 识别所有 props 和类型定义
- [ ] 评估组件复杂度和重构时间

**输出**：
```
组件名称：[ComponentName]
原生元素数量：[X] 个
自定义 CSS 行数：[Y] 行
预计重构时间：[Z] 分钟
```

### 2. 选择对应的 Shadcn UI 组件 🎨

**三层组件选择策略**：
1. **优先使用 Shell 组件**（如果适用）
   - 检查 `src/components/shells/` 是否有合适的组件
   - Shell 组件已经组合好了常用的 UI 模式，减少重复代码
   
2. **使用 Shadcn UI 基础组件**
   - 如果 Shell 组件不适用，使用 `src/components/ui/` 中的基础组件
   
3. **创建新的 Shell 组件**（如果需要）
   - 如果发现重复的 UI 模式，考虑创建新的 Shell 组件

**组件映射表**：
```
原生元素          → Shadcn UI 组件        → Shell 组件（可选）
<button>         → <Button>             
<input>          → <Input>              → <SearchInput>（搜索场景）
<textarea>       → <Textarea>           
<select>         → <Select>             
自定义对话框      → <Dialog>             
自定义下拉菜单    → <DropdownMenu>       
自定义弹出层      → <Popover>            
自定义卡片        → <Card>               → <BlockCardShell>（Block 场景）
自定义标签页      → <Tabs>               
自定义滚动容器    → <ScrollArea>         
面板容器         → -                    → <PanelShell>
面板头部         → -                    → <PanelHeader>
空状态          → -                    → <EmptyState>
```

**Shell 组件列表**：
- **PanelShell** - 面板容器（右侧面板统一容器）
- **PanelHeader** - 面板头部（标题 + 关闭按钮 + 操作按钮）
- **SearchInput** - 搜索输入框（带图标和清除按钮）
- **BlockCardShell** - Block 卡片（标题 + 标签 + 内容）
- **EmptyState** - 空状态（图标 + 标题 + 描述 + 操作按钮）

**检查组件是否已安装**：
```bash
# 查看已安装的组件
ls src/components/ui/

# 如果组件未安装，使用 Shadcn CLI 安装
bunx shadcn@latest add <component-name>
```

### 3. 实施重构 🔧

**重构步骤**：

#### 3.1 添加导入语句
```typescript
// 导入 Shell 组件（优先）
import { PanelShell } from '@/components/shells/PanelShell'
import { PanelHeader } from '@/components/shells/PanelHeader'
import { SearchInput } from '@/components/shells/SearchInput'
import { BlockCardShell } from '@/components/shells/BlockCardShell'
import { EmptyState } from '@/components/shells/EmptyState'

// 导入 Shadcn UI 基础组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
// ... 其他组件

// 导入 cn() 工具函数
import { cn } from '@/lib/utils'

// 导入 lucide-react 图标
import { Plus, Trash2, Edit, MoreVertical } from 'lucide-react'
```

#### 3.2 替换原生元素
```tsx
// ❌ 原生 button
<button className="my-button" onClick={handleClick}>
  点击
</button>

// ✅ Shadcn Button
<Button variant="default" onClick={handleClick}>
  点击
</Button>
```

#### 3.3 迁移样式到 Tailwind
```tsx
// ❌ 自定义 CSS
.my-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
}

// ✅ Tailwind 工具类
<Button className="px-4 py-2 bg-blue-500 text-white rounded-md">
  点击
</Button>
```

#### 3.4 使用 cn() 处理动态类名
```tsx
// ❌ 字符串拼接
<button className={`base-class ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>

// ✅ 使用 cn()
<Button className={cn(
  'base-class',
  isActive && 'bg-purple-100 text-purple-600',
  isDisabled && 'opacity-50'
)}>
```

#### 3.5 删除 CSS 文件
```bash
# 确认所有样式已迁移到 Tailwind
# 删除对应的 CSS 文件
rm src/components/MyComponent.css

# 删除 CSS 导入语句
# import './MyComponent.css' ← 删除这一行
```

### 4. 验证和测试 ✅

**硬验证（必须执行）**：
```bash
# 1. View 文件中不应出现原生 button/input/textarea/select
grep -RnE "<(button|input|textarea|select)\b" src/features/**/components/**/*View.tsx

# 2. View 文件中不应 import store/service
grep -RnE "from ['\"]@/(storage|services)" src/features/**/components/**/*View.tsx

# 3. 单行 className 长度不应超过 120 字符
grep -RnE 'className="[^"]{120,}"' src/features

# 4. View 文件中不应 import 领域模型类型
grep -RnE "from ['\"]@/types/models" src/features/**/components/**/*View.tsx
```

**上述命令必须全部为空才算迁移完成。**

**软验证清单**：
- [ ] TypeScript 类型检查通过（`bun run type-check`）
- [ ] 所有原生 HTML 元素已替换
- [ ] 所有自定义 CSS 已迁移到 Tailwind
- [ ] CSS 文件已删除
- [ ] 所有功能正常工作
- [ ] 所有交互逻辑保持不变
- [ ] 响应式设计保持不变
- [ ] 无破坏性变更

**测试步骤**：
1. 运行硬验证命令（上述 4 条 grep）
2. 运行类型检查：`bun run type-check`
3. 启动开发服务器：`bun run dev`
4. 手动测试所有功能
5. 检查不同屏幕尺寸的响应式效果
6. 检查不同状态的视觉反馈

### 5. 更新文档 📝

**必须更新的文档**：
- `docs/guide/CSS迁移清单.md` - 标记组件为已完成
- `docs/logs/YYYY-MM/YYYY-MM-DD.md` - 追加工作日志
- `docs/CHANGELOG.md` - 如果是重要里程碑，添加版本记录

**工作日志格式**：
```markdown
## HH:mm - [ComponentName] 组件 Shadcn UI 重构完成 ✅

### 完成内容
- ✅ [ComponentName] 组件完全迁移到 Shadcn UI
- ✅ 使用 [列出使用的组件] 组件
- ✅ 删除 [ComponentName].css 文件
- ✅ TypeScript 类型检查通过
- ✅ 保留所有功能：[列出主要功能]

### 文件变更
- src/components/[path]/[ComponentName].tsx - 完全迁移到 Shadcn UI
- src/components/[path]/[ComponentName].css - ✅ 已删除

### 关键说明
- 迁移时间：约 [X] 分钟
- 使用组件：[列出 Shadcn UI 组件]
- 技术亮点：[列出关键技术点]
- 验证结果：✅ TypeScript 类型检查通过（0 错误）

---
```

## 典型迁移模式

### 模式 1：面板（Panel）- 使用 Shell 组件构建
```tsx
// ✅ 使用 PanelShell + PanelHeader
import { PanelShell } from '@/components/shells/PanelShell'
import { PanelHeader } from '@/components/shells/PanelHeader'
import { SearchInput } from '@/components/shells/SearchInput'
import { EmptyState } from '@/components/shells/EmptyState'
import { Button } from '@/components/ui/button'
import { Settings, Inbox } from 'lucide-react'

function MyPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState([])

  return (
    <PanelShell>
      <PanelHeader
        title="我的面板"
        onClose={() => setShowPanel(false)}
        actions={
          <Button variant="ghost" size="icon">
            <Settings size={16} />
          </Button>
        }
      />
      <div className="p-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索..."
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="还没有内容"
            description="创建你的第一个项目开始使用"
            action={{
              label: '创建项目',
              onClick: handleCreate,
            }}
          />
        ) : (
          items.map(item => <div key={item.id}>{item.name}</div>)
        )}
      </div>
    </PanelShell>
  )
}
```

### 模式 2：列表卡片（List Card）- 使用 BlockCardShell
```tsx
// ✅ 使用 BlockCardShell
import { BlockCardShell } from '@/components/shells/BlockCardShell'
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-[600px]">
  <div className="space-y-2 p-4">
    {blocks.map(block => (
      <BlockCardShell
        key={block.id}
        title={block.title}
        tags={block.tags}
        onClick={() => handleBlockClick(block.id)}
        isActive={selectedBlockId === block.id}
      >
        <p className="text-sm text-muted-foreground line-clamp-2">
          {block.content}
        </p>
      </BlockCardShell>
    ))}
  </div>
</ScrollArea>
```

### 模式 3：对话框（Dialog）- 自定义对话框迁移
```tsx
// ❌ 自定义对话框
{showDialog && (
  <div className="dialog-overlay" onClick={close}>
    <div className="dialog-content">
      <h3>标题</h3>
      <input type="text" />
      <button onClick={submit}>确定</button>
    </div>
  </div>
)}

// ✅ Shadcn Dialog
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
    </DialogHeader>
    <Input type="text" />
    <DialogFooter>
      <Button variant="outline" onClick={close}>取消</Button>
      <Button onClick={submit}>确定</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 模式 4：下拉菜单（DropdownMenu）- 自定义菜单迁移
```tsx
// ❌ 自定义菜单
{showMenu && (
  <div className="menu">
    <button onClick={action1}>操作1</button>
    <button onClick={action2}>操作2</button>
    <div className="separator" />
    <button onClick={deleteAction}>删除</button>
  </div>
)}

// ✅ Shadcn DropdownMenu
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical size={16} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={action1}>操作1</DropdownMenuItem>
    <DropdownMenuItem onClick={action2}>操作2</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={deleteAction} className="text-destructive">
      删除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 模式 5：复杂条件样式 - 使用 cn() 和 cva()

**简单条件（≤2 个状态）- 使用 cn()**：
```tsx
<Button 
  className={cn(
    'base-class',
    isActive && 'ring-2 ring-blue-300',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  按钮
</Button>
```

**复杂变体（≥2 个状态）- 使用 cva()**：
```tsx
const buttonVariants = cva('base-class', {
  variants: {
    variant: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6 text-lg',
    },
  },
})

<Button className={buttonVariants({ variant: 'primary', size: 'sm' })}>
  按钮
</Button>
```

### 模式 6：HTML 内容样式 - 使用 Tailwind 任意值选择器
```tsx
// 使用 Tailwind 任意值选择器为动态 HTML 添加样式
<div className="prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_p]:text-base [&_blockquote]:border-l-4">
  {htmlContent}
</div>
```

## 特殊情况处理

### 组件未安装
如果需要的 Shadcn UI 组件未安装：
```bash
# 安装组件
bunx shadcn@latest add <component-name>

# 例如：安装 Badge 组件
bunx shadcn@latest add badge
```

### 需要自定义样式
如果 Shadcn UI 组件的默认样式不满足需求：
1. 优先使用 Tailwind 工具类覆盖
2. 使用 `className` prop 添加自定义类
3. 使用 Tailwind 任意值（`[&_selector]:style`）
4. 最后考虑修改 `components/ui/` 中的组件源码

### 复杂组件分步迁移
对于超大组件（1000+ 行）：
1. 先创建独立的子组件
2. 逐个子组件迁移
3. 最后整合到主组件
4. 每一步都运行类型检查

## 快速命令

```bash
# 类型检查
bun run type-check

# 启动开发服务器
bun run dev

# 安装 Shadcn UI 组件
bunx shadcn@latest add <component-name>

# 查看已安装的组件
ls src/components/ui/

# 搜索原生 HTML 元素
grep -r "<button" src/components/
grep -r "<input" src/components/
grep -r "<textarea" src/components/
```

## 成功标准

**硬标准（必须通过）**：
- ✅ 硬验证 4 条 grep 命令全部为空
- ✅ TypeScript 类型检查通过（0 错误）
- ✅ View 组件不 import store/service/领域模型
- ✅ 单行 className 不超过 120 字符

**软标准（必须满足）**：
- ✅ 所有原生 HTML 元素已替换为 Shadcn UI 组件
- ✅ 所有自定义 CSS 已迁移到 Tailwind CSS
- ✅ CSS 文件已删除
- ✅ 所有功能正常工作
- ✅ 响应式设计保持不变
- ✅ 文档已更新（工作日志、迁移清单、CHANGELOG）

## 参考资源

- Shadcn UI 重构规范：`.kiro/steering/shadcn-ui-refactor.md`
- 已安装组件列表：`docs/guide/shadcn-components-installed.md`
- CSS 迁移清单：`docs/guide/CSS迁移清单.md`
- Shadcn UI 官方文档：https://ui.shadcn.com/
- Tailwind CSS 文档：https://tailwindcss.com/docs
