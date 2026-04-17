# BlockOS 样式架构说明

## 样式文件组织

BlockOS 使用分层的样式架构，职责清晰分离：

```
src/
├── index.css                          # 主入口（导入顺序很重要）
├── styles/
│   ├── shadcn-theme.css              # 主要颜色系统（优先级最高）
│   └── global/
│       ├── design-tokens.css         # 编辑器和主题特定样式
│       ├── responsive.css            # 响应式样式
│       └── touch-enhancements.css    # 触摸增强
```

## 导入顺序（重要）

在 `src/index.css` 中的导入顺序：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 1. Shadcn UI Theme (主要颜色系统) */
@import './styles/shadcn-theme.css';

/* 2. BlockOS Design Tokens (编辑器和主题特定样式) */
@import './styles/global/design-tokens.css';
```

**为什么这个顺序很重要？**
- `shadcn-theme.css` 先导入，定义全局颜色系统
- `design-tokens.css` 后导入，可以覆盖特定主题（如 Newsprint）的样式
- CSS 的层叠特性：后导入的样式优先级更高

## 文件职责

### 1. `shadcn-theme.css` - 主要颜色系统

**职责**：
- Shadcn UI 默认颜色（HSL 格式）
- BlockOS 自定义强调色（HSL、RGB、HEX 三种格式）
- 通用设计变量（圆角、阴影、间距）
- 暗色模式支持

**包含的变量**：
```css
/* Shadcn UI 颜色 */
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring

/* BlockOS 强调色 */
--accent-green, --accent-green-rgb, --accent-green-hex
--accent-green-dark, --accent-green-dark-rgb, --accent-green-dark-hex
--accent-red, --accent-red-rgb, --accent-red-hex

/* 通用设计变量 */
--border-radius, --border-radius-sm/md/lg/xl
--shadow-sm/md/lg/card/panel
--spacing-xs/sm/md/lg/xl
```

**使用场景**：
- 所有 Shadcn UI 组件
- 所有 View 组件
- 所有 Shell 组件
- 所有 Layout 组件

### 2. `design-tokens.css` - 编辑器和主题特定样式

**职责**：
- 编辑器专用变量（字体、代码块、工具栏）
- Newsprint 主题样式（完整的主题覆盖）
- 编辑器组件样式（BubbleMenu、SourceBlock 等）

**包含的变量**：
```css
/* 编辑器字体 */
--editor-font-family, --editor-font-serif, --editor-font-mono
--editor-font-size, --editor-line-height, --editor-max-width

/* 代码块 */
--code-bg, --code-border, --code-color, --code-inline-bg

/* 工具栏 */
--toolbar-height, --toolbar-btn-size, --toolbar-btn-radius
```

**使用场景**：
- TipTap 编辑器组件
- 编辑器工具栏
- 代码块渲染
- Newsprint 主题

## 使用指南

### 在组件中使用颜色

#### 1. 使用 Tailwind 类名（推荐）

```tsx
// Shadcn UI 默认颜色
<div className="bg-background text-foreground">内容</div>
<Card className="border-border">卡片</Card>
<Button variant="secondary">按钮</Button>

// BlockOS 强调色
<div className="bg-accent-green text-white">主绿色</div>
<div className="text-accent-green-dark">深绿色文字</div>
<div className="border-accent-red">红色边框</div>
```

#### 2. 使用 HSL 格式（自定义场景）

```tsx
<div className="bg-[hsl(var(--accent-green))]">背景</div>
<div className="text-[hsl(var(--foreground))]">文字</div>
```

#### 3. 使用 RGB 格式（需要透明度）

```tsx
<div className="bg-[rgb(var(--accent-green-rgb)_/_0.1)]">半透明背景</div>
<div className="shadow-[0_0_10px_rgb(var(--accent-red-rgb)_/_0.3)]">阴影</div>
```

### 在 CSS 中使用

```css
/* 使用 Shadcn UI 颜色 */
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

/* 使用 BlockOS 强调色 */
.my-highlight {
  background-color: hsl(var(--accent-green));
  color: white;
}

/* 使用通用设计变量 */
.my-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-lg);
}

