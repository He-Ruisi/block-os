# CSS Modules 迁移需求文档

## 1. 项目概述

### 1.1 背景
当前项目使用全局 CSS 文件管理组件样式，存在以下问题：
- 样式命名冲突风险
- 样式作用域不明确
- 难以追踪样式依赖关系
- 不利于组件复用和维护

### 1.2 目标
将组件 CSS 从全局 CSS 迁移到 CSS Modules，实现：
- 样式局部作用域，避免命名冲突
- 类型安全的样式引用
- 更好的样式组织和维护性
- 保持全局样式（design tokens、responsive、themes）不变

### 1.3 范围
- **包含**：所有组件级别的 CSS 文件（13 个）
- **不包含**：全局样式文件（design-tokens.css、responsive.css、touch-enhancements.css）

---

## 2. 详细需求

### 需求 1：添加 CSS Modules 类型声明

**描述**：创建 TypeScript 类型声明文件，支持 CSS Modules 导入。

**验收标准**：
- 创建 `src/styles/css.d.ts` 文件
- 声明 `*.module.css` 模块类型
- TypeScript 能够识别 CSS Modules 导入
- 无类型错误

**实现细节**：
```typescript
// src/styles/css.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
```

---

### 需求 2：保持全局样式文件不变

**描述**：全局样式文件保持普通 CSS 格式，不迁移到 CSS Modules。

**验收标准**：
- `src/styles/global/design-tokens.css` 保持不变
- `src/styles/global/responsive.css` 保持不变
- `src/styles/global/touch-enhancements.css` 保持不变
- 这些文件继续在 `src/index.css` 中全局导入

**原因**：
- 这些是全局样式，需要在整个应用中生效
- 包含 CSS 变量定义、响应式断点、全局重置样式
- 不应该被模块化

---

### 需求 3：迁移组件 CSS 到 CSS Modules

**描述**：将所有组件 CSS 文件迁移到 CSS Modules 格式。

**验收标准**：
- 所有组件 CSS 文件重命名为 `*.module.css`
- 文件移动到对应组件目录旁边
- 组件中使用 `import styles from` 方式导入
- 所有 `className` 改为 `styles.xxx` 引用
- 条件类名使用 `clsx` 处理

**涉及文件**（13 个）：
1. `AIFloatPanel.css` → `src/features/ai/components/AIFloatPanel.module.css`
2. `App.css` → `src/App.module.css`
3. `AuthPage.css` → `src/features/auth/components/AuthPage.module.css`
4. `BlockDerivativeSelector.css` → `src/features/blocks/components/BlockDerivativeSelector.module.css`
5. `BlockDetailPanel.css` → `src/features/blocks/components/BlockDetailPanel.module.css`
6. `BlockSpacePanel.css` → `src/features/blocks/components/BlockSpacePanel.module.css`
7. `DocumentBlocksPanel.css` → `src/features/blocks/components/DocumentBlocksPanel.module.css`
8. `Editor.css` → `src/features/editor/components/Editor.module.css`
9. `OCRPanel.css` → `src/plugins/built-in/ocr-plugin/OCRPanel.module.css`
10. `ProjectOverview.css` → `src/components/layout/ProjectOverview.module.css`
11. `SessionHistoryPanel.css` → `src/components/panel/SessionHistoryPanel.module.css`
12. `SettingsPanel.css` → `src/components/panel/SettingsPanel.module.css`
13. `SuggestionMenu.css` → `src/features/editor/components/SuggestionMenu.module.css`

---

### 需求 4：更新组件导入方式

**描述**：更新所有组件的 CSS 导入方式，从全局导入改为 CSS Modules 导入。

**验收标准**：
- 移除旧的 CSS 导入语句（`import '@/styles/components/XXX.css'`）
- 添加新的 CSS Modules 导入（`import styles from './XXX.module.css'`）
- 所有组件都使用新的导入方式
- 无导入错误

**示例**：
```typescript
// 旧方式
import '@/styles/components/Editor.css'

// 新方式
import styles from './Editor.module.css'
```

---

### 需求 5：更新 className 引用

**描述**：将所有硬编码的 className 字符串改为 styles 对象引用。

**验收标准**：
- 所有 `className="xxx"` 改为 `className={styles.xxx}`
- 条件类名使用 `clsx(styles.xxx, condition && styles.yyy)` 处理
- 动态类名使用 `clsx` 组合
- 保持所有样式功能不变

**示例**：
```typescript
// 旧方式
<div className="editor-container">
  <div className={`editor-content ${isActive ? 'active' : ''}`}>
    ...
  </div>
</div>

// 新方式
import clsx from 'clsx'
import styles from './Editor.module.css'

<div className={styles.editorContainer}>
  <div className={clsx(styles.editorContent, isActive && styles.active)}>
    ...
  </div>
</div>
```

---

### 需求 6：处理 CSS 类名命名转换

**描述**：CSS Modules 会将 kebab-case 类名转换为 camelCase。

**验收标准**：
- CSS 文件中的类名保持 kebab-case（`.editor-container`）
- TypeScript 中使用 camelCase 引用（`styles.editorContainer`）
- 所有类名转换正确
- 无样式丢失

