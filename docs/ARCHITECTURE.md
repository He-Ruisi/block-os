# BlockOS 架构文档

**最后更新**: 2026-04-14 · 对齐 v1.8.1 实现

## 概述

BlockOS 是一个写作优先、AI 原生的个人知识工作台。当前核心形态是：

- AI 沉浸式模式：全屏对话，适合提出问题和生成内容
- 混合模式：编辑器 + 侧边栏 + AI 面板并存，适合整理、改写、引用和导出
- 本地优先存储：IndexedDB 为主，Supabase 为可选云同步层

## 分层架构

严格单向依赖，从下到上组装：

```text
types/      ← 零依赖（Block, Document, Project, Session, Message, Layout）
utils/      ← 只依赖 types/（uuid, markdown, date）
storage/    ← 依赖 types/ + utils/（IndexedDB Store / database）
services/   ← 依赖 types/ + utils/ + storage/（AI、导出、同步、捕获）
editor/     ← 依赖 types/ + storage/（TipTap 扩展和编辑器事件桥接）
hooks/      ← 依赖 types/ + storage/ + services/（布局、认证、同步、Session）
components/ ← 依赖以上各层（Sidebar、Editor、RightPanel、Block 面板等）
App.tsx     ← 组装层（模式切换、主路径编排）
```

## 当前核心模块

### 1. 数据与存储

- IndexedDB 数据库：`blockos-db`
- Object Stores：`blocks`、`documents`、`projects`、`sessions`、`usages`
- 所有 Store 共用同一个 `IDBDatabase` 单例
- 本地为真实数据源，UI 状态额外保存在 `localStorage`

当前持久化分工：

- `IndexedDB`
  - 文档内容
  - Block 数据
  - 项目数据
  - Session 历史
  - Block usages
- `localStorage`
  - 主题
  - 视图模式（`ai-focus` / `hybrid`）
  - 工作区标签页恢复
  - 当前 Session 恢复
  - 星标列表
  - 布局偏好
  - 自动同步待处理队列

### 2. 编辑器架构

编辑器基于 TipTap，核心扩展包括：

- `BlockLink`：双向链接 `[[...]]`
- `BlockReference`：块引用 `((...))`
- `SourceBlock`：来源块（AI / 灵感 / 用户）
- `inlineAI`：选区上的 AI 操作工具栏
- `suggestion`：Block 搜索与自动补全

编辑器承担三类职责：

- 文档内容编辑与自动保存
- Block 引用、SourceBlock、AI 内联操作
- 与其他面板的事件桥接

当前已接入的关键编辑器事件：

- `sendToAI`
- `openAIChat`
- `navigateToBlock`
- `navigateToHeading`
- `insertBlockRelease`

### 3. AI 面板架构

AI 能力集中在 `RightPanel`，支持两种运行形态：

- `ai-focus`
  - 全屏沉浸式对话
  - 初次生成后可一键写入编辑器
- `hybrid`
  - 右侧 AI 面板与编辑器协作
  - 可捕获为 Block、写入编辑器、查看历史 Session

AI 提供商层当前支持：

- MiMo
- DeepSeek

统一能力包括：

- 流式回复
- 回复与 `editorContent` 分离
- Markdown 渲染
- 会话持久化

### 4. Block 系统

Block 仍然是系统最小知识单元，当前分为：

- 隐式 Block：来自文档段落或 AI 回复，不直接展示在 Block 空间
- 显式 Block：用户捕获后展示在 Block 空间

Block 当前已支持：

- 来源信息 `source`
- 编辑历史 `editHistory`
- 样式层 `style`
- 模板层 `template`
- 发布版本 `releases`
- 附属层 `annotations`
- 引用关系 `links`
- 派生关系 `derivation`

Block UI 主体由以下组件组成：

- `BlockSpacePanel`
- `BlockDetailPanel`
- `BlockDerivativeSelector`

### 5. 工作区与导航

工作区当前由三部分组成：

- 左侧 `ActivityBar + Sidebar`
- 中部编辑器区域
- 右侧 `RightPanel`

关键导航能力：

- Today / Project / Document 多标签页
- 项目概览页 `ProjectOverview`
- 置顶视图 `StarredView`
- 搜索视图 `SearchView`
- 文档大纲 `OutlineView`

当前导航恢复能力：

- 重启后恢复标签页集合
- 恢复活动标签
- 恢复当前 Session
- 恢复视图模式与主题

## 同步架构

### 本地优先 + 可选云同步

- 未配置 Supabase：应用运行在本地模式
- 已配置 Supabase：启动自动同步与首次登录拉取

### 自动同步队列

自动同步服务 `autoSyncService` 维护两类待处理队列：

- 变更队列
  - `projects`
  - `documents`
  - `blocks`
- 删除队列
  - `deletedProjects`
  - `deletedDocuments`
  - `deletedBlocks`

同步规则：

1. 所有本地新增/更新先写 IndexedDB
2. Store 层只负责标记变更或删除，不直接驱动 UI
3. 自动同步定时器在在线时批量处理队列
4. 删除先于更新同步，避免“先更新后删除”的竞争
5. 待同步队列持久化到 `localStorage`，支持离线删除后恢复在线再同步

### 首次拉取与回写抑制

云端首次拉取时会写入本地 IndexedDB，但使用 `skipSyncMark` 抑制回写标记，避免出现：

- 刚从云端拉取
- 又被本地误判为“待同步”

## UI 状态架构

当前 UI 状态分成三类：

- 数据状态
  - Projects / Documents / Blocks / Sessions
  - 来源：IndexedDB
- 工作区状态
  - Tabs / Active Tab / Current Project / View Mode / Theme
  - 来源：React state + localStorage
- 同步状态
  - `isSyncing` / `isOnline` / `lastSyncTime` / pending queues
  - 来源：`autoSyncService`

同步状态展示统一出现在：

- `StatusBar`
- `SyncStatusIndicator`
- `SettingsPanel`

## 目录结构

```text
src/
├── types/
├── utils/
├── storage/
├── services/
├── editor/
│   └── extensions/
├── hooks/
├── components/
│   ├── ai/
│   ├── auth/
│   ├── editor/
│   ├── layout/
│   ├── panel/
│   ├── project/
│   └── shared/
├── styles/
└── App.tsx

docs/
├── spec/
├── guide/
├── logs/
├── CHANGELOG.md
├── todo.md
└── ARCHITECTURE.md
```

## 当前已知架构风险

- 构建产物主包偏大，仍需后续分包
- 自动同步相关模块存在 mixed import 警告，但不影响当前运行
- 删除同步已具备离线闭环，但仍未做更细粒度的失败重试分类
- 文件系统读写仍未接入，当前仍是 IndexedDB / Supabase 架构

## 版本里程碑

| 版本 | 日期 | 里程碑 |
|------|------|--------|
| v0.1 | 2026-04-09 | Phase 1 基础编辑器 |
| v0.2 | 2026-04-09 | AI 对话 + Block 系统核心 |
| v0.3 | 2026-04-09 | 多项目工作区 |
| v0.4 | 2026-04-10 | 模块化分层架构 |
| v0.5 | 2026-04-11 | Supabase 认证集成 |
| v0.6 | 2026-04-11 | 内容 / 样式 / 模板三层解耦 |
| v0.7 | 2026-04-11 | Block 版本化引用 |
| v1.0 | 2026-04-13 | 云同步、离线模式、本地模式 |
| v1.6 | 2026-04-13 | AI 沉浸式模式 |
| v1.7 | 2026-04-13 | 置顶与侧边栏增强 |
| v1.8 | 2026-04-13 | AI 回复 Markdown 渲染增强 |
