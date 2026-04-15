。 # 审核与建议：打造 Notion/Roam 级别的主题系统

## 一、整体评估

你的基础架构是好的（CSS 变量分层、主题切换机制），但和 Notion/Roam 的设计语言相比，缺少几个**关键的系统级设计维度**。

---

## 二、核心差距分析

### Notion/Roam 的设计 DNA

```
Notion = 极致留白 + 无边框感 + 微交互 + 内容即界面
Roam  = 信息密度 + 大纲结构 + 引用网络 + 功能优先
```

你现在的 `:root` 主题更像一个**通用的后台管理系统**，而不是一个**知识工具**。区别在于：

| 维度 | 你目前的状态 | Notion/Roam 的做法 |
|------|------------|-------------------|
| 间距系统 | ❌ 完全缺失 | 4px 基准的数学网格 |
| 动效系统 | ❌ 完全缺失 | 全局一致的过渡曲线 |
| 颜色层级 | ⚠️ 只有3层背景 | 5-6层的灰度梯度 |
| 排版阶梯 | ⚠️ 只定义了基础 | 完整的 Type Scale |
| 交互状态 | ⚠️ 只有 hover/active | hover/focus/active/disabled/dragging |
| 层级管理 | ❌ 无 z-index | 系统化的层级令牌 |
| 块级设计 | ❌ 无 | 每个 block 是独立的交互单元 |

---

## 三、建议重构方案

### 1. 完整的间距系统（最关键的缺失）

Notion 的一切布局都基于 **4px 网格**：

```css
:root {
  /* ============================================================
     Spacing Scale — 4px baseline grid
     ============================================================ */
  --space-0: 0px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Semantic spacing */
  --page-padding-x: var(--space-24);    /* Notion 的页面两侧留白很大 */
  --page-padding-y: var(--space-12);
  --block-spacing: var(--space-1);      /* block 之间的间距极小 */
  --section-spacing: var(--space-8);    /* 段落/标题之间 */
  --sidebar-padding: var(--space-3);
  --sidebar-item-padding: var(--space-1) var(--space-2);
  --sidebar-item-radius: var(--border-radius);
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 48px;
}
```

### 2. 重构颜色系统 — Notion 式的灰度梯度

Notion 的核心是**极其细腻的灰度层次**：

```css
:root {
  /* ============================================================
     Color System — Notion-inspired neutral scale
     ============================================================ */

  /* 背景层级（从深到浅，更多层次） */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fbfbfa;      /* Notion 侧边栏 */
  --color-bg-tertiary: #f7f6f3;       /* Notion 的 hover 底色 */
  --color-bg-elevated: #ffffff;        /* 弹窗、卡片 */
  --color-bg-wash: #f1f1ef;           /* 大面积的背景色 */
  --color-bg-hover: rgba(55, 53, 47, 0.04);   /* 关键！半透明 hover */
  --color-bg-active: rgba(55, 53, 47, 0.08);
  --color-bg-selected: rgba(35, 131, 226, 0.08); /* 选中态偏蓝 */

  /* 文字色（Notion 的文字不是纯黑，是暖灰） */
  --color-text-primary: rgb(55, 53, 47);     /* Notion 的正文色 */
  --color-text-secondary: rgba(55, 53, 47, 0.65);
  --color-text-tertiary: rgba(55, 53, 47, 0.45);
  --color-text-placeholder: rgba(55, 53, 47, 0.25);
  --color-text-disabled: rgba(55, 53, 47, 0.2);

  /* 边框（Notion 的边框极其轻） */
  --color-border-default: rgba(55, 53, 47, 0.09);  /* 几乎看不到 */
  --color-border-hover: rgba(55, 53, 47, 0.16);
  --color-border-focus: rgb(35, 131, 226);           /* 蓝色聚焦环 */
  --color-border-divider: rgba(55, 53, 47, 0.09);

  /* 品牌色 / 强调色（Notion 蓝） */
  --color-accent: rgb(35, 131, 226);
  --color-accent-hover: rgb(0, 119, 212);
  --color-accent-light: rgba(35, 131, 226, 0.08);
  --color-accent-text: rgb(35, 131, 226);

  /* 功能色 */
  --color-success: rgb(15, 123, 108);
  --color-warning: rgb(203, 145, 47);
  --color-error: rgb(212, 76, 71);
  --color-info: rgb(35, 131, 226);

  /* Notion 特色的多彩标签系统 */
  --color-tag-red: rgba(255, 226, 221, 1);
  --color-tag-red-text: rgb(93, 23, 21);
  --color-tag-orange: rgba(253, 236, 200, 1);
  --color-tag-orange-text: rgb(68, 42, 30);
  --color-tag-yellow: rgba(253, 236, 200, 1);
  --color-tag-yellow-text: rgb(64, 44, 27);
  --color-tag-green: rgba(219, 237, 219, 1);
  --color-tag-green-text: rgb(28, 56, 41);
  --color-tag-blue: rgba(211, 229, 239, 1);
  --color-tag-blue-text: rgb(24, 51, 71);
  --color-tag-purple: rgba(232, 222, 238, 1);
  --color-tag-purple-text: rgb(65, 36, 84);
  --color-tag-pink: rgba(245, 224, 233, 1);
  --color-tag-pink-text: rgb(76, 35, 55);
  --color-tag-gray: rgba(227, 226, 224, 1);
  --color-tag-gray-text: rgb(50, 48, 44);
}
```

