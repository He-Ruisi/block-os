# CSS Modules 迁移实施指南

## 快速开始

本指南提供 CSS Modules 迁移的详细步骤和示例。

---

## 第 0 步：准备工作

### 1. 创建类型声明文件

```bash
# 创建 CSS Modules 类型声明
cat > src/styles/css.d.ts << 'EOF'
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
EOF
```

### 2. 验证 clsx 已安装

```bash
bun list | grep clsx
# 应该显示：clsx@2.1.1
```

### 3. 运行类型检查确保基线正常

```bash
bun run type-check
```

---

## 迁移步骤（以 AuthPage 为例）

### 步骤 1：重命名并移动 CSS 文件

```bash
# 从
src/styles/components/AuthPage.css

# 到
src/features/auth/components/AuthPage.module.css
```

使用 smartRelocate 或手动移动：
```bash
mv src/styles/components/AuthPage.css src/features/auth/components/AuthPage.module.css
```

### 步骤 2：更新组件导入

**旧代码**：
```typescript
// src/features/auth/components/AuthPage.tsx
import '../../../styles/components/AuthPage.css'
```

**新代码**：
```typescript
// src/features/auth/components/AuthPage.tsx
import clsx from 'clsx'
import styles from './AuthPage.module.css'
```

### 步骤 3：更新 className 引用

**旧代码**：
```typescript
<div className="auth-page">
  <div className="auth-card">
    <h1 className="auth-logo">BlockOS</h1>
    <button className={`auth-tab ${isLogin ? 'active' : ''}`}>
      登录
    </button>
  </div>
</div>
```

**新代码**：
```typescript
<div className={styles.authPage}>
  <div className={styles.authCard}>
    <h1 className={styles.authLogo}>BlockOS</h1>
    <button className={clsx(styles.authTab, isLogin && styles.active)}>
      登录
    </button>
  </div>
</div>
```

### 步骤 4：处理复杂的条件类名

**旧代码**：
```typescript
<div className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'} ${isStreaming ? 'streaming' : ''}`}>
```

**新代码**：
```typescript
<div className={clsx(
  styles.message,
  message.role === 'user' ? styles.userMessage : styles.aiMessage,
  isStreaming && styles.streaming
)}>
```

### 步骤 5：验证

```bash
# 1. 类型检查
bun run type-check

# 2. 启动开发服务器
bun run dev

# 3. 在浏览器中测试组件
# - 检查样式是否正常
# - 测试交互状态（hover、active、focus）
# - 测试响应式布局
```

### 步骤 6：Git Commit

```bash
git add -A
git commit -m "refactor: 迁移 AuthPage 到 CSS Modules

- 重命名 AuthPage.css → AuthPage.module.css
- 移动到组件目录
- 更新导入方式和 className 引用
- 使用 clsx 处理条件类名
- 验证：类型检查通过，样式正常"
```

---

## 常见模式和技巧

### 1. 简单类名

```typescript
// CSS
.container { }

// TypeScript
<div className={styles.container}>
```

### 2. 条件类名（单个）

```typescript
// CSS
.button { }
.active { }

// TypeScript
<button className={clsx(styles.button, isActive && styles.active)}>
```

### 3. 条件类名（多个）

```typescript
// CSS
.card { }
.highlighted { }
.disabled { }

// TypeScript
<div className={clsx(
  styles.card,
  isHighlighted && styles.highlighted,
  isDisabled && styles.disabled
)}>
```

### 4. 三元条件类名

```typescript
// CSS
.message { }
.userMessage { }
.aiMessage { }

// TypeScript
<div className={clsx(
  styles.message,
  isUser ? styles.userMessage : styles.aiMessage
)}>
```

### 5. 动态类名（不推荐，但有时需要）

```typescript
// 如果必须使用动态类名
const statusClass = `status${status.charAt(0).toUpperCase()}${status.slice(1)}`
<div className={styles[statusClass]}>
```

### 6. 组合全局类名和模块类名

```typescript
// 全局 Tailwind 类 + CSS Modules
<div className={clsx('flex items-center gap-2', styles.container)}>
```

---

## 类名转换对照表

| CSS (kebab-case) | TypeScript (camelCase) |
|------------------|------------------------|
| `.auth-page` | `styles.authPage` |
| `.ai-float-panel` | `styles.aiFloatPanel` |
| `.block-space-panel` | `styles.blockSpacePanel` |
| `.editor-container` | `styles.editorContainer` |
| `.user-message` | `styles.userMessage` |
| `.is-active` | `styles.isActive` |
| `.has-error` | `styles.hasError` |

---

## 故障排查

### 问题 1：类型错误 "Cannot find module './XXX.module.css'"

**原因**：TypeScript 无法识别 CSS Modules

**解决**：
1. 确保 `src/styles/css.d.ts` 文件存在
2. 重启 TypeScript 服务器（VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"）
3. 检查 `tsconfig.json` 是否包含 `src/styles/css.d.ts`

### 问题 2：样式不生效

**原因**：类名引用错误或 CSS 文件路径错误

**解决**：
1. 检查导入路径是否正确（`./XXX.module.css`）
2. 检查类名是否正确转换（kebab-case → camelCase）
3. 在浏览器开发者工具中检查生成的类名

### 问题 3：条件类名不工作

**原因**：clsx 使用错误

**解决**：
```typescript
// ❌ 错误
className={clsx(styles.button, isActive ? styles.active : '')}

// ✅ 正确
className={clsx(styles.button, isActive && styles.active)}
```

### 问题 4：全局样式冲突

**原因**：CSS Modules 和全局样式混用

**解决**：
- 全局样式（design-tokens、responsive）保持在 `src/styles/global/`
- 组件样式使用 CSS Modules
- 避免在 CSS Modules 中使用 `:global()` 选择器

---

## 迁移检查清单

每个组件迁移后检查：

- [ ] CSS 文件已重命名为 `.module.css`
- [ ] CSS 文件已移动到组件目录
- [ ] 组件中添加了 `import styles from './XXX.module.css'`
- [ ] 所有 `className="xxx"` 改为 `className={styles.xxx}`
- [ ] 条件类名使用 `clsx` 处理
- [ ] TypeScript 类型检查通过
- [ ] 开发服务器正常启动
- [ ] 浏览器中样式正常显示
- [ ] 交互状态正常工作
- [ ] Git commit 已创建

---

## 批量操作技巧

### 1. 查找所有需要迁移的组件

```bash
# 查找所有导入 styles/components/ 的文件
grep -r "styles/components" src/
```

### 2. 查找所有硬编码的 className

```bash
# 查找所有 className="xxx" 模式
grep -r 'className="[^{]' src/
```

### 3. 验证所有 CSS Modules 导入

```bash
# 查找所有 .module.css 导入
grep -r "\.module\.css" src/
```

---

## 参考示例

完整的迁移示例请参考：
- `.kiro/specs/css-modules-migration/requirements.md` - 详细需求文档
- 第一个迁移的组件（AuthPage）作为参考模板

---

**文档版本**：v1.0  
**创建日期**：2026-04-16  
**最后更新**：2026-04-16
