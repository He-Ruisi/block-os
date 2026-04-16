# BlockOS 架构文档

**最后更新**: 2026-04-15 · 对齐 v1.10.2 实现

## 概述

BlockOS 是一个写作优先、AI 原生的个人知识工作台。当前核心形态是：

- **AI 沉浸式模式**：全屏对话界面，采用左右分栏布局（3:1），支持历史对话和设置侧边栏
- **混合模式**：编辑器 + 侧边栏 + AI 面板并存，适合整理、改写、引用和导出
- **本地优先存储**：IndexedDB 为主，Supabase 为可选云同步层
- **响应式设计**：支持桌面/平板/手机全设备，完整的测试文档体系

## 分层架构

严格单向依赖，从下到上组装：

```text
types/      ← 零依赖（Block, Document, Project, Session, Message, Layout）
utils/      ← 只依赖 types/（uuid, markdown, date）
storage/    ← 依赖 types/ + utils/（IndexedDB Store：blockStore, documentStore, projectStore, sessionStore, usageStore）
services/   ← 依赖 types/ + utils/ + storage/（aiService, authService, autoSyncService, blockCaptureService, blockReleaseService, exportService, sessionService, syncService）
editor/     ← 依赖 types/ + storage/（TipTap 扩展：blockLink, blockReference, sourceBlock, inlineAI, suggestion）
hooks/      ← 依赖 types/ + storage/ + services/（useAppLayout, useAuth, useAutoSync, useBlockSearch, useSession, useTabs, useToast, useViewport, useSwipeGesture, useLongPress）
components/ ← 依赖以上各层（layout/, editor/, ai/, panel/, project/, auth/, shared/）
App.tsx     ← 组装层（模式切换、主路径编排）
```

## 当前核心模块

## 当前核心模块

### 1. 数据与存储

- **IndexedDB 数据库**：`blockos-db`
- **Object Stores**：`blocks`、`documents`、`projects`、`sessions`、`usages`
- **数据库单例**：所有 Store 共用同一个 `IDBDatabase` 实例
- **本地为主**：IndexedDB 为真实数据源，UI 状态额外保存在 `localStorage`

当前持久化分工：

- **IndexedDB**（结构化数据）
  - 文档内容和元数据
  - Block 数据（内容、样式、模板、版本、注释）
  - 项目数据和文档关联
  - AI Session 历史和消息
  - Block 使用记录（usages）
- **localStorage**（UI 状态）
  - 主题偏好（default / newsprint）
  - 视图模式（`ai-focus` / `hybrid`）
  - 工作区标签页恢复
  - 当前 Session 恢复
  - 星标列表
  - 布局偏好（侧边栏状态、编辑器宽度）
  - 自动同步待处理队列

### 2. 编辑器架构

编辑器基于 **TipTap 2**（ProseMirror），核心扩展包括：

- **BlockLink**：双向链接 `[[...]]`，支持自动补全和导航
- **BlockReference**：块引用 `((...))`，支持版本化引用
- **SourceBlock**：来源块标记（AI / 灵感 / 用户），支持版本发布
- **inlineAI**：选区上的 AI 操作工具栏，支持改写、翻译、总结
- **suggestion**：Block 搜索与自动补全，支持模糊匹配

编辑器承担三类职责：

- **内容编辑**：富文本编辑与自动保存，支持 Markdown 语法
- **Block 操作**：Block 引用、SourceBlock 标记、AI 内联操作
- **事件桥接**：与其他面板的交互事件处理

当前已接入的关键编辑器事件：

- `sendToAI`：发送选中内容到 AI 面板
- `openAIChat`：打开 AI 对话面板
- `navigateToBlock`：导航到指定 Block
- `navigateToHeading`：导航到文档标题
- `insertBlockRelease`：插入 Block 发布版本

### 3. AI 面板架构

AI 能力集中在多个组件中，支持两种运行形态：

#### AI 沉浸式模式（`ai-focus`）
- **ChatLayout**：全屏布局容器（100vh，三区域：顶部导航、中间内容、底部输入）
- **ChatHeader**：顶部导航栏（折叠按钮、标题、副标题、新建对话、分享按钮）
- **MessageContent**：AI 回答内容区（水平居中，max-width: 760px，完整 Markdown 渲染）
- **ChatInput**：底部输入框（圆角设计，功能按钮组，附件按钮，圆形发送按钮）
- **AIImmersivePanel**：整合所有子组件的沉浸式面板
- **左右分栏布局**：对话区 75%，历史/设置侧边栏 25%（3:1 比例）

