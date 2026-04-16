# CSS 模块化重构需求文档

## 1. 项目概述

### 1.1 背景
当前项目使用分散的组件 CSS 文件（13 个），存在以下问题：
- 样式命名冲突风险（缺乏命名空间）
- 文件过于分散，难以维护
- 样式依赖关系不清晰
- 缺乏统一的命名规范

### 1.2 目标
将分散的组件 CSS 合并为模块化的 CSS 文件，实现：
- 按功能域组织样式（ai、blocks、editor、panels）
- 使用 BEM 命名规范，避免命名冲突
- 更好的样式组织和可维护性
- 保持全局样式（design tokens、responsive、themes）不变

### 1.3 范围
- **包含**：所有组件级别的 CSS 文件（13 个）→ 合并为 4 个模块文件
- **不包含**：全局样式文件（design-tokens.css、responsive.css、touch-enhancements.css）

---

## 2. 详细需求

### 需求 1：创建模块化 CSS 目录结构

**描述**：重组 CSS 文件结构，按功能域合并相关样式。

**验收标准**：
- 创建 `src/styles/modules/` 目录
- 保留 `src/styles/global/` 目录（全局样式）
- 保留 `src/styles/themes/` 目录（主题样式）
- 删除 `src/styles/components/` 目录

**目录结构**：
```
src/styles/
├── global/              # 全局样式（保持不变）
│   ├── design-tokens.css
│   ├── responsive.css
│   └── touch-enhancements.css
├── themes/              # 主题样式（保持不变）
├── modules/             # 模块化样式（新建）
│   ├── ai.css          # AI 功能模块
│   ├── blocks.css      # Block 系统模块
│   ├── editor.css      # 编辑器模块
│   └── panels.css      # 面板模块
└── css.d.ts            # 类型声明（如需要）
```

---

### 需求 2：合并 AI 功能模块样式

**描述**：将 AI 相关组件的 CSS 合并到 `ai.css`。

**验收标准**：
- 创建 `src/styles/modules/ai.css`
- 合并以下文件：
  - `AIFloatPanel.css`
  - `SuggestionMenu.css`
- 添加模块注释说明
- 使用 BEM 命名规范
- 删除原始文件

**文件头注释**：
```css
/**
 * AI 功能模块样式
 * 包含：AIFloatPanel, SuggestionMenu
 * 
 * 命名规范：BEM (Block__Element--Modifier)
 * - .ai-float-panel
 * - .ai-float-panel__header
 * - .ai-float-panel__button--primary
 */
```

**涉及组件**：
- `src/features/ai/components/AIFloatPanel.tsx`
- `src/features/editor/components/SuggestionMenu.tsx`

---

### 需求 3：合并 Block 系统模块样式

**描述**：将 Block 相关组件的 CSS 合并到 `blocks.css`。

**验收标准**：
- 创建 `src/styles/modules/blocks.css`
- 合并以下文件：
  - `BlockSpacePanel.css`
  - `BlockDetailPanel.css`
  - `BlockDerivativeSelector.css`
  - `DocumentBlocksPanel.css`
- 添加模块注释说明
- 使用 BEM 命名规范
- 删除原始文件

**文件头注释**：
```css
/**
 * Block 系统模块样式
 * 包含：BlockSpacePanel, BlockDetailPanel, BlockDerivativeSelector, DocumentBlocksPanel
 * 
 * 命名规范：BEM (Block__Element--Modifier)
 * - .block-space-panel
 * - .block-detail-panel
 * - .block-derivative-selector
 * - .document-blocks-panel
 */
```

**涉及组件**：
- `src/features/blocks/components/BlockSpacePanel.tsx`
- `src/features/blocks/components/BlockDetailPanel.tsx`
- `src/features/blocks/components/BlockDerivativeSelector.tsx`
- `src/features/blocks/components/DocumentBlocksPanel.tsx`

---

### 需求 4：合并编辑器模块样式

**描述**：将编辑器相关组件的 CSS 合并到 `editor.css`。

**验收标准**：
- 创建 `src/styles/modules/editor.css`
- 合并以下文件：
  - `Editor.css`
- 添加模块注释说明
- 使用 BEM 命名规范
- 删除原始文件

**文件头注释**：
```css
/**
 * 编辑器模块样式
 * 包含：Editor (TipTap 编辑器)
 * 
 * 命名规范：BEM (Block__Element--Modifier)
 * - .editor-container
 * - .editor-content
 * - .bubble-menu
 */
```