### 3. 动效系统（你完全缺失的）

Notion 的"高级感"有一半来自**恰到好处的动效**：

```css
:root {
  /* ============================================================
     Motion System
     ============================================================ */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-entrance: 250ms;

  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);     /* 通用 */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);             /* 弹出 */
  --ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);     /* 收回 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);      /* 弹簧 */

  --transition-colors: color var(--duration-fast) var(--ease-default),
                        background-color var(--duration-fast) var(--ease-default),
                        border-color var(--duration-fast) var(--ease-default);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  --transition-opacity: opacity var(--duration-normal) var(--ease-default);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
  --transition-all: all var(--duration-normal) var(--ease-default);
}
```

### 4. 排版阶梯（Typography Scale）

Notion 用的是**模块化缩放**，不是随意的字号：

```css
:root {
  /* ============================================================
     Typography Scale — 1.25 ratio (Major Third)
     ============================================================ */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
               Helvetica, "Apple Color Emoji", Arial, sans-serif,
               "Segoe UI Emoji", "Segoe UI Symbol";
  --font-serif: Lyon-Text, Georgia, ui-serif,
                "Apple Color Emoji", serif;
  --font-mono: iawriter-mono, Nitti, Menlo, Courier, monospace;

  /* Size scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px — UI元素、侧边栏 */
  --text-base: 1rem;      /* 16px — 正文 */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px — H3 */
  --text-2xl: 1.5rem;     /* 24px — H2 */
  --text-3xl: 1.875rem;   /* 30px — H1 */
  --text-4xl: 2.5rem;     /* 40px — 页面标题 */

  /* Weight */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Height */
  --leading-tight: 1.2;    /* 标题 */
  --leading-snug: 1.35;    /* 副标题 */
  --leading-normal: 1.5;   /* UI文本 */
  --leading-relaxed: 1.625; /* 正文 */
  --leading-loose: 1.75;    /* 宽松正文 */

  /* Letter Spacing */
  --tracking-tight: -0.02em;  /* 大标题 */
  --tracking-normal: 0em;
  --tracking-wide: 0.02em;    /* 小号大写 */
}
```

### 5. Z-Index 层级系统

```css
:root {
  /* ============================================================
     Z-Index Scale
     ============================================================ */
  --z-below: -1;
  --z-base: 0;
  --z-sticky: 10;        /* 吸顶元素 */
  --z-sidebar: 20;       /* 侧边栏 */
  --z-overlay: 30;       /* 遮罩层 */
  --z-dropdown: 40;      /* 下拉菜单 */
  --z-modal: 50;         /* 模态框 */
  --z-popover: 60;       /* 弹出框、tooltip */
  --z-toast: 70;         /* 通知 */
  --z-command: 80;       /* 命令面板（最高） */
}
```

