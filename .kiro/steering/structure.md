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

## 目录说明
```
src/
├── types/          # 类型定义（block, document, project, chat）
├── utils/          # 纯工具函数（uuid, markdown, date）
├── storage/        # IndexedDB Store（blockStore, documentStore, projectStore, sessionStore）
├── services/       # 业务逻辑（aiService, blockCaptureService, sessionService）
├── editor/         # TipTap 扩展（blockLink, blockReference, suggestion）
├── hooks/          # React Hooks（useAppLayout, useTabs, useSession, useBlockSearch, useAuth）
├── components/
│   ├── layout/     # 布局组件（Sidebar, TabBar, ResizeHandle, ActivityBar）
│   ├── editor/     # 编辑器组件（Editor, SuggestionMenu）
│   ├── panel/      # 右侧面板（RightPanel, BlockSpacePanel, DocumentBlocksPanel, SessionHistoryPanel）
│   ├── auth/       # 认证页面
│   └── shared/     # 通用组件（Toast）
└── App.tsx         # 主应用入口
```

## 命名规范
- 组件: PascalCase (`Editor.tsx`)
- 工具/服务: camelCase (`aiService.ts`)
- 类型文件: camelCase (`block.ts`)
- CSS: 与组件同名 (`Editor.css`)
- Hooks: `use` 前缀 (`useAppLayout.ts`)

## 文档结构
```
docs/
├── spec/           # 需求规格和 PRD
├── guide/          # 使用指南（用户/开发者）
├── logs/           # 工作日志（按月/日组织）
├── tests/          # 测试指南
└── attachs/        # 附件
```
