# BlockOS 待办事项

## 今日上线版 MVP 收口

- [ ] 主路径联调与回归测试
  - [x] AI 对话 → 写入编辑器 → 自动保存 → 重开恢复 → 同步状态 主链路验证
  - [ ] 响应式主路径验证（桌面 / iPad / 手机）— [测试矩阵](./tests/responsive-test-matrix.md) | [快速指南](./tests/responsive-quick-test.md)
  - [x] 关键回归点验证（项目 / 文档 / 标签页 / 置顶 / AI 回复渲染 / Block 捕获）
- [ ] 本地文件读写最小闭环
  - [ ] 至少具备可靠导出能力
  - [ ] 明确导入 / 落盘方案与限制
- [ ] Supabase schema 迁移闭环
  - [ ] 现有用户迁移脚本执行说明
  - [ ] 升级后兼容性验证
- [x] 会话 / 文档状态恢复
  - [x] 重启应用后恢复当前上下文
  - [x] 异常中断后的最小恢复能力
- [ ] Block 基础操作补齐
  - [ ] `(())` 引用时版本选择
  - [x] Block 编辑后发布版本（releaseVersion 更新 + usage 记录）
  - [ ] Block 删除 / 归档

## P0 - 核心功能（当前优先）

### 主题样式重塑 🎨 - [需求文档](./spec/features/styles/style.md)
- [x] Phase 1: Tailwind CSS + Shadcn/UI 安装（2026-04-15 完成）
  - [x] 安装 Tailwind CSS 核心依赖（tailwindcss、postcss、autoprefixer）
  - [x] 安装 Shadcn/UI 工具库（class-variance-authority、clsx、tailwind-merge）
  - [x] 创建 tailwind.config.js 配置
  - [x] 创建 postcss.config.js 配置
  - [x] 创建 components.json 配置
  - [x] 创建 src/index.css（Design Token 系统）
  - [x] 创建 src/lib/utils.ts（cn() 工具函数）
  - [x] 更新 tsconfig.json（路径别名）
  - [x] 更新 vite.config.ts（路径别名解析）
  - [x] TypeScript 类型检查通过
  - [x] 开发服务器正常启动
- [x] Phase 2: AI 沉浸模式样式重构（Notion/Roam 风格）（2026-04-15 完成）
  - [x] 分析当前 AI 沉浸模式实现
  - [x] 制定 v0.dev 辅助设计方案
  - [x] 生成精准的 v0.dev 提示词
  - [x] 使用 v0.dev 生成 UI 组件
  - [x] 应用 v0.dev 生成的样式到现有组件
  - [x] 更新 ChatLayout 组件样式（移除 CSS，使用 Tailwind）
  - [x] 更新 ChatHeader 组件样式（移除 CSS，使用 Tailwind）
  - [x] 更新 ChatInput 组件样式（移除 CSS，使用 Tailwind，添加自动高度）
  - [x] 更新 MessageContent 组件样式（移除 CSS，使用 Tailwind，添加复制和 hover）
  - [x] 更新 AIImmersivePanel 组件样式（移除 CSS，使用 Tailwind）
  - [x] TypeScript 类型检查通过
  - [x] 开发服务器正常启动
  - [x] 删除旧的 CSS 文件（5 个文件）
  - [ ] 功能测试（所有功能保持正常）
  - [ ] 主题适配（Default + Newsprint）
  - [ ] 响应式测试（桌面/平板/手机）
- [x] Phase 2.5: 左侧边栏样式重构（已完成）
  - [x] 重构 Sidebar 主容器（移除 CSS，使用 Tailwind）
  - [x] 重构 ExplorerView 组件（资源管理器）
  - [x] 重构 StarredView 组件（置顶视图）
  - [x] 重构 SearchView 组件（搜索视图）
  - [x] 重构 OutlineView 组件（大纲视图）
  - [x] 重构 ExtensionsView 组件（插件视图）
  - [x] 重构 ActivityBar 组件（活动栏）
  - [x] 重构 StatusBar 组件（状态栏）
  - [x] 重构 ResizeHandle 组件（调整大小手柄）
  - [x] 重构 Toast 组件（提示消息）
  - [x] 重构 MarkdownRenderer 组件（Markdown 渲染器）
  - [x] 重构 SyncStatusIndicator 组件（同步状态指示器）
  - [x] TypeScript 类型检查通过
  - [x] 删除所有旧的 CSS 文件（12 个文件）
  - [ ] 功能测试（所有功能保持正常）
  - [ ] 主题适配（Default + Newsprint）
  - [ ] 响应式测试（桌面/平板/手机）
