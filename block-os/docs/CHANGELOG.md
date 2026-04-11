# BlockOS 更新日志

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
