# View 组件 Shadcn UI 重构 Checklist

本文档提供每个 View 组件完成 Shadcn UI 重构后的验证清单。

---

## 使用方法

每完成一个 View 组件的重构，按照以下步骤验证：

### 1. 运行硬验证命令（必须全部为空）

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

**期望结果**：上述 4 条命令全部为空（无输出）

---

### 2. 填写 Checklist

#### 组件信息
- **组件名称**：`_______________`
- **文件路径**：`_______________`
- **重构时间**：`_______________`
- **重构人员**：`_______________`

#### 硬验证（必须全部通过）
- [ ] ✅ 命令 1：无原生 HTML 元素（button/input/textarea/select）
- [ ] ✅ 命令 2：无 import store/service
- [ ] ✅ 命令 3：无超长 className（>120 字符）
- [ ] ✅ 命令 4：无 import 领域模型类型
- [ ] ✅ TypeScript 类型检查通过（`bun run type-check`）

#### 软验证（必须全部满足）
- [ ] 所有原生 HTML 元素已替换为 Shadcn UI 组件
- [ ] 所有自定义 CSS 已迁移到 Tailwind CSS
- [ ] CSS 文件已删除（如果有）
- [ ] 优先使用 Shell 组件（PanelShell、SearchInput 等）
- [ ] 使用 `cn()` 处理动态类名
- [ ] 使用 `cva()` 处理状态变体（≥2 个状态）
- [ ] 图标统一使用 `lucide-react`
- [ ] 所有功能正常工作
- [ ] 所有交互逻辑保持不变
- [ ] 响应式设计保持不变
- [ ] 无破坏性变更

#### 文档更新
- [ ] 更新 `docs/guide/CSS迁移清单.md`（标记为已完成）
- [ ] 追加工作日志到 `docs/logs/YYYY-MM/YYYY-MM-DD.md`
- [ ] 如果是重要里程碑，更新 `docs/CHANGELOG.md`

---

## 常见问题排查

### 问题 1：硬验证命令 1 有输出（发现原生 HTML 元素）

**原因**：View 中仍有 `<button>`、`<input>` 等原生元素

**解决方案**：
```bash
# 查看具体位置
grep -RnE "<(button|input|textarea|select)\b" src/features/**/components/**/*View.tsx

# 替换为 Shadcn UI 组件
<button> → <Button>
<input> → <Input>
<textarea> → <Textarea>
<select> → <Select>
```

---

### 问题 2：硬验证命令 2 有输出（发现 import store/service）

**原因**：View 直接 import 了 store 或 service

**解决方案**：
```bash
# 查看具体位置
grep -RnE "from ['\"]@/(storage|services)" src/features/**/components/**/*View.tsx

# 移除 import，数据应该通过 props 从 Container 传入
# ❌ import { blockStore } from '@/storage/blockStore'
# ✅ 通过 props 接收数据：{ blocks: BlockViewModel[] }
```

---

### 问题 3：硬验证命令 3 有输出（发现超长 className）

**原因**：单行 className 超过 120 字符（通常是 v0 导出的代码）

**解决方案**：
```bash
# 查看具体位置
grep -RnE 'className="[^"]{120,}"' src/features

# 使用 cn() 拆行
# ❌ className="flex items-center justify-between p-4 border-b bg-card text-card-foreground rounded-lg shadow-sm hover:bg-accent transition-colors"
# ✅ className={cn(
#      'flex items-center justify-between p-4',
#      'border-b bg-card text-card-foreground',
#      'rounded-lg shadow-sm hover:bg-accent transition-colors'
#    )}

# 或使用 cva() 定义变体
# ✅ const cardVariants = cva('base-class', { variants: {...} })
```

---

### 问题 4：硬验证命令 4 有输出（发现 import 领域模型类型）

**原因**：View 直接 import 了 `types/models/*` 中的领域模型类型

**解决方案**：
```bash
# 查看具体位置
grep -RnE "from ['\"]@/types/models" src/features/**/components/**/*View.tsx

# 移除 import，使用 ViewModel 类型
# ❌ import type { Block } from '@/types/models/block'
# ✅ import type { BlockViewModel } from './types'
```

---

### 问题 5：TypeScript 类型检查失败

**原因**：类型定义不匹配或缺失

**解决方案**：
```bash
# 运行类型检查查看具体错误
bun run type-check

# 常见错误：
# 1. Props 类型不匹配 → 检查 View 的 Props 接口
# 2. 缺少 import → 添加缺失的 import
# 3. Shadcn UI 组件 props 错误 → 查看 Shadcn UI 文档
```

---

## 重构优先级

### 推荐顺序（按复杂度从低到高）

1. **DocumentBlocksPanelView**（已拆分，立刻 shadcn 化）
2. **BlockSpacePanelView**（已拆分，立刻 shadcn 化）
3. **BlockDetailPanelView**（已拆分，立刻 shadcn 化）
4. **BlockDerivativeSelectorView**（已拆分，立刻 shadcn 化）
5. **EditorToolbar**（中等复杂度）
6. **EditorBreadcrumb**（简单）
7. **SuggestionMenu**（中等复杂度）
8. **AIFloatPanel**（复杂）
9. **ChatInput**（简单）
10. **ChatLayout**（中等复杂度）

---

## 重构节奏建议

### 拆完 1 个组件 → 立刻 shadcn 化它的 View

**不要**"先全部拆完再统一 shadcn 化"。

**原因**：
- shells 在用的过程中会迭代
- 早期 shadcn 化可以反推出新的 shell
- 一次只做一个组件，AI 不容易跑偏

### 每个 View 完成后立即验证

1. 运行 4 条硬验证命令
2. 运行 `bun run type-check`
3. 手动测试所有功能
4. 填写本 Checklist
5. 更新文档

---

## 示例：DocumentBlocksPanelView 重构 Checklist

#### 组件信息
- **组件名称**：`DocumentBlocksPanelView`
- **文件路径**：`src/features/blocks/components/DocumentBlocksPanel/DocumentBlocksPanelView.tsx`
- **重构时间**：`2026-04-17 14:00`
- **重构人员**：`Kiro AI`

#### 硬验证（必须全部通过）
- [x] ✅ 命令 1：无原生 HTML 元素
- [x] ✅ 命令 2：无 import store/service
- [x] ✅ 命令 3：无超长 className
- [x] ✅ 命令 4：无 import 领域模型类型
- [x] ✅ TypeScript 类型检查通过

#### 软验证（必须全部满足）
- [x] 所有原生 HTML 元素已替换为 Shadcn UI 组件
- [x] 所有自定义 CSS 已迁移到 Tailwind CSS
- [x] CSS 文件已删除
- [x] 优先使用 Shell 组件（PanelShell、SearchInput）
- [x] 使用 `cn()` 处理动态类名
- [x] 使用 `cva()` 处理状态变体
- [x] 图标统一使用 `lucide-react`
- [x] 所有功能正常工作
- [x] 所有交互逻辑保持不变
- [x] 响应式设计保持不变
- [x] 无破坏性变更

#### 文档更新
- [x] 更新 `docs/guide/CSS迁移清单.md`
- [x] 追加工作日志到 `docs/logs/2026-04/2026-04-17.md`
- [x] 更新 `docs/CHANGELOG.md`（v1.36.0）

---

## 参考资源

- UI 重构 Skill：`.kiro/skills/ui-refactor.md`
- Shell 设计 Skill：`.kiro/skills/shells-design.md`
- Container/View 模式：`.kiro/skills/container-view-pattern.md`
- Shell 组件 API：`src/components/shells/API.md`
- Shadcn UI 文档：https://ui.shadcn.com/