#### 混合模式（`hybrid`）
- **RightPanel**：右侧 AI 面板与编辑器协作
- **AIFloatPanel**：浮动 AI 面板，支持内联操作
- 可捕获为 Block、写入编辑器、查看历史 Session

#### AI 提供商层
当前支持：
- **MiMo**：小米 AI，SSE 流式响应
- **DeepSeek**：支持推理模式（DeepThink）

统一能力包括：
- **流式回复**：实时显示 AI 生成内容
- **内容分离**：回复与 `editorContent` 独立管理
- **Markdown 渲染**：完整支持（标题、列表、表格、代码块、语法高亮）
- **会话持久化**：Session 历史保存到 IndexedDB
- **主题适配**：Default 和 Newsprint 主题完整支持

### 4. Block 系统

Block 是系统最小知识单元，采用**内容/样式/模板三层解耦**架构：

#### Block 类型
- **隐式 Block**：来自文档段落或 AI 回复，不直接展示在 Block 空间
- **显式 Block**：用户捕获后展示在 Block 空间，支持搜索和管理

#### Block 数据结构
- **内容层（Content）**：
  - `source`：来源信息（editor/ai/import，可追溯到原始文档或 AI 会话）
  - `editHistory`：编辑历史记录（时间、编辑者、摘要）
  - `links`：Block 间的引用关系
- **样式层（Style）**：
  - `aiBlockTreatment`：AI 块视觉处理方式（accent-border/subtle-bg/invisible）
  - `showSourceLabel`：是否显示来源标签
  - `accentColor`：强调色，`customClass`：自定义 CSS 类名
- **模板层（Template）**：
  - `role`：结构角色（paragraph/heading/quote/separator/list/code/scene/dialogue/annotation）
  - `level`：标题层级，`group`：分组标识，`order`：组内排序
  - `exportStrategy`：导出策略（merge-as-paragraph/keep-as-quote/remove）
- **附属层（Annotations）**：
  - `translation`、`explanation`、`comment`、`footnote`：多语言翻译、解释说明、评论、脚注
  - 支持锚定到原文片段，append-only 日志结构
- **版本层（Releases）**：
  - `releases`：用户主动发布的版本快照（版本号、内容、标题、发布时间）
  - `usages`：独立存储的使用记录（引用的文档、版本、插入时间）

#### Block UI 组件
- **BlockSpacePanel**：Block 空间主面板，支持搜索、过滤、标签管理
- **BlockDetailPanel**：Block 详情面板，显示元数据、版本历史、使用记录
- **BlockDerivativeSelector**：版本选择器，支持派生关系管理
- **DocumentBlocksPanel**：文档内 Block 列表，显示隐式 Block

### 5. 工作区与导航

工作区采用**三栏布局**：

#### 左侧导航区
- **ActivityBar**：图标导航栏（项目、大纲、搜索、星标、设置）
- **Sidebar**：内容面板，支持折叠/展开，响应式适配

#### 中部编辑区
- **TabBar**：多文档标签页管理，支持拖拽排序
- **Editor**：TipTap 富文本编辑器
- **ResizeHandle**：可拖拽的面板分隔器

#### 右侧面板区
- **RightPanel**：多功能面板（AI 对话、Block 空间、预览、Session 历史）

#### 关键导航能力
- **多标签页**：Today / Project / Document 类型，支持标签页恢复
- **项目概览**：`ProjectOverview` 组件，显示项目统计和文档列表
- **视图切换**：
  - `StarredView`：置顶内容视图
  - `SearchView`：全局搜索视图
  - `OutlineView`：文档大纲视图
  - `ProjectExplorer`：项目文件树视图

#### 状态恢复
- **标签页恢复**：重启后恢复标签页集合和活动标签
- **Session 恢复**：恢复当前 AI 对话 Session
- **视图状态**：恢复视图模式（ai-focus/hybrid）和主题
- **布局状态**：恢复侧边栏状态和编辑器宽度

#### 底部状态栏
- **StatusBar**：显示文档统计（字数、Block 数、链接数）、自动保存状态、同步状态

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