**涉及组件**：
- `src/features/editor/components/Editor.tsx`

---

### 需求 5：合并面板模块样式

**描述**：将其他面板组件的 CSS 合并到 `panels.css`。

**验收标准**：
- 创建 `src/styles/modules/panels.css`
- 合并以下文件：
  - `App.css`
  - `AuthPage.css`
  - `ProjectOverview.css`
  - `SessionHistoryPanel.css`
  - `SettingsPanel.css`
  - `OCRPanel.css`
- 添加模块注释说明
- 使用 BEM 命名规范
- 删除原始文件

**文件头注释**：
```css
/**
 * 面板模块样式
 * 包含：App, AuthPage, ProjectOverview, SessionHistoryPanel, SettingsPanel, OCRPanel
 * 
 * 命名规范：BEM (Block__Element--Modifier)
 * - .app-container
 * - .auth-page
 * - .project-overview
 * - .session-history-panel
 * - .settings-panel
 * - .ocr-panel
 */
```

**涉及组件**：
- `src/App.tsx`
- `src/features/auth/components/AuthPage.tsx`
- `src/components/layout/ProjectOverview.tsx`
- `src/components/panel/SessionHistoryPanel.tsx`
- `src/components/panel/SettingsPanel.tsx`
- `src/plugins/built-in/ocr-plugin/OCRPanel.tsx`

---

### 需求 6：统一 BEM 命名规范

**描述**：将所有 CSS 类名统一为 BEM 命名规范。

**验收标准**：
- 所有块级元素使用 `.block-name` 格式
- 所有元素使用 `.block-name__element` 格式
- 所有修饰符使用 `.block-name--modifier` 或 `.block-name__element--modifier` 格式
- 避免使用通用类名（如 `.panel`、`.header`、`.button`）
- 所有类名使用 kebab-case

**命名示例**：
```css
/* ❌ 坏例子 - 通用类名，容易冲突 */
.panel { }
.header { }
.button { }
.active { }

/* ✅ 好例子 - BEM 命名，清晰的命名空间 */
.block-detail-panel { }
.block-detail-panel__header { }
.block-detail-panel__button { }
.block-detail-panel__button--primary { }
.block-detail-panel--active { }
```

**命名规则**：
- **Block（块）**：独立的组件或模块
  - 格式：`.component-name`
  - 示例：`.block-space-panel`、`.editor-container`、`.auth-page`

- **Element（元素）**：块的组成部分
  - 格式：`.block-name__element-name`
  - 示例：`.block-space-panel__header`、`.editor-container__toolbar`

- **Modifier（修饰符）**：块或元素的状态/变体
  - 格式：`.block-name--modifier` 或 `.block-name__element--modifier`
  - 示例：`.block-space-panel--collapsed`、`.button--primary`

---

### 需求 7：更新组件导入方式

**描述**：更新所有组件的 CSS 导入路径，指向新的模块化文件。

**验收标准**：
- 移除旧的 CSS 导入语句（`import '@/styles/components/XXX.css'`）
- 添加新的模块导入（`import '@/styles/modules/XXX.css'`）
- 所有组件都使用新的导入方式
- 无导入错误

**导入映射**：
```typescript
// AI 模块
import '@/styles/modules/ai.css'  // AIFloatPanel, SuggestionMenu

// Block 模块
import '@/styles/modules/blocks.css'  // BlockSpacePanel, BlockDetailPanel, etc.

// Editor 模块
import '@/styles/modules/editor.css'  // Editor

// Panels 模块
import '@/styles/modules/panels.css'  // App, AuthPage, ProjectOverview, etc.
```

**注意事项**：
- 每个模块 CSS 只需在一个地方导入（通常在 `src/index.css` 或主组件）
- 避免重复导入同一个模块文件

---

### 需求 8：更新 className 引用（如需要）

**描述**：如果类名发生变化，更新组件中的 className 引用。

**验收标准**：
- 所有 className 使用新的 BEM 命名
- 保持所有样式功能不变
- 无样式丢失或错误

**示例**：
```typescript
// 如果类名从 .panel 改为 .block-detail-panel
// 旧代码
<div className="panel">

// 新代码
<div className="block-detail-panel">
```

**注意**：
- 如果原有类名已经符合 BEM 规范，可以保持不变
- 只更新不符合规范的通用类名

---

### 需求 9：在 index.css 中统一导入模块样式

**描述**：在 `src/index.css` 中统一导入所有模块样式。

**验收标准**：
- 在 `src/index.css` 中添加模块样式导入
- 按顺序导入：全局样式 → 模块样式
- 添加注释说明
- 移除组件中的重复导入（可选优化）

