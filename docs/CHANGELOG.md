# BlockOS 更新日志

## [v1.2.1] - 2026-04-13 🐛 文档管理 Bug 修复

修复严重的文档管理问题：同一文档出现多个标签页、所有文档显示相同内容。修复 `useTabs` 重复检查逻辑，修复 Editor 无 documentId 时自动加载导致内容共享。添加双击文档直接打开功能，单击显示操作菜单。每个文档现在有独立内容，标签页不再重复。

## [v1.2.0] - 2026-04-13 💾 保存增强与底部状态栏

右键标签页添加"保存"选项，Toast 提示保存结果。实现 VSCode 风格底部状态栏，三栏布局：左侧显示同步状态（离线/同步中/待同步/已同步），中间显示自动保存状态（保存中/未保存/已保存 + 智能时间），右侧显示文档统计（字数/引用块/双向链接）。实时监听编辑器更新，旋转动画表示进行中。→ [功能文档](./spec/features/editor/save-and-status-bar.md)

## [v1.1.0] - 2026-04-13 ⚙️ 设置面板

增强用户账号按钮，点击打开设置面板。账号标签页显示用户信息和退出登录；同步标签页实时显示同步状态（网络/同步/上次同步/待同步项），支持手动同步，提供本地/云端模式配置指南。完整 Newsprint 主题适配，响应式设计，遮罩层动画。→ [功能文档](./spec/features/editor/settings-panel.md)

## [v1.0.0] - 2026-04-13 ☁️ Supabase 云端集成完成

**重要里程碑**：Supabase 云端集成三大核心功能全部完成。

- **自动同步**：后台定时任务（30s）自动上传本地变更，storage 层零侵入集成
- **首次登录拉取**：登录后自动从云端拉取所有数据，支持多设备协作
- **离线模式**：网络监控 + 待同步队列，断网正常工作，恢复后自动同步
- **同步状态 UI**：Sidebar 底部实时显示离线/同步中/待同步/已同步状态
- **本地模式支持**：Supabase 未配置时优雅降级，纯本地 IndexedDB 运行

新增 `autoSyncService` 核心服务、`useAutoSync` Hook、`SyncStatusIndicator` 组件。→ [完整文档](./spec/features/storage/auto-sync.md)

## [v0.10.0] - 2026-04-11 ✦ AI 浮动工具栏编辑器层

BubbleMenu 改为 AI 操作菜单（续写/改写/缩写/扩写/翻译/解释/存为块）。新增 `inlineAI` TipTap Extension（ProseMirror Plugin 封装），管理 AIReplaceDecoration 临时态和并发控制。SourceBlock 新增 `pending` 属性，续写结果以临时态插入，保留/丢弃按钮确认。翻译/解释写入 Block annotations 附属层并显示行内预览条。类型检查通过 ✅

## [v0.9.0] - 2026-04-11 📎 Block 附属层 + AI Toolbar 数据层

Block 新增 annotations 附属层（translation/explanation/comment/footnote），与 releases 完全独立，append-only 设计。新增 `sendInlineAIRequest`（六种模式专用 prompt），`captureSelectionAsBlock`（编辑器选中捕获），导出支持附属层自由组合。→ [ADR](./spec/architecture/content-style-template.md) | [需求](./spec/features/editor/inline-ai-toolbar.md)

## [v0.8.0] - 2026-04-11 🎨 编辑器 UI 重构

编辑器视觉对标 minimal-tiptap 风格。完整 Design Tokens 体系（CSS 变量），Toolbar 按功能分组，新增 BubbleMenu 悬浮菜单，编辑区域样式全面升级（标题/段落/blockquote/code block/列表）。纯 CSS + React 实现，零 UI 库依赖。

## [v0.7.0] - 2026-04-11 📦 Block 版本化引用系统

Block 支持 working copy + release 模型。捕获时自动创建 v1，用户可发布新版本。Block 详情面板显示版本列表（标题+内容预览+时间）、引用记录。编辑器内 SourceBlock hover 显示操作栏（发布版本/查看版本），内容实时同步回 IndexedDB。usages 独立 store。→ [需求文档](./spec/features/block-system/block-versioned-references.md)

## [v0.6.1] - 2026-04-11 🧩 SourceBlock 自定义节点

编辑器中的 AI 块/灵感块从 blockquote hack 重构为 `SourceBlock` 自定义 TipTap 节点。来源信息存在节点 attrs 中（不可编辑元数据），内容完全可编辑，视觉由 CSS 类名 + 主题控制。→ [ADR](./spec/architecture/content-style-template.md)

## [v0.6.0] - 2026-04-11 🏗️ 内容/样式/模板三层解耦

Block 数据模型拆分为 Content / Style / Template 三层。新增 `exportService` 多格式导出、`PreviewPanel` 预览导出面板、预置样式主题和文档模板。拖拽 AI 回复和 Block 到编辑器带来源标记，修复拖拽重复 bug。

## [v0.5.0] - 2026-04-11 🔐 Supabase 认证集成

用户名+密码注册/登录，RLS 安全策略，数据同步服务。

## [v0.4.2] - 2026-04-10 📁 文档管理系统

项目文档列表、打开/重命名/删除/移动文档。

## [v0.4.1] - 2026-04-10 💬 AI Session 管理

Session 持久化、多 Session 管理、历史列表、JSON 导出。

## [v0.4.0] - 2026-04-10 🏗️ 模块化分层架构重构

8 步重构完成，建立 types → utils → storage → services → editor → hooks → components → App 严格单向依赖架构。

## [v0.3.0] - 2026-04-09 🚀 多项目工作区

左侧边栏、项目管理、多标签页编辑器、全屏模式、可调整布局、标签页拖拽重排序和右键菜单、布局偏好持久化。

## [v0.2.0] - 2026-04-09 🚀 Block 系统核心

AI 回复自动 Block 化、Block 版本派生系统、双向链接 `[[]]`、块引用 `(())`、Git 集成。

## [v0.1.0] - 2026-04-09 🚀 Phase 1 基础编辑器

三栏布局、TipTap 编辑器、基础 Markdown 支持。