当前 UI 状态分为三类：

- **数据状态**
  - Projects / Documents / Blocks / Sessions
  - 来源：IndexedDB
- **工作区状态**
  - Tabs / Active Tab / Current Project / View Mode / Theme
  - 来源：React state + localStorage
- **同步状态**
  - `isSyncing` / `isOnline` / `lastSyncTime` / pending queues
  - 来源：`autoSyncService`

同步状态展示统一出现在：

- **StatusBar**：底部状态栏显示同步状态和文档统计
- **SyncStatusIndicator**：实时同步状态指示器
- **SettingsPanel**：设置面板中的同步配置和状态

## 技术栈

### 核心技术
- **React 18 + TypeScript 5**（严格模式）
- **Vite 6** 构建系统
- **Bun** 包管理器（路径: `~/.bun/bin/bun`）
- **TipTap 2**（基于 ProseMirror）富文本编辑器
- **IndexedDB** 本地存储（数据库: `blockos-db`）
- **Supabase**（可选认证和云同步）

### UI 与样式
- **CSS 自定义属性**（design tokens）
- **lucide-react** 图标库
- **响应式设计**（桌面/平板/手机适配）

### AI 集成
- **MiMo API**（小米 AI，流式 SSE）
- **DeepSeek API**（支持推理模式）

### 内容处理
- **react-markdown + remark-gfm**（Markdown 渲染）
- **react-syntax-highlighter**（代码高亮，100+ 语言）

## 目录结构

```text
src/
├── types/          # 类型定义（零依赖）
│   ├── block.ts    # Block 数据模型（内容/样式/模板三层）
│   ├── document.ts # 文档和隐式 Block
│   ├── project.ts  # 项目和标签页
│   ├── chat.ts     # AI 对话和 Session
│   └── layout.ts   # 布局和 UI 状态
├── utils/          # 纯工具函数
│   ├── uuid.ts     # UUID 生成
│   ├── markdown.ts # Markdown 处理
│   └── date.ts     # 日期格式化
├── storage/        # IndexedDB Store 层
│   ├── index.ts    # 数据库初始化
│   ├── blockStore.ts
│   ├── documentStore.ts
│   ├── projectStore.ts
│   ├── sessionStore.ts
│   └── usageStore.ts
├── services/       # 业务逻辑层
│   ├── aiService.ts          # AI 对话服务
│   ├── authService.ts        # 认证服务
│   ├── autoSyncService.ts    # 自动同步服务
│   ├── blockCaptureService.ts # Block 捕获服务
│   ├── blockReleaseService.ts # Block 版本发布
│   ├── exportService.ts      # 导出服务
│   ├── sessionService.ts     # Session 管理
│   └── syncService.ts        # 云同步服务
├── editor/         # TipTap 扩展
│   └── extensions/
│       ├── blockLink.ts      # 双向链接 [[...]]
│       ├── blockReference.ts # 块引用 ((...)
│       ├── sourceBlock.ts    # 来源块标记
│       ├── inlineAI.ts       # 内联 AI 工具栏
│       └── suggestion.ts     # 自动补全
├── hooks/          # React Hooks
│   ├── useAppLayout.ts   # 布局状态管理
│   ├── useAuth.ts        # 认证状态
│   ├── useAutoSync.ts    # 自动同步
│   ├── useBlockSearch.ts # Block 搜索
│   ├── useSession.ts     # AI Session
│   ├── useTabs.ts        # 标签页管理
│   ├── useToast.ts       # 通知提示
│   ├── useViewport.ts    # 设备检测
│   ├── useSwipeGesture.ts # 手势识别
│   └── useLongPress.ts   # 长按操作
├── components/     # UI 组件
│   ├── ai/         # AI 相关组件
│   │   ├── AIFloatPanel.tsx      # 浮动 AI 面板
│   │   ├── AIImmersivePanel.tsx  # 沉浸式 AI 面板
│   │   ├── ChatLayout.tsx        # 对话布局容器
│   │   ├── ChatHeader.tsx        # 对话顶部导航
│   │   ├── MessageContent.tsx    # 消息内容渲染
│   │   └── ChatInput.tsx         # 对话输入框
│   ├── auth/       # 认证组件
│   │   └── AuthPage.tsx
│   ├── editor/     # 编辑器组件
│   │   ├── Editor.tsx
│   │   └── SuggestionMenu.tsx
│   ├── layout/     # 布局组件
│   │   ├── ActivityBar.tsx       # 左侧图标导航
│   │   ├── Sidebar.tsx           # 左侧内容面板
│   │   ├── TabBar.tsx            # 标签页栏
│   │   ├── ResizeHandle.tsx      # 拖拽分隔器
│   │   └── StatusBar.tsx         # 底部状态栏
│   ├── panel/      # 右侧面板组件
│   │   ├── RightPanel.tsx        # 右侧面板容器
│   │   ├── BlockSpacePanel.tsx   # Block 空间
│   │   ├── BlockDetailPanel.tsx  # Block 详情
│   │   ├── BlockDerivativeSelector.tsx # 版本选择
│   │   ├── DocumentBlocksPanel.tsx # 文档 Block 列表
│   │   ├── PreviewPanel.tsx      # 预览面板
│   │   ├── SessionHistoryPanel.tsx # Session 历史
│   │   └── SettingsPanel.tsx     # 设置面板
│   ├── project/    # 项目相关组件
│   │   └── ProjectOverview.tsx   # 项目概览
│   └── shared/     # 通用组件
│       ├── Toast.tsx             # 通知提示
│       └── MarkdownRenderer.tsx  # Markdown 渲染器
└── App.tsx         # 主应用入口

docs/
├── spec/           # 规范文档
│   ├── architecture/   # 架构决策记录（ADR）
│   ├── features/       # 功能需求文档
│   ├── PRD/            # 产品需求文档
│   └── prototype/      # 原型文件
├── guide/          # 使用指南
│   ├── developer/      # 开发者指南
│   ├── QUICK_START.md  # 快速开始
│   └── SUPABASE_SETUP.md # Supabase 配置
├── tests/          # 测试文档
│   ├── README.md           # 测试文档中心
│   ├── responsive-*.md     # 响应式测试系列
│   └── test-*.md           # 各类测试指南
├── logs/           # 工作日志（按月/日组织）
├── CHANGELOG.md    # 版本更新记录
├── todo.md         # 待办事项
└── ARCHITECTURE.md # 架构文档（本文件）
```