- [ ] Phase 3: 安装常用 Shadcn UI 组件（下一步，预计 30-45 分钟）
  - [ ] Button（按钮）
  - [ ] Card（卡片）
  - [ ] Dialog（对话框）
  - [ ] Tabs（标签页）
  - [ ] Select（选择器）
  - [ ] Dropdown Menu（下拉菜单）
  - [ ] Input（输入框）
  - [ ] Textarea（文本域）
  - [ ] Popover（弹出层）
  - [ ] Toast（通知）- 确认是否已有
  - [ ] 测试所有组件是否正常工作
  - [ ] 熟悉组件 API 和使用方式
- [ ] Phase 3.5: 自定义主题 CSS 变量（可选）
  - [ ] 定义品牌色（primary、secondary）
  - [ ] 定义语义色（success、warning、error、info）
  - [ ] 定义中性色（gray 色阶）
  - [ ] 定义圆角（radius）
  - [ ] 定义阴影（shadow）
  - [ ] 定义字体（font-family、font-size）
  - [ ] 定义间距（spacing）
  - [ ] 暗色模式适配
- [ ] Phase 4: 中风险组件迁移（使用 Shadcn UI 组件，预计 3-4 小时）
  - [ ] 重构 TabBar（使用 Shadcn Tabs 组件）
  - [ ] 重构 RightPanel（使用 Shadcn Card 组件）
  - [ ] 重构 BlockSpacePanel（使用 Shadcn 组件）
  - [ ] 重构 BlockDetailPanel（使用 Shadcn Dialog）
  - [ ] 重构 BlockDerivativeSelector（使用 Shadcn Select）
  - [ ] 重构 DocumentBlocksPanel（使用 Shadcn 组件）
  - [ ] 重构 PreviewPanel（使用 Shadcn 组件）
  - [ ] 重构 SessionHistoryPanel（使用 Shadcn 组件）
  - [ ] TypeScript 类型检查通过
  - [ ] 功能测试（所有功能保持正常）
  - [ ] 主题适配（Default + Newsprint）
  - [ ] 响应式测试（桌面/平板/手机）

### OCR 插件系统 🔌 - [技术设计](../.kiro/specs/ocr-plugin-system/design.md)
- [x] Phase 1: 插件系统核心（Week 1）
  - [x] 创建插件类型定义（src/types/plugin.ts）
  - [x] 实现插件 API（src/services/pluginAPI.ts）
  - [x] 实现插件注册表（src/services/pluginRegistry.ts）
  - [x] 实现插件配置存储（src/storage/pluginConfigStore.ts）
  - [x] 更新 ExtensionsView 组件
- [x] Phase 2: OCR 插件实现（Week 2）
  - [x] 创建 OCR 插件目录结构
  - [x] 实现 OCR 服务（ocrService.ts）
  - [x] 实现 OCR UI 组件（OCRPanel.tsx）
  - [x] 实现 OCR 插件入口（index.ts）
  - [x] 添加 OCR 样式（OCRPanel.css）
- [x] Phase 3: 集成与测试（Week 3）
  - [x] 在 App.tsx 中初始化插件系统
  - [x] 注册 OCR 插件
  - [x] TypeScript 类型检查通过
  - [ ] 编写单元测试
  - [ ] 编写集成测试
  - [ ] 手动测试完整流程
- [ ] Phase 4: 文档与优化（Week 4）
  - [ ] 编写插件开发文档
  - [ ] 编写用户使用文档
  - [ ] 优化 UI/UX
  - [ ] 性能优化
  - [ ] 安全审计

