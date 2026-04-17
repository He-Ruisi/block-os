---
name: shells-design
description: Shell 组件设计专家 - 识别重复 UI 模式并创建可复用 Shell 组件
activation: manual
tags: [architecture, shells, ui-patterns, reusability]
---

# Shells Design Skill - Shell 组件设计专家

## ⚠️ 作用域限定

**本 skill 用于**：
- ✅ 识别重复的 UI 模式
- ✅ 设计新的 Shell 组件
- ✅ 扩展现有 Shell 组件
- ✅ 重构 View 组件以使用 Shell

**不用于**：
- ❌ 创建 Shadcn UI 基础组件（使用 `bunx shadcn add`）
- ❌ 重构 Container 组件（使用 `container-view-pattern` skill）
- ❌ 业务逻辑实现

---

## 什么是 Shell 组件？

**Shell 组件**是基于 Shadcn UI 组合而成的**项目级展示壳组件**，用于：
1. **减少重复代码**：将重复的 UI 模式抽象为可复用组件
2. **统一视觉风格**：确保相同场景的 UI 一致性
3. **简化 View 层**：View 组件只需传递数据，不关心 UI 细节

**Shell 组件的特点**：
- 无业务逻辑（不访问 store/service）
- 基于 Shadcn UI 组合
- 可配置（通过 props）
- 可复用（多个 View 共享）

---

## 何时创建 Shell 组件？

### 触发条件（满足任一即可）

1. **重复 UI 模式**：同一段 UI 代码出现在 ≥2 个 View 中
2. **长 className**：单个元素的 className 超过 8 个 Tailwind 类
3. **复杂组合**：多个 Shadcn UI 组件组合成固定模式（如面板头部 = 标题 + 关闭按钮 + 操作按钮）
4. **v0 导出**：从 v0.dev 导出的长 className 代码

### 不应创建 Shell 的情况

- ❌ 只用一次的 UI（保持在 View 内）
- ❌ 业务逻辑复杂的组件（应该是 feature 组件）
- ❌ Shadcn UI 已有的组件（直接用 Shadcn UI）

---

## Shell 组件设计流程

### 1. 识别重复模式 🔍

**检查清单**：
- [ ] 这段 UI 在多个 View 中出现
- [ ] className 超过 8 个 Tailwind 类
- [ ] 包含固定的 Shadcn UI 组合
- [ ] 有明确的视觉模式（如卡片、面板、输入框）

**示例**：
```tsx
// ❌ 重复出现在 3 个 View 中
<div className="flex items-center justify-between p-4 border-b">
  <h3 className="text-lg font-semibold">{title}</h3>
  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-4 w-4" />
  </Button>
</div>
```

### 2. 设计 Shell API 📐

**API 设计原则**：
1. **Props 最小化**：只暴露必要的配置项
2. **回调传值**：回调函数传值（string/boolean/id），不传 Event
3. **children 优先**：内容区域使用 children，不用 render props
4. **可选配置**：提供合理的默认值

**API 模板**：
```typescript
export interface [ShellName]Props {
  // 必需 props
  title: string
  
  // 可选 props（提供默认值）
  description?: string
  icon?: LucideIcon
  
  // 回调（传值，不传 Event）
  onClick?: () => void
  onChange?: (value: string) => void
  
  // 样式定制
  className?: string
  
  // 内容区域
  children?: React.ReactNode
}
```

### 3. 实现 Shell 组件 🔧

**实现步骤**：

#### 3.1 创建文件
```bash
# 在 src/components/shells/ 下创建文件
touch src/components/shells/[ShellName].tsx
```

#### 3.2 编写组件
```typescript
// src/components/shells/PanelHeader.tsx
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PanelHeaderProps {
  title: string
  onClose?: () => void
  actions?: React.ReactNode
  className?: string
}

export function PanelHeader({ 
  title, 
  onClose, 
  actions, 
  className 
}: PanelHeaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b',
      className
    )}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex items-center gap-2">
        {actions}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### 3.3 导出组件
```typescript
// src/components/shells/index.ts
export { PanelHeader } from './PanelHeader'
export type { PanelHeaderProps } from './PanelHeader'
```

### 4. 更新文档 📝

**必须更新的文档**：

#### 4.1 更新 API.md
```bash
# 在 src/components/shells/API.md 中添加新组件的 API 文档
```

**API 文档模板**：
```markdown
### [ShellName]

**用途**：[简短描述]

**API**：
\`\`\`typescript
interface [ShellName]Props {
  // props 定义
}
\`\`\`

**使用示例**：
\`\`\`tsx
<[ShellName]
  prop1="value1"
  prop2={value2}
  onAction={handleAction}
>
  {children}
</[ShellName]>
\`\`\`

**注意事项**：
- [关键点 1]
- [关键点 2]
```