## 当前已知架构风险与改进计划

### 已知风险
- **构建产物偏大**：主包仍需代码分割和懒加载优化
- **混合导入警告**：自动同步相关模块存在 mixed import 警告（不影响运行）
- **同步重试机制**：删除同步已具备离线闭环，但缺乏细粒度的失败重试分类
- **文件系统集成**：当前仍是 IndexedDB/Supabase 架构，未接入本地文件系统

### 改进计划
- **Phase 3**：Block 可视化（关系图谱、依赖分析）
- **Phase 4**：本地文件存储集成（Git 版本控制）
- **性能优化**：虚拟滚动、组件懒加载、构建分包
- **手势增强**：滑动切换标签页、双指缩放、长按菜单
- **响应式完善**：真机测试完成、iPad 专项优化

### 测试覆盖
- **响应式测试体系**：8个核心文档 + 3个辅助文档
- **设备矩阵**：桌面/平板/手机 × Chrome/Safari/Edge/Firefox
- **真机支持**：iPad Pro/Air/Mini、iPhone 15 Pro Max/SE、Android
- **自动化脚本**：浏览器控制台快速验证脚本

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
| v1.9 | 2026-04-14 | 响应式测试文档体系 + 关键 Bug 修复 |
| v1.10 | 2026-04-14 | AI 沉浸模式界面优化（Phase 6 完成） |

### 最新版本亮点

**v1.10.2 (2026-04-14)**：修复 AI 沉浸模式右侧边栏 CSS 布局问题
**v1.10.1 (2026-04-14)**：AI 沉浸模式左右分栏布局（3:1 比例）
**v1.10.0 (2026-04-14)**：AI 沉浸模式组件化重构（ChatLayout, ChatHeader, MessageContent, ChatInput）
**v1.9.2 (2026-04-14)**：修复 Block 发布版本和引用记录统计问题
**v1.9.1 (2026-04-14)**：修复左侧边栏点击闪烁问题
**v1.9.0 (2026-04-14)**：建立完整响应式测试文档体系
