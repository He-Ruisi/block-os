# BlockOS 更新日志

## [v1.9.1] - 2026-04-14 🐛 修复左侧边栏点击不显示

**严重 Bug 修复**：修复点击 ActivityBar 图标后左侧边栏闪一下不显示的问题。

- **问题描述**：
  - 点击 ActivityBar 上方的项目、大纲等按钮后，左侧边栏快速闪一下但不显示
  - 用户无法正常呼出左侧边栏，核心功能完全不可用
  - 影响范围：桌面/平板/手机所有设备
- **根本原因**：
  - `handleSidebarViewChange` 使用 `toggleSidebar()` 切换状态，异步状态更新导致不一致
  - `Sidebar` 组件在 `collapsed=true` 时直接返回 `null`，导致重新挂载闪烁
- **修复方案**：
  - App.tsx: 将 `toggleSidebar()` 改为直接设置 `setSidebarCollapsed(true/false)`
  - Sidebar.tsx: 移除 `if (collapsed) return null`，改用 `style={{ display: collapsed ? 'none' : 'flex' }}`
- **经验教训**：
  - 避免使用 toggle 函数，直接设置状态更可靠
  - 使用 CSS 控制显示避免重新挂载
  - 状态更新是异步的，不要依赖状态更新的时序

修复后左侧边栏可以正常展开/折叠，无闪烁，交互流畅。→ [Bug 修复文档](./tests/bug-fix-sidebar-flash.md) | [Bug 记录 #001](./bugs.md)

## [v1.9.0] - 2026-04-14 📋 响应式测试文档体系

**重要基础设施**：建立完整的响应式测试文档体系，支持桌面/平板/手机全矩阵测试。

- **核心测试文档**（8个）：
  - 测试文档中心（README.md）- 总入口和导航
  - 开始响应式测试（start-responsive-test.md）- 新手必读
  - 响应式测试矩阵（responsive-test-matrix.md）- 完整设备×浏览器矩阵
  - 响应式快速测试（responsive-quick-test.md）- 5分钟快速验证
  - 响应式测试检查清单（responsive-checklist.md）- 可打印清单
  - 测试报告模板（test-report-template.md）- 标准化报告格式
  - 测试进度跟踪（test-progress.md）- 实时进度和问题统计
  - 响应式测试脚本（responsive-test-script.js）- 浏览器控制台自动化测试
- **辅助文档**（3个）：
  - 测试文档总结（SUMMARY.md）- 文档体系概览
  - 项目测试指南（TEST.md）- 根目录快速指南
  - 启动脚本（test-responsive.bat / test-responsive.sh）- 快速启动测试
- **测试覆盖范围**：
  - 设备：桌面（≥1280px）/ 平板（768-1280px）/ 手机（<768px）
  - 浏览器：Chrome / Safari / Edge / Firefox
  - 真机：iPad Pro / iPad Air / iPad Mini / iPhone 15 Pro Max / iPhone SE / Android
  - 功能：AI 对话、布局响应式、触摸交互、编辑器、项目管理、Block 系统、主题、性能、数据持久化
- **测试流程**：准备（10分钟）→ 浏览器模拟（30分钟）→ 真机测试（1小时）→ 自动化验证（5分钟）→ 报告提交（10分钟）
- **文档特点**：
  - 分层设计：从快速验证到完整测试
  - 真机友好：可打印清单，支持局域网和 ngrok 访问
  - 自动化支持：浏览器控制台脚本快速验证
  - 标准化流程：统一的测试流程、报告格式和进度跟踪
  - 优先级明确：P0/P1/P2 三级优先级，聚焦核心功能

测试文档体系已完整建立，可以开始实际测试工作。预计完整测试时间 1.5-2 小时。→ [测试文档中心](./tests/README.md)

## [v1.8.1] - 2026-04-13 ✨ AI 回复 Markdown 渲染增强 v2

**重要更新**：编辑器内容（editorContent）现在也使用完整 Markdown 渲染，视觉层级更清晰。

- **编辑器内容 Markdown 渲染**：
  - `editorContent` 使用完整 Markdown 渲染（代码高亮、表格、列表等）
  - 独立卡片样式，带"📝 编辑器内容"标签
  - 更大的内边距（16px）和更清晰的视觉层级
  - 完整主题适配（default + newsprint）
- **显示逻辑优化**：
  - AI 对话回复（`content`）：简短回复，Markdown 渲染
  - 编辑器内容（`editorContent`）：完整内容，Markdown 渲染，重点展示
  - 支持三种场景：只有对话/只有编辑器内容/同时存在两者
- **视觉增强**：
  - 编辑器内容卡片有独立背景色和边框
  - Newsprint 主题：硬边框、硬阴影、衬线字体标签
  - 更清晰的内容层级和视觉分离

所有 AI 回复内容（对话和编辑器）都拥有完整的 Markdown 渲染效果。→ [完整文档](./spec/features/ai/ai-reply-markdown-rendering.md)

## [v1.8.0] - 2026-04-13 ✨ AI 回复 Markdown 渲染增强

**重要更新**：AI 回复从纯文本升级为完整 Markdown 渲染，支持代码高亮、表格、列表等丰富格式。

- **Markdown 完整支持**：
  - 标题（H1-H6）、段落、强调（粗体/斜体/删除线）
  - 列表（有序/无序/嵌套）、引用、链接、分隔线
  - 任务列表（GitHub 风格 GFM 扩展）
- **代码渲染增强**：
  - 语法高亮（支持 100+ 编程语言）
  - 语言标签显示 + 一键复制按钮
  - 行内代码带背景色和边框
  - 主题适配（oneDark / oneLight）
- **表格支持**：完整表格渲染，响应式横向滚动，悬停高亮
- **主题适配**：Default 主题（圆角、柔和阴影）和 Newsprint 主题（直角、硬边框、衬线字体）
- **响应式优化**：移动端字号自动调整，代码块和表格全宽显示
- **性能优化**：只对 AI 回复使用 Markdown 渲染，用户消息保持纯文本

新增 `MarkdownRenderer` 组件，使用 react-markdown + remark-gfm + react-syntax-highlighter 实现。→ [完整文档](./spec/features/ai/ai-reply-markdown-rendering.md)

## [v1.7.1] - 2026-04-13 ⭐ 置顶功能增强

**重要更新**：修复侧边栏闪退问题，完成置顶功能所有增强特性。

- **Bug 修复**：修复 StarredView 组件异步加载导致的侧边栏闪退问题
- **星标按钮**：
  - 项目和文档行 hover 时显示星标按钮
  - 已置顶项目显示金色填充星标 (#f59e0b)
  - 点击切换置顶状态，实时同步
- **拖拽排序**：
  - 使用 HTML5 Drag and Drop API
  - 拖拽时半透明显示 (opacity: 0.5)
  - 支持任意位置放置，自动保存
- **数量限制**：最多置顶 10 个项目，超限时弹出提示
- **全局同步**：ExplorerView 和 StarredView 通过 toggleStar 事件实时同步

修复了严重的侧边栏闪退 bug，完整实现所有置顶增强功能。→ [完整文档](./spec/features/editor/starred-items-enhancement.md)

## [v1.7.0] - 2026-04-13 ⭐ 侧边栏置顶功能

**新功能**：参考 Claude AI 侧边栏设计，添加置顶功能快速访问常用项目和文档。

- **置顶视图**：侧边栏新增星标图标，显示置顶的项目和文档列表
- **快速访问**：点击置顶项目切换视图，点击置顶文档直接打开
- **数据持久化**：使用 localStorage 存储置顶列表（`blockos-starred-items`）
- **全局事件系统**：`toggleStar` 事件支持跨组件通信
- **交互优化**：
  - 悬停显示取消置顶按钮
  - 星标图标填充表示已置顶
  - 空状态显示引导提示
- **侧边栏布局调整**：资源管理器 → 搜索 → 置顶 → 大纲 → 插件
- **主题适配**：Default 主题（金色星标）和 Newsprint 主题（红色星标）

新增 `StarredView` 组件和 `StarredItem` 类型定义。→ [完整文档](./spec/features/editor/starred-items.md)

## [v1.6.1] - 2026-04-13 🗄️ Supabase Schema v2.0

**重要基础设施更新**：数据库 schema 升级以支持最新功能。

- **Blocks 表增强**：
  - 新增 `source` (JSONB) - 统一的来源信息对象
  - 新增 `edit_history` (JSONB) - 编辑历史追踪
  - 新增 `style` (JSONB) - 自定义样式配置
  - 新增 `template` (JSONB) - 结构角色和导出规则
  - 新增 `releases` (JSONB) - 版本快照系统
  - 新增 `annotations` (JSONB) - 附属层（翻译/解释/评论/脚注）
  - 新增派生字段：`derived_from`、`context_document_id`、`context_title`、`modifications`
- **Documents 表增强**：
  - 新增 `blocks` (JSONB) - 存储文档中的隐式 Block
- **新增 block_usages 表**：独立存储 Block 使用记录，不内嵌在 Block 中
- **性能优化**：
  - 添加 JSONB 字段 GIN 索引提升查询性能
  - 添加 `updated_at` 自动更新触发器
- **同步服务更新**：`syncService.ts` 支持所有新字段的序列化/反序列化
- **迁移指南**：完整的数据迁移文档，支持全新安装和保留数据迁移两种方案

⚠️ **现有用户需要执行数据库迁移**，详见 [迁移指南](./guide/SUPABASE_MIGRATION.md)。新用户直接执行 `supabase-schema.sql` 即可。

## [v1.6.0] - 2026-04-13 🤖 AI 沉浸式模式

**重要里程碑**：实现 AI 沉浸式模式，提供全屏对话体验和平滑的编辑切换。

- **双模式架构**：AI 沉浸式模式（ai-focus）和混合模式（hybrid），状态持久化到 localStorage
- **AI 模式初始界面**：大号问候语"🤖 下午好"，居中巨大输入框（800px 最大宽度），底部显示当前模型信息
- **AI 模式对话界面**：用户输入后输入框自动下沉到底部，对话内容区域展开，保持全屏沉浸式体验
- **智能模式切换**：
  - 点击"写入编辑器"自动创建新文档"AI 对话笔记"
  - AI 内容自动写入新文档并聚焦
  - 侧边栏默认隐藏，聚焦编辑体验
  - 平滑布局过渡动画（0.4s cubic-bezier）
  - AI 面板缩小到右侧，编辑区域从左侧展开
- **完整主题适配**：Default 主题（圆角、柔和阴影、紫色强调）和 Newsprint 主题（直角、硬边框、黑色/红色强调）
- **App.tsx 布局重构**：AI 模式只渲染 RightPanel（全屏），混合模式渲染完整三栏布局

应用默认以 AI 沉浸式模式启动，提供纯净的对话体验。一键切换到编辑模式，自动创建文档并写入内容。→ [完整文档](./spec/features/ai/ai-immersive-mode.md)

## [v1.5.0] - 2026-04-13 🤖 DeepSeek API 集成

**多 AI 提供商支持**：用户可在小米 MiMo 和 DeepSeek 之间自由切换。

- **多提供商架构**：统一的提供商配置接口，支持动态切换
- **DeepSeek 模型支持**：
  - deepseek-chat（非思考模式）：快速响应，适合日常对话
  - deepseek-reasoner（思考模式）：深度推理，适合复杂任务
  - 128K 上下文长度，最大输出 8K/64K
- **温度参数优化**：根据 DeepSeek 官方建议，针对不同任务类型设置最佳温度（翻译 1.3、创作 1.5、通用 1.0）
- **UI 集成**：设置面板新增 AI 提供商和模型选择下拉框，实时显示特点提示
- **用户偏好持久化**：选择保存到 localStorage，下次自动恢复
- **错误处理增强**：API Key 未配置时显示具体提示信息

新增 `getCurrentProvider()`、`setCurrentProvider()`、`getCurrentModel()`、`setCurrentModel()` 等提供商管理函数。→ [完整文档](./spec/features/ai/deepseek-integration.md)

## [v1.4.0] - 2026-04-13 📱 iPad 响应式设计 Phase 2

**触摸交互优化完成**：滑动手势、长按菜单、触摸反馈动画。

- **滑动手势系统**：`useSwipeGesture` Hook 支持四方向滑动，可配置最小距离和滚动阻止
- **长按检测**：`useLongPress` Hook 替代右键菜单，支持移动阈值和延迟配置
- **触摸增强样式**：
  - 触摸反馈动画（scale 0.95 + ripple 效果）
  - 所有按钮触摸目标 ≥ 44px
  - 输入框优化（44px 高度，16px 字号防止 iOS 缩放）
  - 滑动手势视觉提示（边缘指示器）
  - 滚动条优化（隐藏但保持功能）
  - iOS 弹性滚动和键盘布局调整
  - 性能优化（硬件加速，减少重绘）
- **组件集成**：
  - Sidebar/RightPanel：滑动关闭（仅平板/手机）
  - ExplorerView：长按显示菜单，单击直接打开
  - Newsprint 主题：硬阴影风格触摸反馈

新增 `src/hooks/useSwipeGesture.ts`、`src/hooks/useLongPress.ts`、`src/styles/touch-enhancements.css`。→ [完整文档](./spec/features/responsive/ipad-responsive-design.md)

## [v1.3.0] - 2026-04-13 📱 iPad 响应式设计 Phase 1

**重要里程碑**：完成 iPad 和移动设备响应式适配基础布局。

- **响应式样式系统**：三个断点（手机 <768px、平板 768-1024px、桌面 ≥1280px），支持横竖屏，iOS Safe Area 适配
- **视口检测 Hook**：`useViewport` 实时检测设备类型和尺寸，监听窗口变化
- **组件响应式适配**：
  - ActivityBar：平板 56px，手机改为底部导航栏（60px）
  - Sidebar：浮层模式 + 遮罩层，点击关闭
  - Editor：全宽布局，字号优化（平板 16px，手机 17px）
  - Toolbar：触摸友好按钮（40x40px）
  - TabBar：标签高度 44px
  - RightPanel：浮层模式 + 关闭按钮
  - StatusBar：响应式高度，手机固定底部
  - ResizeHandle：平板/手机隐藏
- **主题适配**：Default 和 Newsprint 主题完整响应式支持，保持硬阴影和粗边框风格
- **触摸交互**：所有按钮触摸目标 ≥ 44px，触摸反馈动画

新增 `src/styles/responsive.css` 响应式样式文件、`src/hooks/useViewport.ts` 视口检测 Hook。→ [完整文档](./spec/features/responsive/ipad-responsive-design.md)

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
