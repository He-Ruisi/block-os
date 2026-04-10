# BlockOS 项目指南

## 项目概述
BlockOS 是一个写作优先、AI 原生、插件化扩展的个人知识操作系统。基于 Web 技术栈构建，使用 IndexedDB 作为本地存储。

## 技术栈
- **框架**: React 18 + TypeScript 5
- **构建工具**: Vite 6
- **编辑器**: TipTap 2 (基于 ProseMirror)
- **包管理**: Bun
- **存储**: IndexedDB (浏览器本地)
- **AI**: MiMo API (小米 AI 模型)

## 项目架构（目标）

```
src/
├── main.tsx                    # 入口文件
├── App.tsx                     # 布局壳 + Context Provider
├── App.css
│
├── types/                      # 统一类型定义层（零依赖）
│   ├── index.ts
│   ├── block.ts                # Block, BlockDerivative
│   ├── document.ts             # Document, DocumentBlock
│   ├── project.ts              # Project, Tab
│   └── chat.ts                 # Message, PanelTab
│
├── utils/                      # 纯工具函数（只依赖 types/）
│   ├── uuid.ts                 # generateUUID
│   ├── markdown.ts             # markdown ↔ HTML 转换
│   └── date.ts                 # 日期格式化
│
├── storage/                    # 存储层（依赖 types/ + utils/）
│   ├── database.ts             # 统一 IndexedDB 初始化（单例）
│   ├── blockStore.ts           # Block CRUD
│   ├── documentStore.ts        # Document CRUD
│   ├── projectStore.ts         # Project CRUD
│   └── index.ts                # 统一导出 + 统一 init()
│
├── services/                   # 业务逻辑层（依赖 types/ + utils/ + storage/）
│   ├── aiService.ts            # AI API 调用
│   ├── blockCaptureService.ts  # Block 捕获逻辑
│   └── gitIntegration.ts       # Git 集成（模拟）
│
├── editor/                     # 编辑器扩展（依赖 types/ + storage/）
│   └── extensions/
│       ├── blockLink.ts
│       ├── blockReference.ts
│       ├── suggestion.ts
│       └── index.ts
│
├── hooks/                      # 自定义 React Hooks
│   ├── useAppLayout.ts         # 布局状态管理
│   ├── useTabs.ts              # 标签页管理
│   └── useBlockSearch.ts       # Block 搜索
│
├── components/                 # UI 组件（按功能域分组）
│   ├── layout/                 # 布局: Sidebar, TabBar, ResizeHandle, ActivityBar
│   ├── editor/                 # 编辑器: Editor, SuggestionMenu
│   ├── panel/                  # 右侧面板: RightPanel, BlockSpacePanel, DocumentBlocksPanel, BlockDerivativeSelector
│   └── shared/                 # 通用: Toast
│
├── styles/
│   └── index.css               # 全局样式
│
└── vite-env.d.ts
```

## 依赖方向（严格单向，从上到下）

```
types/      ← 零依赖
utils/      ← 只依赖 types/
storage/    ← 依赖 types/ + utils/
services/   ← 依赖 types/ + utils/ + storage/
editor/     ← 依赖 types/ + storage/
hooks/      ← 依赖 types/ + storage/ + services/
components/ ← 依赖以上所有层
App.tsx     ← 组装层
```

## 约束条件

1. **禁止循环依赖** — 依赖方向只能向下，禁止向上引用
2. **不引入新的大型框架** — 除非明确讨论并同意
3. **保持现有 API 接口不变** — 组件 props 接口保持兼容
4. **每次只重构一个模块** — 逐步迁移，每步类型检查
5. **类型安全全覆盖** — 所有函数参数和返回值必须有明确类型
6. **单一职责** — 每个文件只做一件事

## 关键设计决策

### 状态管理
- 使用 IndexedDB 单例 Store 模式（blockStore / documentStore / projectStore）
- 统一数据库初始化，避免竞态条件
- React 组件通过自定义 Hooks 消费 Store

### 存储
- 统一 IndexedDB 数据库名: `blockos-db`，版本: `3`
- Object Stores: `blocks`, `documents`, `projects`
- 所有 Store 共享同一个 `IDBDatabase` 实例

### 编辑器
- TipTap 2 + StarterKit
- 自定义扩展: BlockLink (双向链接 `[[]]`), BlockReference (块引用 `(())`)
- 自动补全插件（ProseMirror Plugin）

### AI 集成
- MiMo API (小米 AI)
- 流式响应 (SSE)
- AI 回复自动创建隐式 Block

## 开发命令

```bash
bun install          # 安装依赖
bun run dev          # 启动开发服务器
bun run build        # 构建生产版本
bun run type-check   # TypeScript 类型检查
```

## 命名规范

- **组件**: PascalCase (`Editor.tsx`)
- **工具/服务**: camelCase (`aiService.ts`)
- **类型文件**: camelCase (`block.ts`)
- **CSS**: 与组件同名 (`Editor.css`)
- **Hooks**: `use` 前缀 (`useAppLayout.ts`)