/* 使用编辑器变量 */
.my-editor {
  font-family: var(--editor-font-family);
  font-size: var(--editor-font-size);
  line-height: var(--editor-line-height);
  max-width: var(--editor-max-width);
}
```

## 颜色系统对照表

### Shadcn UI 默认颜色

| 变量名 | 用途 | 亮色模式 | 暗色模式 |
|--------|------|----------|----------|
| `--background` | 页面背景 | 白色 | 深灰 |
| `--foreground` | 主要文字 | 深灰 | 白色 |
| `--card` | 卡片背景 | 白色 | 深灰 |
| `--primary` | 主要按钮 | 深灰 | 白色 |
| `--secondary` | 次要按钮 | 浅灰 | 中灰 |
| `--muted` | 静音元素 | 浅灰 | 中灰 |
| `--accent` | 强调元素 | 浅灰 | 中灰 |
| `--destructive` | 危险操作 | 红色 | 深红 |
| `--border` | 边框 | 浅灰 | 中灰 |

### BlockOS 自定义强调色

| 颜色名称 | HEX | HSL | RGB | Tailwind 类 | 用途 |
|---------|-----|-----|-----|------------|------|
| 主绿色 | #35AB67 | 145 52% 44% | 53 171 103 | `accent-green` | 成功、确认、积极 |
| 深绿色 | #00362F | 170 100% 11% | 0 54 47 | `accent-green-dark` | 深色强调、次要绿色 |
| 强调红色 | #D9323D | 356 63% 52% | 217 50 61 | `accent-red` | 错误、警告、删除 |

## 主题切换

### 暗色模式

```tsx
// 在根元素添加 dark 类
<html className="dark">
  <body>
    {/* 所有组件自动切换到暗色模式 */}
  </body>
</html>
```

### Newsprint 主题

```tsx
// 在根元素添加 theme-newsprint 类
<html className="theme-newsprint">
  <body>
    {/* 编辑器切换到报纸印刷风格 */}
  </body>
</html>
```

## 最佳实践

### 1. 优先使用 Tailwind 类名

```tsx
// ✅ 推荐
<div className="bg-accent-green text-white">内容</div>

// ❌ 不推荐（除非有特殊需求）
<div className="bg-[hsl(var(--accent-green))]">内容</div>
```

### 2. 需要透明度时使用 RGB

```tsx
// ✅ 推荐
<div className="bg-[rgb(var(--accent-green-rgb)_/_0.1)]">半透明</div>

// ❌ 不推荐（HSL 透明度语法更复杂）
<div className="bg-[hsl(var(--accent-green)_/_0.1)]">半透明</div>
```

### 3. 保持语义化

```tsx
// ✅ 推荐（语义清晰）
<Button className="bg-accent-green">保存</Button>
<Button className="bg-accent-red">删除</Button>

// ❌ 不推荐（语义不清）
<Button className="bg-accent-green">删除</Button>
<Button className="bg-accent-red">保存</Button>
```

### 4. 使用通用设计变量

```tsx
// ✅ 推荐（使用设计变量）
<Card className="rounded-[var(--border-radius-lg)] shadow-[var(--shadow-card)]">
  内容
</Card>

// ❌ 不推荐（硬编码值）
<Card className="rounded-lg shadow-md">
  内容
</Card>
```

### 5. 编辑器组件使用 design-tokens

```tsx
// ✅ 推荐（使用编辑器变量）
<div className="font-[var(--editor-font-family)] text-[var(--editor-font-size)]">
  编辑器内容
</div>

// ❌ 不推荐（硬编码字体）
<div className="font-sans text-base">
  编辑器内容
</div>
```

## 相关文件

- `src/styles/shadcn-theme.css` - 主要颜色系统
- `src/styles/global/design-tokens.css` - 编辑器和主题特定样式
- `tailwind.config.js` - Tailwind 配置
- `docs/guide/shadcn-theme-colors.md` - 颜色使用指南
- `.kiro/steering/shadcn-ui-refactor.md` - Shadcn UI 重构规范

## 常见问题

### Q: 为什么要分成两个文件？

A: 职责分离：
- `shadcn-theme.css` 是通用的颜色系统，适用于所有组件
- `design-tokens.css` 是编辑器和主题特定的样式，只在特定场景使用

### Q: 如何添加新的颜色？

A: 在 `shadcn-theme.css` 中添加：
```css
:root {
  /* 新颜色 */
  --my-color: 200 50% 50%;
  --my-color-rgb: 64 159 191;
  --my-color-hex: #409FBF;
}
```

然后在 `tailwind.config.js` 中添加：
```js
colors: {
  'my-color': '#409FBF',
}
```

### Q: 如何覆盖 Shadcn UI 的默认颜色？

A: 直接在 `shadcn-theme.css` 中修改对应的 CSS 变量：
```css
:root {
  --primary: 145 52% 44%; /* 改为绿色 */
}
```

### Q: Newsprint 主题如何工作？

A: `design-tokens.css` 中的 `.theme-newsprint` 类会覆盖 `shadcn-theme.css` 中的变量，实现主题切换。

### Q: 为什么有三种颜色格式（HSL、RGB、HEX）？

A: 不同场景需要不同格式：
- **HSL**：Shadcn UI 标准格式，支持透明度
- **RGB**：用于需要透明度的场景（更简洁的语法）
- **HEX**：Tailwind 配置使用，直接在类名中使用