### OCR 增强 UI 🎨 - [需求文档](../.kiro/specs/ocr-enhanced-ui/requirements.md) (2026-04-16实现)
- [ ] Phase 1: 基础三栏布局 + 历史记录列表
  - [ ] 创建 OCREnhancedPanel 组件（三栏布局容器）
  - [ ] 创建 HistoryList 组件（左侧历史记录列表）
  - [ ] 实现 IndexedDB 存储（ocr-photos 对象存储）
  - [ ] 实现历史记录持久化（最多 100 条）
  - [ ] 实现历史记录排序（时间倒序）
  - [ ] 实现历史记录选择和高亮
  - [ ] 响应式布局（768px 断点）
- [ ] Phase 2: 图片预览 + 拍照/上传功能
  - [ ] 创建 PreviewArea 组件（中间预览区域）
  - [ ] 实现图片预览（保持宽高比、缩放适配）
  - [ ] 实现拍照功能（摄像头 + 实时视频流）
  - [ ] 实现上传功能（文件选择 + Base64 转换）
  - [ ] 实现加载状态和错误处理
  - [ ] 实现占位提示和空状态
- [ ] Phase 3: 识别结果编辑 + 操作功能
  - [ ] 创建 ResultEditor 组件（右侧结果编辑器）
  - [ ] 实现 OCR 识别触发（手动触发 + 重新识别）
  - [ ] 实现识别结果显示（加载动画 + 错误提示）
  - [ ] 实现识别结果编辑（textarea + 自动保存）
  - [ ] 实现识别结果操作（复制 + 插入编辑器 + 保存为 Block）
  - [ ] 实现历史记录删除（确认对话框 + 清空显示）
  - [ ] 性能优化（虚拟滚动 + 缩略图 + 懒加载）
  - [ ] 可访问性（键盘导航 + ARIA 标签）

### AI 沉浸式模式 🤖 - [详细文档](./spec/features/ai/ai-immersive-mode.md)
- [x] Phase 1: 基础架构
  - [x] 添加 viewMode 状态管理（ai-focus / hybrid）
  - [x] 实现布局切换逻辑
  - [x] 创建 AI 模式容器组件
- [x] Phase 2: AI 模式 UI
  - [x] 问候语组件（大号居中）
  - [x] 大号输入框（初始状态）
  - [x] 模型选择显示
  - [x] 输入框位置动画（居中 → 底部）
- [x] Phase 3: 模式切换增强
  - [x] 写入编辑器触发切换到混合模式
  - [x] 自动创建新文档"AI 对话笔记"
  - [x] AI 内容自动写入新文档
  - [x] 侧边栏默认隐藏
  - [x] 平滑过渡动画（0.4s cubic-bezier）
- [x] Phase 4: 优化和测试
  - [x] 主题适配（default + newsprint）
  - [x] TypeScript 类型检查通过
  - [ ] 响应式适配（iPad/手机）- 待测试
  - [ ] 性能优化 - 待测试
- [x] Phase 5: AI 回复渲染增强 - [详细文档](./spec/features/ai/ai-reply-markdown-rendering.md)
  - [x] Markdown 完整支持（标题/段落/列表/引用/链接）
  - [x] 代码块语法高亮（100+ 语言）
  - [x] 表格渲染支持
  - [x] 一键复制代码
  - [x] 主题适配（default + newsprint）
  - [x] 响应式优化
- [x] Phase 6: 沉浸式界面优化
  - [x] 创建 ChatLayout 组件（全屏布局容器）
  - [x] 创建 ChatHeader 组件（顶部导航栏）
  - [x] 创建 MessageContent 组件（AI 回答内容区）
  - [x] 创建 ChatInput 组件（底部输入框）
  - [x] 创建 AIImmersivePanel 组件（整合所有子组件）
  - [x] 集成到 RightPanel（AI 沉浸模式使用新界面）
  - [x] 添加全屏按钮（混合模式 → AI 沉浸模式）
  - [x] 同步功能按钮到 AI 沉浸模式（退出全屏、新建对话、历史对话、设置）
  - [x] 集成历史对话面板和设置面板
  - [x] 右侧边栏布局（3:1 比例，并排显示）
  - [x] 实现双向模式切换
  - [x] TypeScript 类型检查通过