**示例**：
```css
/* src/index.css */

/* 全局样式 */
@import './styles/global/design-tokens.css';
@import './styles/global/responsive.css';
@import './styles/global/touch-enhancements.css';

/* 模块样式 */
@import './styles/modules/ai.css';
@import './styles/modules/blocks.css';
@import './styles/modules/editor.css';
@import './styles/modules/panels.css';

/* Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 需求 10：清理旧的 CSS 文件

**描述**：删除 `src/styles/components/` 目录下的所有旧 CSS 文件。

**验收标准**：
- 所有组件 CSS 文件已合并到模块文件
- `src/styles/components/` 目录已删除
- 无遗留的旧 CSS 文件
- Git 历史中保留文件移动记录

---

### 需求 11：验证和测试

**描述**：确保重构后所有功能和样式正常工作。

**验收标准**：
- TypeScript 类型检查通过（`bun run type-check`）
- 开发服务器正常启动（`bun run dev`）
- 所有组件样式正常显示
- 无样式冲突或丢失
- 响应式样式正常工作
- 主题切换正常工作

---

## 3. 技术约束

### 3.1 技术栈
- Vite 6.0.3
- React 18.3.1
- TypeScript 5.6.3
- 普通 CSS（不使用 CSS Modules）

### 3.2 命名规范
- **BEM 命名规范**：Block__Element--Modifier
- **CSS 类名**：kebab-case（`.block-name__element--modifier`）
- **避免通用类名**：如 `.panel`、`.header`、`.button`

### 3.3 文件组织
- 全局样式：`src/styles/global/`
- 模块样式：`src/styles/modules/`
- 主题样式：`src/styles/themes/`

---

## 4. 迁移策略

### 4.1 文件合并映射

| 模块文件 | 包含的组件 CSS | 组件数量 |
|---------|---------------|---------|
| `ai.css` | AIFloatPanel, SuggestionMenu | 2 |
| `blocks.css` | BlockSpacePanel, BlockDetailPanel, BlockDerivativeSelector, DocumentBlocksPanel | 4 |
| `editor.css` | Editor | 1 |
| `panels.css` | App, AuthPage, ProjectOverview, SessionHistoryPanel, SettingsPanel, OCRPanel | 6 |

### 4.2 迁移步骤

**步骤 1：创建目录结构**
```bash
mkdir -p src/styles/modules
```

**步骤 2：合并 AI 模块**
1. 创建 `src/styles/modules/ai.css`
2. 添加文件头注释
3. 复制 `AIFloatPanel.css` 内容
4. 复制 `SuggestionMenu.css` 内容
5. 统一 BEM 命名（如需要）
6. 更新组件导入

**步骤 3：合并 Blocks 模块**
1. 创建 `src/styles/modules/blocks.css`
2. 添加文件头注释
3. 复制 4 个 Block 相关 CSS 文件内容
4. 统一 BEM 命名（如需要）
5. 更新组件导入

**步骤 4：合并 Editor 模块**
1. 创建 `src/styles/modules/editor.css`
2. 添加文件头注释
3. 复制 `Editor.css` 内容
4. 统一 BEM 命名（如需要）
5. 更新组件导入

**步骤 5：合并 Panels 模块**
1. 创建 `src/styles/modules/panels.css`
2. 添加文件头注释
3. 复制 6 个 Panel 相关 CSS 文件内容
4. 统一 BEM 命名（如需要）
5. 更新组件导入

**步骤 6：更新 index.css**
1. 在 `src/index.css` 中添加模块导入
2. 按顺序：全局样式 → 模块样式 → Tailwind

**步骤 7：清理旧文件**
1. 删除 `src/styles/components/` 目录
2. 验证所有样式正常工作

**步骤 8：验证和测试**
1. 运行类型检查
2. 启动开发服务器
3. 在浏览器中测试所有组件

### 4.3 回滚策略
- 每个模块合并后立即 commit
- 如果出现问题，可以单独回滚某个模块
- 保留旧 CSS 文件直到所有模块合并完成并验证通过

---

## 5. 风险评估

### 5.1 高风险
- **类名冲突**：合并后可能出现类名冲突
  - **缓解措施**：使用 BEM 命名规范，确保每个类名有明确的命名空间

- **样式覆盖顺序**：合并后 CSS 顺序可能影响样式优先级
  - **缓解措施**：保持原有的 CSS 顺序，使用更具体的选择器

### 5.2 中风险
- **样式丢失**：合并过程中可能遗漏某些样式
  - **缓解措施**：仔细检查每个文件，使用 diff 工具对比

- **导入路径错误**：更新导入路径时可能出错
  - **缓解措施**：使用 grepSearch 查找所有导入，逐一更新

### 5.3 低风险
- **文件大小增加**：合并后单个文件可能较大
  - **缓解措施**：可接受，现代浏览器和构建工具能很好地处理

---

## 6. 验收清单

### 6.1 功能验收
- [ ] 所有组件样式正常显示
- [ ] 响应式布局正常工作
- [ ] 主题切换正常工作
- [ ] 交互状态（hover、active、focus）正常
- [ ] 条件样式（如 isActive、isOpen）正常

### 6.2 代码质量
- [ ] TypeScript 类型检查通过（0 错误）
- [ ] 所有 CSS 类名使用 BEM 命名规范
- [ ] 每个模块文件有清晰的注释说明
- [ ] 无重复的 CSS 规则
- [ ] 无未使用的 CSS 类

### 6.3 文件组织
- [ ] 模块文件位于 `src/styles/modules/`
- [ ] 全局样式文件保持在 `src/styles/global/`
- [ ] `src/styles/components/` 目录已删除
- [ ] `src/index.css` 正确导入所有模块

### 6.4 文档更新
- [ ] 更新 CLAUDE.md（如有必要）
- [ ] 更新 ARCHITECTURE.md（如有必要）
- [ ] 创建迁移总结文档
- [ ] 更新 CHANGELOG.md

---

## 7. 预期效果

### 7.1 代码质量提升
- ✅ 样式按功能域组织，更易维护
- ✅ BEM 命名规范，避免命名冲突
- ✅ 减少文件数量（13 → 4）
- ✅ 更清晰的样式依赖关系

### 7.2 开发体验提升
- ✅ 更容易找到相关样式
- ✅ 更容易理解样式组织
- ✅ 更容易添加新样式
- ✅ 更容易重构和优化

### 7.3 性能影响
- ✅ 减少 HTTP 请求（合并文件）
- ✅ 更好的缓存策略（按模块缓存）
- ⚠️ 单个文件略大（可接受）

---

## 8. 时间估算

- **准备工作**：30 分钟（创建目录、验证配置）
- **合并 AI 模块**：30 分钟
- **合并 Blocks 模块**：1 小时
- **合并 Editor 模块**：30 分钟
- **合并 Panels 模块**：1.5 小时
- **更新导入和验证**：1 小时
- **清理和文档**：30 分钟

**总计**：约 5-6 小时

---

## 9. BEM 命名规范详解

### 9.1 基本规则

**Block（块）**：独立的组件或模块
```css
.block-name { }
```

**Element（元素）**：块的组成部分
```css
.block-name__element-name { }
```

**Modifier（修饰符）**：块或元素的状态/变体
```css
.block-name--modifier { }
.block-name__element--modifier { }
```

### 9.2 命名示例

**坏例子**（通用类名，容易冲突）：
```css
.panel { }
.header { }
.title { }
.button { }
.active { }
.disabled { }
```

**好例子**（BEM 命名，清晰的命名空间）：
```css
/* Block */
.block-detail-panel { }

/* Elements */
.block-detail-panel__header { }
.block-detail-panel__title { }
.block-detail-panel__content { }
.block-detail-panel__footer { }
.block-detail-panel__button { }

/* Modifiers */
.block-detail-panel--collapsed { }
.block-detail-panel__button--primary { }
.block-detail-panel__button--disabled { }
```

### 9.3 实际应用

**AuthPage 组件**：
```css
/* Block */
.auth-page { }

/* Elements */
.auth-page__card { }
.auth-page__header { }
.auth-page__logo { }
.auth-page__subtitle { }
.auth-page__tabs { }
.auth-page__tab { }
.auth-page__form { }
.auth-page__field { }
.auth-page__label { }
.auth-page__input { }
.auth-page__submit { }
.auth-page__error { }
.auth-page__footer { }
.auth-page__link { }

/* Modifiers */
.auth-page__tab--active { }
.auth-page__submit--loading { }
```

---

## 10. 参考资料

- [BEM 命名规范](https://getbem.com/)
- [CSS 架构最佳实践](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/)
- [Vite CSS 文档](https://vitejs.dev/guide/features.html#css)

---

**文档版本**：v2.0  
**创建日期**：2026-04-16  
**最后更新**：2026-04-16  
**状态**：待审核