### 6. 块级设计令牌（Notion 独有的）

这是区分"普通编辑器"和"Block 编辑器"的关键：

```css
:root {
  /* ============================================================
     Block System — the atomic unit of content
     ============================================================ */

  /* Block 基础 */
  --block-padding-x: var(--space-2);
  --block-padding-y: var(--space-1);
  --block-border-radius: var(--border-radius);
  --block-min-height: 28px;            /* 单行 block 最小高度 */

  /* Block 交互 */
  --block-hover-bg: var(--color-bg-hover);
  --block-selected-bg: var(--color-bg-selected);
  --block-drag-bg: rgba(35, 131, 226, 0.04);
  --block-drag-border: rgba(35, 131, 226, 0.3);

  /* Block handle (六点拖拽手柄) */
  --block-handle-size: 24px;
  --block-handle-color: var(--color-text-tertiary);
  --block-handle-hover-bg: var(--color-bg-hover);

  /* Indent (缩进) */
  --indent-width: 24px;
  --indent-guide-color: var(--color-border-default);

  /* Callout */
  --callout-padding: var(--space-4);
  --callout-radius: var(--border-radius);
  --callout-icon-size: 24px;

  /* Toggle */
  --toggle-icon-size: 20px;
  --toggle-icon-color: var(--color-text-tertiary);

  /* Database */
  --table-header-bg: var(--color-bg-secondary);
  --table-cell-padding: var(--space-2) var(--space-3);
  --table-border: var(--color-border-default);
}
```

### 7. 交互状态系统

```css
:root {
  /* ============================================================
     Interactive States
     ============================================================ */

  /* 按钮状态 */
  --btn-primary-bg: var(--color-accent);
  --btn-primary-hover: var(--color-accent-hover);
  --btn-primary-active: rgb(0, 100, 190);
  --btn-primary-text: #ffffff;

  --btn-ghost-bg: transparent;
  --btn-ghost-hover: var(--color-bg-hover);
  --btn-ghost-active: var(--color-bg-active);
  --btn-ghost-text: var(--color-text-secondary);

  /* 聚焦环 (Notion 不用 outline，用 shadow) */
  --focus-ring: 0 0 0 2px var(--color-bg-primary),
                0 0 0 4px var(--color-accent);
  --focus-ring-inset: inset 0 0 0 2px var(--color-accent);

  /* 可拖拽 */
  --dragging-opacity: 0.5;
  --dragging-scale: 1.02;
  --drop-indicator-color: var(--color-accent);
  --drop-indicator-width: 2px;
}
```

---

## 四、暗色主题（你完全没有）

Notion 和 Roam 都有暗色模式，这对知识工具是**必选项**：

```css
/* ============================================================
   Dark Theme
   ============================================================ */
.theme-dark {
  color-scheme: dark;

  --color-bg-primary: #191919;
  --color-bg-secondary: #202020;
  --color-bg-tertiary: #2f2f2f;
  --color-bg-elevated: #252525;
  --color-bg-wash: #2d2d2d;
  --color-bg-hover: rgba(255, 255, 255, 0.04);
  --color-bg-active: rgba(255, 255, 255, 0.08);
  --color-bg-selected: rgba(35, 131, 226, 0.15);

  --color-text-primary: rgba(255, 255, 255, 0.9);
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  --color-text-tertiary: rgba(255, 255, 255, 0.4);
  --color-text-placeholder: rgba(255, 255, 255, 0.2);
  --color-text-disabled: rgba(255, 255, 255, 0.15);

  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.16);
  --color-border-divider: rgba(255, 255, 255, 0.08);

  /* 代码块 */
  --code-bg: #2f2f2f;
  --code-border: rgba(255, 255, 255, 0.08);
  --code-color: rgba(255, 255, 255, 0.85);
  --code-inline-bg: rgba(255, 255, 255, 0.1);

  /* 阴影在暗色下更深 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

  /* 标签色在暗色下需要调整 */
  --color-tag-red: rgba(110, 54, 48, 0.6);
  --color-tag-red-text: rgb(255, 175, 163);
  --color-tag-blue: rgba(42, 78, 107, 0.6);
  --color-tag-blue-text: rgb(146, 195, 230);
  --color-tag-green: rgba(36, 72, 50, 0.6);
  --color-tag-green-text: rgb(127, 199, 147);
  --color-tag-gray: rgba(60, 60, 60, 0.6);
  --color-tag-gray-text: rgb(185, 182, 176);
}
```