### iPad 响应式设计 📱 - [详细文档](./spec/features/responsive/ipad-responsive-design.md)
- [x] Phase 1: 基础响应式布局
  - [x] 创建响应式样式文件和视口检测 Hook
  - [x] ActivityBar 响应式适配（平板 56px，手机底部导航栏）
  - [x] Sidebar 浮层模式（点击遮罩层关闭）
  - [x] Editor Area 全宽布局，字号优化
  - [x] Toolbar 触摸友好按钮（40x40px）
  - [x] TabBar 增加标签高度（44px）
  - [x] RightPanel 浮层模式 + 关闭按钮
  - [x] StatusBar 响应式高度调整
  - [x] ResizeHandle 在平板/手机隐藏
  - [x] Newsprint 主题响应式适配
  - [x] iOS Safe Area 支持
- [x] Phase 2: 触摸优化
  - [x] 创建滑动手势检测 Hook（四方向）
  - [x] 创建长按检测 Hook（替代右键菜单）
  - [x] 触摸反馈动画（scale + ripple）
  - [x] 触摸目标尺寸优化（所有按钮 ≥ 44px）
  - [x] Sidebar/RightPanel 滑动手势集成
  - [x] ExplorerView 长按支持
  - [x] 滚动条优化和 iOS 弹性滚动
  - [x] 性能优化（硬件加速）
- [ ] Phase 3: 手势交互增强
  - [ ] 标签页滑动切换
  - [ ] 编辑器捏合缩放
  - [ ] 下拉刷新（同步数据）
- [ ] Phase 4: 主题适配微调
- [ ] Phase 5: 测试优化（iPad Mini/iPad/iPad Pro）

### Supabase 云端集成 🔐
- [x] 用户认证（用户名+密码，无邮箱验证）
- [x] 登录/注册页面
- [x] 数据同步服务（projects/documents/blocks）
- [x] RLS 安全策略
- [x] 用户信息显示和退出
- [x] 本地模式支持（Supabase 可选配置，未配置时优雅降级）
- [x] 数据自动同步（本地操作后自动上传）- [详细文档](./spec/features/storage/auto-sync.md)
- [x] 首次登录从云端拉取数据
- [x] 离线模式支持（断网时使用本地数据）
- [x] Schema v2.0 升级（支持 releases、annotations、style、template 等新字段）- [迁移指南](./guide/SUPABASE_MIGRATION.md)
- [ ] 现有用户数据库迁移（需手动执行迁移脚本）

### 文档管理系统 📁
- [x] 文档可关联到项目（projectId 字段）
- [x] 在项目中创建文档自动关联
- [x] 在今日创建文档保持独立
- [x] 项目维护文档列表（双向关系）
- [x] 项目视图显示文档列表（侧边栏展开/收起）
- [x] 点击文档名称打开编辑
- [x] 文档重命名（双击/点击✏️按钮）
- [x] 文档删除
- [x] 文档在项目间移动

### 多项目工作区 UI 改进 🎨
- [x] 左侧边栏可呼出/收起 - [详细需求](./spec/features/editor/multi-project-workspace.md)
- [x] 项目管理（今日、项目列表、新建项目）
- [x] 多标签页编辑器（每个项目独立标签页）
- [x] 全屏模式（隐藏侧边栏和 AI 面板）
- [x] 可调整布局（编辑器 ↔ AI 面板拖拽分隔条）
- [x] 默认打开"今日"标签页
- [x] 项目数据持久化（IndexedDB）
- [x] 项目重命名和删除
- [x] 快捷键支持（Cmd+T 新建、Cmd+W 关闭、Cmd+B 侧边栏）
- [x] 标签页拖拽重排序
- [x] 标签页右键菜单（关闭/关闭其他/关闭右侧）
- [x] 布局偏好持久化（localStorage）
- [x] 置顶功能（Starred）- [详细文档](./spec/features/editor/starred-items-enhancement.md)
  - [x] 置顶视图组件（StarredView）
  - [x] 全局事件系统（toggleStar）
  - [x] 数据持久化（localStorage）
  - [x] ExplorerView 集成星标按钮
  - [x] 拖拽排序置顶项目
  - [x] 置顶数量限制（最多 10 个）
  - [x] 修复侧边栏闪退问题

