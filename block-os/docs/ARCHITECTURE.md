# BlockOS 架构文档

**最后更新**: 2026-04-11 · v0.6.1

## 概述

BlockOS 是一个写作优先、AI 原生的个人知识操作系统。基于 React + TipTap + IndexedDB 构建。

## 分层架构

严格单向依赖，从上到下：

```
types/      ← 零依赖（Block, Document, Project, Message）
utils/      ← 只依赖 types/（uuid, markdown, date）
storage/    ← 依赖 types/ + utils/（IndexedDB Store 单例）
services/   ← 依赖 types/ + utils/ + storage/（AI、导出、Block 捕获）
editor/     ← 依赖 types/ + storage/（TipTap 扩展）
hooks/      ← 依赖 types/ + storage/ + services/（React Hooks）
components/ ← 依赖以上所有层（UI 组件）
App.tsx     ← 组装层
```

## 核心架构决策

### 内容/样式/模板三层解耦
Block 数据模型拆分为 Content（来源追溯）、Style（视觉配置）、Template（结构角色+导出规则）三层。编辑器通过 SourceBlock 自定义节点实现。

→ [详细文档](./spec/architecture/content-style-template.md)

### 存储架构
- 统一 IndexedDB 数据库 `blockos-db`（版本 4）
- Object Stores: `blocks`, `documents`, `projects`, `sessions`
- 所有 Store 共享同一个 `IDBDatabase` 单例，通过 `database.ts` 初始化
- Supabase 可选云同步

### 编辑器扩展
- `BlockLink` — 双向链接 `[[]]`
- `BlockReference` — 块引用 `(())`
- `SourceBlock` — 来源标记块（AI/灵感/用户），内容可编辑，来源元数据不可编辑
- `suggestion` — 自动补全插件

### AI 集成
- MiMo API（小米 AI），流式 SSE 响应
- AI 回复自动创建隐式 Block（不显示在 Block 空间）
- 手动捕获为显式 Block（显示在 Block 空间）

## 目录结构

```
src/
├── types/          # 类型定义
├── utils/          # 纯工具函数
├── storage/        # IndexedDB Store
├── services/       # 业务逻辑（aiService, exportService, blockCaptureService）
├── editor/         # TipTap 扩展（blockLink, blockReference, sourceBlock, suggestion）
├── hooks/          # React Hooks
├── components/
│   ├── layout/     # Sidebar, TabBar, ResizeHandle, ActivityBar
│   ├── editor/     # Editor, SuggestionMenu
│   ├── panel/      # RightPanel, BlockSpacePanel, PreviewPanel, ...
│   ├── auth/       # AuthPage
│   └── shared/     # Toast
└── App.tsx

docs/
├── spec/
│   ├── architecture/   # 架构决策记录（ADR）
│   ├── features/       # 功能需求（editor/ai/block-system/storage）
│   ├── PRD/            # 产品需求文档
│   └── prototype/      # 原型文件
├── guide/              # 使用指南
├── logs/               # 工作日志（YYYY-MM/YYYY-MM-DD.md）
├── CHANGELOG.md        # 版本更新记录
├── todo.md             # 待办事项
└── ARCHITECTURE.md     # 本文档
```

## 版本历史

| 版本 | 日期 | 里程碑 |
|------|------|--------|
| v0.1 | 2026-04-09 | Phase 1 基础编辑器 |
| v0.2 | 2026-04-09 | Phase 2+3 AI 对话 + Block 系统 |
| v0.3 | 2026-04-09 | 多项目工作区 |
| v0.4 | 2026-04-10 | 模块化分层架构重构 |
| v0.5 | 2026-04-11 | Supabase 认证集成 |
| v0.6 | 2026-04-11 | 内容/样式/模板三层解耦 + SourceBlock |