#### 4.2 更新 Skill 文档
```bash
# 在以下文件中添加新 Shell 组件到清单：
# - .kiro/skills/container-view-pattern.md
# - .kiro/skills/ui-refactor.md
# - .kiro/steering/shadcn-ui-refactor.md
```

### 5. 重构 View 使用 Shell 🔄

**重构步骤**：

#### 5.1 替换重复代码
```tsx
// ❌ 重构前
<div className="flex items-center justify-between p-4 border-b">
  <h3 className="text-lg font-semibold">{title}</h3>
  <Button variant="ghost" size="icon" onClick={onClose}>
    <X className="h-4 w-4" />
  </Button>
</div>

// ✅ 重构后
<PanelHeader title={title} onClose={onClose} />
```

#### 5.2 验证功能
- [ ] 所有功能保持不变
- [ ] 视觉效果一致
- [ ] TypeScript 类型检查通过

---

## 何时扩展 Shell 组件？

### 触发条件

1. **新增配置项**：现有 Shell 缺少某个常用配置
2. **新增变体**：需要新的视觉样式（如 size、variant）
3. **新增功能**：需要新的交互行为（如拖拽、悬停）

### 扩展步骤

#### 1. 评估影响范围
```bash
# 查找所有使用该 Shell 的地方
grep -r "<[ShellName]" src/
```

#### 2. 添加新 Props
```typescript
export interface PanelHeaderProps {
  // 现有 props
  title: string
  onClose?: () => void
  
  // 新增 props（必须可选，提供默认值）
  size?: 'sm' | 'md' | 'lg'  // 新增
  showBorder?: boolean        // 新增
}
```

#### 3. 实现新功能
```typescript
export function PanelHeader({ 
  title, 
  onClose,
  size = 'md',           // 默认值
  showBorder = true,     // 默认值
}: PanelHeaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-between',
      size === 'sm' && 'p-2',
      size === 'md' && 'p-4',
      size === 'lg' && 'p-6',
      showBorder && 'border-b'
    )}>
      {/* ... */}
    </div>
  )
}
```

#### 4. 更新文档
- 更新 `API.md` 中的 API 文档
- 添加新的使用示例

---

## Shell 组件最佳实践

### ✅ 推荐做法

1. **单一职责**：一个 Shell 只做一件事
2. **可组合**：Shell 可以嵌套使用
3. **无副作用**：不访问 store/service，不修改全局状态
4. **类型安全**：导出 Props 类型，方便 View 使用
5. **文档完善**：API.md 中有清晰的使用示例

### ❌ 避免做法

1. **不要包含业务逻辑**：Shell 只负责展示
2. **不要直接访问 store**：数据通过 props 传入
3. **不要过度抽象**：只用一次的 UI 不需要 Shell
4. **不要回调传 Event**：回调传值（string/boolean/id）
5. **不要创建巨型 Shell**：超过 200 行的 Shell 应该拆分

---

## 现有 Shell 组件清单

### 1. PanelShell
**用途**：面板容器（右侧面板统一容器）  
**API**：`{ children, className? }`

### 2. PanelHeader
**用途**：面板头部（标题 + 关闭按钮 + 操作按钮）  
**API**：`{ title, onClose?, actions?, className? }`

### 3. SearchInput
**用途**：搜索输入框（带图标和清除按钮）  
**API**：`{ value, onChange: (value: string) => void, placeholder?, className? }`

### 4. BlockCardShell
**用途**：Block 卡片（标题 + 标签 + 内容）  
**API**：`{ title?, tags?, children, onClick?, onDragStart?, isActive?, draggable?, className? }`

### 5. EmptyState
**用途**：空状态（图标 + 标题 + 描述 + 操作按钮）  
**API**：`{ icon?: LucideIcon, title, description?, action?, className? }`

---

## 快速命令

```bash
# 查找重复的 UI 模式
grep -r "className=" src/features/**/components/**/*View.tsx | sort | uniq -c | sort -rn

# 查找长 className（超过 120 字符）
grep -RnE 'className="[^"]{120,}"' src/features

# 查找使用某个 Shell 的所有地方
grep -r "<PanelHeader" src/

# 创建新 Shell 组件
touch src/components/shells/[ShellName].tsx
```

---

## 成功标准

- ✅ Shell 组件无业务逻辑
- ✅ Shell 组件基于 Shadcn UI 组合
- ✅ Shell 组件有清晰的 API 文档
- ✅ Shell 组件被 ≥2 个 View 使用
- ✅ Shell 组件通过 TypeScript 类型检查
- ✅ 所有使用 Shell 的 View 功能正常

---

## 参考资源

- **Shell 组件设计指南**：`.kiro/skills/shells-design.md`
- **Shell 组件 API 文档**：`src/components/shells/API.md`
- **Shadcn UI 重构规范**：`.kiro/steering/shadcn-ui-refactor.md`
- Shadcn UI 文档：https://ui.shadcn.com/