**命名规则**：
- `.editor-container` → `styles.editorContainer`
- `.ai-float-panel` → `styles.aiFloatPanel`
- `.block-space-panel` → `styles.blockSpacePanel`

---

### 需求 7：清理旧的 CSS 文件

**描述**：删除 `src/styles/components/` 目录下的所有旧 CSS 文件。

**验收标准**：
- 所有组件 CSS 文件已移动到组件目录
- `src/styles/components/` 目录为空或删除
- 无遗留的旧 CSS 文件
- Git 历史中保留文件移动记录

---

### 需求 8：验证和测试

**描述**：确保迁移后所有功能和样式正常工作。

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
- Vite 6.0.3（原生支持 CSS Modules）
- React 18.3.1
- TypeScript 5.6.3
- clsx 2.1.1（已安装）

### 3.2 CSS Modules 配置
Vite 默认支持 CSS Modules，无需额外配置。文件名以 `.module.css` 结尾即可。

### 3.3 命名规范
- CSS 文件：`ComponentName.module.css`
- CSS 类名：kebab-case（`.editor-container`）
- TypeScript 引用：camelCase（`styles.editorContainer`）

---

## 4. 迁移策略

### 4.1 迁移顺序
按组件复杂度从低到高迁移：

**第 1 批（简单组件，3 个）**：
1. AuthPage
2. ProjectOverview
3. SuggestionMenu

**第 2 批（中等复杂度，5 个）**：
4. AIFloatPanel
5. BlockDerivativeSelector
6. BlockDetailPanel
7. DocumentBlocksPanel
8. SessionHistoryPanel

**第 3 批（复杂组件，5 个）**：
9. BlockSpacePanel
10. SettingsPanel
11. Editor
12. OCRPanel
13. App

### 4.2 迁移步骤（每个组件）
1. 重命名 CSS 文件为 `.module.css`
2. 移动文件到组件目录
3. 更新组件导入语句
4. 更新所有 className 引用
5. 处理条件类名（使用 clsx）
6. 运行类型检查
7. 在浏览器中验证样式
8. Git commit

### 4.3 回滚策略
- 每个组件迁移后立即 commit
- 如果出现问题，可以单独回滚某个组件
- 保留旧 CSS 文件直到所有组件迁移完成

---

## 5. 风险评估

### 5.1 高风险
- **类名引用错误**：手动替换 className 可能遗漏或错误
  - **缓解措施**：使用 grepSearch 查找所有 className，逐一检查
  
- **条件类名处理错误**：复杂的条件类名逻辑可能出错
  - **缓解措施**：仔细测试所有交互状态

### 5.2 中风险
- **样式丢失**：CSS Modules 作用域可能导致某些样式失效
  - **缓解措施**：在浏览器中逐个验证组件样式

- **类型错误**：CSS Modules 类型声明可能不完整
  - **缓解措施**：运行类型检查，及时修复

### 5.3 低风险
- **性能影响**：CSS Modules 可能略微增加构建时间
  - **缓解措施**：可接受的性能损失

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
- [ ] 无 ESLint 警告
- [ ] 所有 className 使用 styles 对象引用
- [ ] 条件类名使用 clsx 处理
- [ ] 无硬编码的类名字符串

### 6.3 文件组织
- [ ] CSS Modules 文件位于组件目录
- [ ] 全局样式文件保持在 `src/styles/global/`
- [ ] `src/styles/components/` 目录已清空或删除
- [ ] 文件命名符合规范（`*.module.css`）

### 6.4 文档更新
- [ ] 更新 CLAUDE.md（如有必要）
- [ ] 更新 ARCHITECTURE.md（如有必要）
- [ ] 创建迁移总结文档
- [ ] 更新 CHANGELOG.md

---

## 7. 预期效果

### 7.1 代码质量提升
- ✅ 样式局部作用域，避免命名冲突
- ✅ 类型安全的样式引用
- ✅ 更好的代码组织和可维护性
- ✅ 更容易追踪样式依赖

### 7.2 开发体验提升
- ✅ IDE 自动补全 CSS 类名
- ✅ 重构时自动更新类名引用
- ✅ 更容易定位样式问题
- ✅ 更好的组件封装

### 7.3 性能影响
- ⚠️ 构建时间可能略微增加（可接受）
- ✅ 运行时性能无影响
- ✅ 样式文件大小无明显变化

---

## 8. 时间估算

- **准备工作**：30 分钟（创建类型声明、验证配置）
- **第 1 批迁移**：1 小时（3 个简单组件）
- **第 2 批迁移**：2 小时（5 个中等复杂度组件）
- **第 3 批迁移**：3 小时（5 个复杂组件）
- **验证和测试**：1 小时
- **文档更新**：30 分钟

**总计**：约 8 小时

---

## 9. 参考资料

- [Vite CSS Modules 文档](https://vitejs.dev/guide/features.html#css-modules)
- [CSS Modules 规范](https://github.com/css-modules/css-modules)
- [clsx 文档](https://github.com/lukeed/clsx)
- [TypeScript CSS Modules 类型](https://github.com/mrmckeb/typescript-plugin-css-modules)

---

**文档版本**：v1.0  
**创建日期**：2026-04-16  
**最后更新**：2026-04-16  
**状态**：待审核