### 代码架构重构 🏗️（模块化分层）
- [x] 审查现有代码，诊断架构问题
- [x] 设计 8 层模块化分层方案
- [x] 编写 CLAUDE.md 项目指南
- [x] **步骤 1**: 提取 `types/` 统一类型定义层
- [x] **步骤 2**: 提取 `utils/` 纯工具函数（uuid, markdown, date）
- [x] **步骤 3**: 重构 `storage/` 统一 IndexedDB 初始化
- [x] **步骤 4**: 提取 `services/` 业务逻辑层（AI、Block 捕获、Git）
- [x] **步骤 5**: 拆分 `editor/extensions/` 编辑器扩展
- [x] **步骤 6**: 按功能域重组 `components/`（layout/editor/panel/shared）
- [x] **步骤 7**: 提取 `hooks/`（useAppLayout, useTabs, useBlockSearch）
- [x] **步骤 8**: 精简 `App.tsx` 为布局壳

### 项目架构优化 🔧（已完成）
- [x] 设计新的文档组织结构 - [详细方案](./spec/2026-04-09-project-structure-improvement.md)
- [x] 优化 Hooks 触发时机（改为 agentStop）
- [x] 实现每天一个日志文件（追加模式）
- [x] 创建新的目录结构（logs/YYYY-MM/, spec/features/）
- [x] 更新 3 个 Hooks 配置文件
- [x] 创建架构文档（ARCHITECTURE.md, QUICK_START.md 等）
- [x] 创建 Fix Skill 用于系统化 bug 修复 - [使用指南](./guide/developer/bug-fixing-guide.md)
- [x] 清理旧的分散日志文件
- [x] 移动现有需求文档到功能分类目录

### Phase 3: Block 系统 🚀
- [x] 隐式 Block 系统（段落自动识别）- [详细需求](./spec/features/block-system/block-system-core.md)
- [x] Block 数据模型完善（添加 links 字段）
- [x] 双向链接 `[[]]` 语法
- [x] 块引用 `(())` 语法
- [x] 链接关系自动维护（插入/删除时自动更新）
- [x] AI 回复自动创建隐式 Block
- [x] Block 版本派生系统 - [详细文档](./spec/features/block-system/block-derivative-system.md)
  - [x] 创建派生版本
  - [x] 查看派生树
  - [x] 版本选择器组件
  - [x] 自动检测修改
- [x] Git 集成与自动提交
  - [x] 自动提交功能
  - [x] 手动提交
  - [x] 导出为 Markdown
- [x] Block 捕获功能重写（修复按钮无响应问题）
- [ ] 块空间可视化界面（关系图谱）

## P1 - 重要功能

### 内容/样式/模板三层解耦 🏗️ - [PRD](./spec/PRD/PRD_内容形式模板.md)
- [x] 阶段一：数据层解耦（BlockSource / BlockStyle / BlockTemplate 分离）
  - [x] Block 类型重构（三层独立类型定义）
  - [x] 预置样式主题（编辑/预览/审阅）
  - [x] 预置文档模板（小说/博客/大纲）
  - [x] 导出服务（exportService，多格式输出）
  - [x] 编辑历史追踪（editHistory）
  - [x] 所有 Block 创建路径更新
- [x] 阶段二：多形态渲染（编辑态/预览态/导出 UI 集成）
  - [x] 预览面板组件（切换样式主题）
  - [x] 导出对话框组件（选择模板+格式）
  - [x] 编辑器中 AI 块样式根据主题动态切换（SourceBlock 自定义节点）
