# BlockOS 项目结构

工作区根目录为 `block-os/`。

## 依赖层级（严格单向，从上到下）
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

### View 组件禁止 import：
storage/*
services/*
features/*/hooks
tiptap editor instance
任何业务 store
### View 组件允许 import：
components/ui/*
components/shells/*
lib/utils
lucide-react
types/*

## 目录说明
```
src/
├── types/          # 类型定义（block, document, project, chat）
├── utils/          # 纯工具函数（uuid, markdown, date）
├── lib/            # 工具库（cn() 函数等）
├── storage/        # IndexedDB Store（blockStore, documentStore, projectStore, sessionStore）
├── services/       # 业务逻辑（aiService, exportService, blockCaptureService, sessionService）
├── editor/         # TipTap 扩展（blockLink, blockReference, sourceBlock, suggestion）
├── hooks/          # React Hooks（useAppLayout, useTabs, useSession, useBlockSearch, useAuth）
├── components/
│   ├── ui/         # Shadcn UI 基础组件（button, input, dialog, dropdown-menu 等）
│   ├── shells/     # 项目级展示壳组件（PanelShell, SearchInput, BlockCardShell 等）
│   ├── layout/     # 应用框架组件（Sidebar, TabBar, ResizeHandle, ActivityBar）
│   ├── editor/     # 编辑器组件（Editor, EditorBubbleMenu, EditorToolbar 等）
│   ├── panel/      # 右侧面板（RightPanel, BlockSpacePanel, PreviewPanel 等）
│   ├── auth/       # 认证页面
│   └── shared/     # 通用组件（Toast）
└── App.tsx         # 主应用入口
```

## 组件分层规则

### components/ui/ - Shadcn UI 基础组件
- **只放**：Shadcn UI 基础组件（Button、Card、Input、Dialog、Tabs 等）
- **禁止**：放业务逻辑、放 feature 专属 UI
- **来源**：通过 `bunx shadcn@latest add <component>` 安装

### components/shells/ - 项目级展示壳组件
- **用途**：基于 Shadcn UI 组合而成的通用 UI 模式
- **特点**：无业务逻辑、可复用、减少重复 className
- **示例**：
  - PanelShell - 面板容器
  - PanelHeader - 面板头部
  - SearchInput - 搜索输入框
  - BlockCardShell - Block 卡片
  - EmptyState - 空状态

### components/layout/ - 应用框架组件
- **用途**：应用级的布局组件
- **特点**：可以包含状态管理和应用逻辑
- **示例**：Sidebar、TabBar、StatusBar、ActivityBar

### features/*/components/ - 功能模块组件
- **用途**：包含业务逻辑的功能组件
- **特点**：与具体功能模块绑定
- **示例**：BlockSpacePanel、EditorToolbar、SessionHistoryPanel

## 命名规范
- 组件: PascalCase (`Editor.tsx`)
- 工具/服务: camelCase (`aiService.ts`)
- 类型文件: camelCase (`block.ts`)
- ~~CSS: 与组件同名 (`Editor.css`)~~ **已废弃，使用 Tailwind CSS**
- Hooks: `use` 前缀 (`useAppLayout.ts`)
- Shadcn UI 组件: kebab-case (`button.tsx`, `dropdown-menu.tsx`)

## 文档结构
```
docs/
├── spec/
│   ├── architecture/   # 架构决策记录（ADR）
│   ├── features/       # 功能需求（editor/ai/block-system/storage）
│   ├── PRD/            # 产品需求文档
│   └── prototype/      # 原型文件
├── guide/          # 使用指南（用户/开发者）
├── logs/           # 工作日志（按月/日组织）
├── tests/          # 测试指南
└── attachs/        # 附件
```

## 关键架构文档
- `CLAUDE.md` — 快速上手指南 + 关键约束（项目根目录）
- `docs/ARCHITECTURE.md` — 架构概览 + ADR 索引
- `docs/spec/architecture/` — 架构决策记录（每个重大决策一份）
- `docs/todo.md` — 待办事项
- `docs/CHANGELOG.md` — 版本更新记录（精简摘要）

## 自动化 Hooks（`.kiro/hooks/`）
- `daily-changelog-logger` — 每轮对话结束后追加日志 + 更新 todo/spec + 里程碑更新 CHANGELOG
- `auto-git-commit` — 每轮对话结束后自动 git commit
