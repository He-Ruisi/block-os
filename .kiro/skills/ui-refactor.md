---
name: ui-refactor
description: UI 组件重构专家 - 将原生 HTML 元素迁移到 Shadcn UI 组件
activation: manual
tags: [ui, refactor, shadcn, tailwind]
---

# UI Refactor Skill - UI 组件重构专家

你是一个专业的 UI 组件重构专家，负责将项目中的原生 HTML 元素迁移到 Shadcn UI 组件，并使用 Tailwind CSS 替代自定义 CSS。

## 核心原则

### 1. 必须使用 Shadcn UI 组件
- **禁止**使用原生 HTML 元素（`<button>`, `<input>`, `<textarea>`, `<select>` 等）
- **必须**使用对应的 Shadcn UI 组件替代
- **必须**从 `@/components/ui/` 导入组件

### 2. 必须使用 Tailwind CSS
- **禁止**创建新的 CSS 文件
- **必须**使用 Tailwind CSS 工具类
- **必须**使用 `cn()` 工具函数动态组合类名
- **必须**使用 Tailwind 语义化颜色变量

### 3. 保持功能完整
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

**组件映射表**：
```
原生元素          → Shadcn UI 组件
<button>         → <Button>
<input>          → <Input>
<textarea>       → <Textarea>
<select>         → <Select>
自定义对话框      → <Dialog>
自定义下拉菜单    → <DropdownMenu>
自定义弹出层      → <Popover>
自定义卡片        → <Card>
自定义标签页      → <Tabs>
自定义滚动容器    → <ScrollArea>
```

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
// 导入 Shadcn UI 组件
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

**验证清单**：
- [ ] TypeScript 类型检查通过（`bun run type-check`）
- [ ] 所有原生 HTML 元素已替换
- [ ] 所有自定义 CSS 已迁移到 Tailwind
- [ ] CSS 文件已删除
- [ ] 所有功能正常工作
- [ ] 所有交互逻辑保持不变
- [ ] 响应式设计保持不变
- [ ] 无破坏性变更

**测试步骤**：
1. 运行类型检查：`bun run type-check`
2. 启动开发服务器：`bun run dev`
3. 手动测试所有功能
4. 检查不同屏幕尺寸的响应式效果
5. 检查不同状态的视觉反馈

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

## 常见场景处理

### 场景 1：复杂的条件样式
```tsx
// 使用 cn() 处理复杂条件
<Button 
  className={cn(
    'base-class',
    variant === 'primary' && 'bg-blue-500',
    variant === 'secondary' && 'bg-gray-500',
    isActive && 'ring-2 ring-blue-300',
    isDisabled && 'opacity-50 cursor-not-allowed',
    size === 'sm' && 'h-8 px-3 text-sm',
    size === 'lg' && 'h-12 px-6 text-lg'
  )}
>
  按钮
</Button>
```

### 场景 2：自定义对话框迁移
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

### 场景 3：自定义下拉菜单迁移
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

### 场景 4：HTML 内容样式
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

- ✅ 所有原生 HTML 元素已替换为 Shadcn UI 组件
- ✅ 所有自定义 CSS 已迁移到 Tailwind CSS
- ✅ CSS 文件已删除
- ✅ TypeScript 类型检查通过（0 错误）
- ✅ 所有功能正常工作
- ✅ 响应式设计保持不变
- ✅ 文档已更新（工作日志、迁移清单、CHANGELOG）

## 参考资源

- Shadcn UI 重构规范：`.kiro/steering/shadcn-ui-refactor.md`
- 已安装组件列表：`docs/guide/shadcn-components-installed.md`
- CSS 迁移清单：`docs/guide/CSS迁移清单.md`
- Shadcn UI 官方文档：https://ui.shadcn.com/
- Tailwind CSS 文档：https://tailwindcss.com/docs