---

## 五、全局基础样式重构

你的 `body` 和 `*` 重置太简单了：

```css
/* ============================================================
   Base Reset & Globals
   ============================================================ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  tab-size: 4;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-wrap: break-word;
}

#root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;           /* 添加 flex！Notion 的整体布局基于 flex */
}

/* 选中文本样式 — Notion 的蓝色选区 */
::selection {
  background: var(--color-accent-light);
  color: inherit;
}

/* 滚动条 — Notion 极简风 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(55, 53, 47, 0.16);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(55, 53, 47, 0.3);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.theme-dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* 聚焦状态 */
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* 平滑过渡 — 全局应用 */
button, a, input, textarea, select {
  transition: var(--transition-colors);
}

/* Notion 式的占位符样式 */
[data-placeholder]::before {
  content: attr(data-placeholder);
  color: var(--color-text-placeholder);
  pointer-events: none;
  font-style: normal;
}
```

---

## 六、Newsprint 主题的建议

你的 Newsprint 主题做得**很有特色**，但和 Notion/Roam 的设计语言完全不同。建议：

1. **保留它作为个性化主题**，但把它从 `:root` 的覆盖方式改为**新的间距/动效变量也一起覆盖**
2. 给 newsprint 也加上 `--space-*` `--duration-*` 系列变量的覆盖值

```css
.theme-newsprint {
  /* ... 你已有的覆盖 ... */

  /* 间距覆盖 — 报纸排版更紧凑 */
  --page-padding-x: var(--space-16);
  --block-spacing: var(--space-0-5);

  /* 动效覆盖 — 报纸主题可以没有弹簧效果 */
  --ease-spring: var(--ease-default);
  --duration-normal: 150ms;
}
```

---

## 七、最终文件结构建议

```
styles/
├── tokens/
│   ├── spacing.css        ← 间距系统
│   ├── colors.css         ← 颜色系统
│   ├── typography.css     ← 排版系统
│   ├── motion.css         ← 动效系统
│   ├── z-index.css        ← 层级系统
│   ├── blocks.css         ← 块级令牌
│   └── interactive.css    ← 交互状态
├── themes/
│   ├── light.css          ← 默认亮色（Notion 风）
│   ├── dark.css           ← 暗色主题
│   └── newsprint.css      ← 报纸主题
├── base/
│   ├── reset.css          ← 全局重置
│   ├── scrollbar.css      ← 滚动条
│   └── selection.css      ← 选区样式
└── index.css              ← 入口，@import 所有文件
```

---

## 总结优先级

| 优先级 | 改进项 | 影响度 |
|--------|--------|--------|
| **P0** | 补齐间距系统 `--space-*` | 布局一致性的根基 |
| **P0** | 补齐动效系统 `--duration-*` + `--ease-*` | "高级感"的来源 |
| **P0** | 暗色主题 `.theme-dark` | 知识工具必备 |
| **P1** | 颜色改为 Notion 式的 `rgba(55,53,47,x)` 体系 | 视觉质感飞跃 |
| **P1** | 排版阶梯 + 字重系统 | 信息层次清晰度 |
| **P1** | 滚动条 + 选区 + 聚焦环 | 细节品质感 |
| **P2** | z-index 系统 | 防止层级混乱 |
| **P2** | Block 级设计令牌 | Block 编辑器特有需求 |
| **P2** | 文件拆分结构 | 可维护性 |