- [ ] 阶段三：交互模式重构（对话沉浸 ↔ 分屏协作 ↔ 写作沉浸光谱）
- [ ] AI 浮动工具栏（选中文字后 AI 操作菜单）— [详细需求](./spec/features/editor/inline-ai-toolbar.md)
  - [x] Block 附属层数据模型（annotations: translation/explanation/comment/footnote）
  - [x] blockStore 附属层 CRUD（addAnnotation/getAnnotations/getLatestAnnotation/getAnnotationAt）
  - [x] sendInlineAIRequest（六种模式专用 prompt + AbortSignal）
  - [x] captureSelectionAsBlock（编辑器选中文字捕获）
  - [x] exportService 支持 includeAnnotations 导出附属层
  - [x] BubbleMenu 改为 AI 操作菜单 UI
  - [x] 续写（SourceBlock pending 属性 + 保留/丢弃按钮）
  - [x] 改写（AIReplaceDecoration Plugin）
  - [x] 缩写/扩写/翻译（复用改写/附属层机制）
  - [x] 解释（CommentMark + annotations.explanation）
  - [x] 存为块 UI（调用 captureSelectionAsBlock）
  - [x] 并发控制 Plugin（activeAIOperation）

### AI Session 管理 💬
- [x] Session 数据模型（id, title, date, messages, systemPrompt）
- [x] IndexedDB `sessions` store
- [x] AI 回复完成后自动保存/更新当前 Session
- [x] 对话标签页顶部 `+` 按钮新建 Session（保存旧的，清空当前）
- [x] Session 历史列表（按日期分组，显示标题和时间）
- [x] 点击历史 Session 恢复对话
- [x] Session 导出为 JSON 文件
- [x] Session 标题自动取第一条用户消息前 20 字

### Phase 4: 本地存储
- [ ] 文件系统读写 - [详细需求](./spec/features/storage/local-storage.md)
- [ ] Session 管理与状态恢复

## P2 - 增强功能

### Block 增强
- [x] 隐式/显式 Block 区分（AI 自动创建为隐式，捕获后变显式）
- [x] Block 空间只显示显式 Block
- [x] Block 版本化引用系统 — [详细需求](./spec/features/block-system/block-versioned-references.md)
  - [x] usages 使用追踪（Block 被哪些文档引用）
  - [x] 编辑器内派生触发（修改 SourceBlock 后提示保存为新版本）
  - [x] 版本选择器增强（Block 详情面板 + 版本列表 + 插入/派生操作）
  - [x] 编辑器内 SourceBlock 操作栏（hover 显示：发布新版本 + 查看版本）
  - [ ] `(())` 块引用触发版本选择器
- [ ] Block 编辑和更新
- [ ] Block 删除和归档
- [ ] Block 导出（Markdown/JSON）
- [ ] Block 批量操作

### 编辑器增强
- [x] AI 回复拖拽到编辑器（插入到光标位置）
- [x] 编辑器 toolbar 视觉重构（参考 minimal-tiptap 风格，用 CSS 变量实现）
- [ ] 更多 Markdown 语法支持（代码块、表格、引用）
- [ ] 快捷键系统
- [ ] 主题切换（暗色模式）

### 性能优化
- [ ] 大文件加载优化
- [ ] 虚拟滚动
- [ ] 懒加载

## 已完成 ✓

### Phase 2.5: Block 捕获与上下文传递
- [x] 选中文字发送给 AI（快捷键 Cmd/Ctrl + Shift + A）
- [x] AI 回复捕获为 Block
- [x] Block 空间基础 UI（右侧面板标签页）
- [x] IndexedDB 存储实现
- [x] Block 搜索和标签过滤
- [x] Block 捕获对话框

### Phase 2: AI 对话集成
- [x] 接入 xiaomi mimo API
- [x] 实现对话界面
- [x] AI 输出直接写入编辑器
- [x] 流式响应支持
- [x] AI 回复内容分离（回复 + 编辑器内容）
- [x] 系统提示词自定义设置
- [x] 独立滚动区域修复

### Phase 1: 基础编辑器
- [x] 项目结构搭建 - [完成记录](./logs/2026-04-09-phase1-completed.md)
- [x] 三栏布局实现
- [x] TipTap 编辑器集成
- [x] 基础 Markdown 支持
- [x] Activity Bar 组件
- [x] 右侧面板占位

---

**更新时间**: 2026-04-15 20:30  
**当前阶段**: OCR 插件系统 Phase 1-3 完成，OCR 增强 UI 需求文档已创建  
**下次评审**: OCR 增强 UI 需求审核 / 设计文档创建
