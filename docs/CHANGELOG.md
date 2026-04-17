# BlockOS 更新日志

## [v1.31.0] - 2026-04-16 🎨 ExplorerView 组件 Shadcn UI 重构完成

**重要里程碑**：完成 ExplorerView 组件的 Shadcn UI 重构，所有对话框和菜单使用 Shadcn UI 组件，代码更加规范和易于维护。

### ExplorerView 组件重构
- **Button 组件**：替代所有原生 button 元素
  - 使用 `variant="ghost"` 和 `size="icon"` 实现图标按钮
  - 使用 `variant="outline"` 实现次要按钮
  - 使用 `cn()` 工具函数动态组合类名

- **Dialog 组件**：替代自定义对话框
  - 新建项目对话框使用 Dialog + DialogContent + DialogHeader + DialogFooter
  - 移动文档对话框使用相同结构
  - 使用 `open` 和 `onOpenChange` 控制显示状态

- **DropdownMenu 组件**：替代自定义文档操作菜单
  - 使用 DropdownMenuTrigger + DropdownMenuContent + DropdownMenuItem
  - 使用 DropdownMenuSeparator 分隔危险操作
  - 使用 `className="text-destructive"` 标记删除操作

- **Input 组件**：替代原生 input 元素
  - 用于项目/文档重命名
  - 用于新建项目表单

- **Textarea 组件**：替代原生 textarea 元素
  - 用于项目描述输入

- **ScrollArea 组件**：优化滚动体验
  - 包裹项目列表
  - 包裹移动文档对话框中的项目选择列表

### 技术亮点
- ✅ 所有 Shadcn UI 组件均从 `../ui/` 导入
- ✅ 使用 `cn()` 工具函数（来自 `../../lib/utils`）动态组合类名
- ✅ 保持所有现有功能：项目管理、文档管理、置顶、重命名、删除、移动等
- ✅ TypeScript 类型安全，无类型错误
- ✅ 使用 Tailwind CSS 语义化颜色变量
- ✅ 使用 `group` 和 `group-hover:` 实现悬停效果

---

## [v1.30.0] - 2026-04-16 🎨 Editor 组件拆分与 Shadcn UI 重构完成

**重要里程碑**：完成 Editor 和 Sidebar 组件的 Shadcn UI 重构，组件结构更清晰，代码可维护性大幅提升。

### Editor 组件拆分（4个独立组件）
- **EditorBreadcrumb** - 面包屑导航工具栏
  - 文档路径导航（工作空间 > 项目 > 文档）
  - 操作按钮（收藏、评论、分享、更多）
  - 最后编辑时间显示
  - 响应式布局（移动端优化）

- **EditorToolbar** - 顶部 Markdown 工具栏
  - 第一行：撤销/重做、清除格式、标题、文本格式、列表
  - 第二行：引用、分隔线、代码块、快捷键提示
  - 使用 lucide-react 图标（Undo2、Redo2、Bold、Italic 等）
  - 激活状态视觉反馈（紫色高亮）

- **EditorContentArea** - 编辑渲染区域
  - 页面图标和标题
  - 标签显示和管理
  - 所见即所得 Markdown 渲染（参考 MarkdownRenderer）
  - 拖拽处理（AI 内容、Block 内容）

- **EditorBubbleMenu** - AI 浮动工具栏（已完成）
  - Markdown 格式工具
  - AI 操作（续写、改写、缩写、扩写、翻译、解释）
  - 自定义指令输入

### Sidebar 组件重构
- 使用 Shadcn UI Button 组件（移动端关闭按钮）
- 使用 Shadcn UI ScrollArea 组件（内容滚动优化）
- 动画优化（遮罩层淡入、侧边栏滑入）
- 响应式优化（移动端遮罩层、关闭按钮）

### 技术亮点
- ✅ 组件职责单一，易于维护和测试
- ✅ 使用 Shadcn UI 组件替代原生 HTML 元素
- ✅ 使用 lucide-react 图标库
- ✅ 使用 Tailwind CSS 语义化颜色变量
- ✅ 使用 `cn()` 工具函数动态组合类名
- ✅ 完整的 TypeScript 类型定义

---

## [v1.29.0] - 2026-04-16 ✨ 编辑器所见即所得 Markdown 渲染完成

**重要里程碑**：编辑器区域实现真正的所见即所得 Markdown 渲染，与 AI 对话区域的渲染效果完全一致。

- **新增 TipTap 扩展**（10个）：
  - CodeBlockLowlight - 代码块语法高亮（使用 lowlight）
  - Table, TableRow, TableCell, TableHeader - 表格支持（可调整大小）
  - TaskList, TaskItem - 任务列表（支持嵌套）
  - Typography - 排版增强（智能引号、破折号）
  - Placeholder - 占位符提示

- **所见即所得样式**（参考 MarkdownRenderer）：
  - ✅ 标题（H1-H6）- 带边框、间距、字号
  - ✅ 段落 - 行高、间距
  - ✅ 引用块 - 紫色左边框、浅紫背景
  - ✅ 列表（有序/无序）- 缩进、间距
  - ✅ 行内代码 - 红色文字、灰色背景、边框
  - ✅ 代码块 - 语法高亮、边框、圆角
  - ✅ 表格 - 边框、悬停效果、表头样式
  - ✅ 任务列表 - 复选框、删除线
  - ✅ 链接 - 紫色、悬停下划线
  - ✅ 分隔线 - 双线边框
  - ✅ 强调（加粗、斜体、删除线）

- **工具栏增强**：
  - ✅ 添加表格插入按钮（插入 3x3 表格）
  - ✅ 添加任务列表按钮
  - ✅ 保留原有的所有格式按钮

- **技术实现**：
  - 创建 `editorExtensions.ts` 配置文件（约 80 行）
  - 创建 `editor-wysiwyg.css` 样式文件（约 500 行）
  - 更新 Editor 组件使用新扩展和样式
  - 简化 EditorContentArea 样式类
  - 创建完整的测试指南文档

- **用户体验提升**：
  - 🎉 编辑器实现真正的所见即所得 Markdown 渲染
  - 🎉 与 AI 对话区域的渲染效果完全一致
  - 🎉 支持代码块语法高亮、表格、任务列表等高级功能
  - 🎉 写作体验大幅提升，所见即所得

---

## [v1.28.0] - 2026-04-16 🎨 Phase 6 右侧边栏 Shadcn UI 优化（75% 完成）

**重要里程碑**：完成 6/8 组件的 Shadcn UI 优化，代码质量和用户体验大幅提升。

- **Phase 6 进度**（6/8 完成，75%）：
  - ✅ BlockSpacePanel（20:35）- Bento Grid 卡片布局 + 搜索 + 标签过滤
  - ✅ PreviewPanel（21:00）- 模式选择 + 模板/格式下拉框 + 导出
  - ✅ BlockDetailPanel（21:25）- 版本历史 + 引用记录 + Popover 悬停显示
  - ✅ BlockDerivativeSelector（21:40）- 模态框 + 源 Block/派生版本选择
  - ✅ DocumentBlocksPanel（21:45）- Block 结构树 + 统计信息
  - ✅ SessionHistoryPanel（21:45）- 按日期分组 + DropdownMenu 右键菜单

- **使用的 Shadcn UI 组件**（12个）：
  - Button、Input、Badge、Card、ScrollArea、Popover
  - Select、Textarea、DropdownMenu、Dialog、Tabs、Toast

- **技术成果**：
  - 移除所有自定义 CSS 类（`.block-*__*`、`.session-*__*`）
  - 使用 lucide-react 图标替代 emoji
  - 统一的设计系统（accent-green 主题色）
  - 完整的可访问性支持（ARIA 标签、键盘导航）
  - 代码更简洁、更易维护

- **用户体验提升**：
  - BlockDetailPanel：当前内容可滚动查看完整，版本卡片悬停显示完整内容
  - BlockDerivativeSelector：增大边距到 24px，滚动区域支持滚动到底部
  - SessionHistoryPanel：DropdownMenu 替代右键菜单，交互更流畅

- **剩余组件**（2/8）：
  - ⏸️ SettingsPanel（设置面板）
  - ⏸️ RightPanel 主容器（标签页切换）

---

## [v1.27.0] - 2026-04-16 🎨 PreviewPanel V0 像素级重构完成

**重要里程碑**：完成 PreviewPanel 组件的 V0 设计像素级还原，安装 Badge 和 ScrollArea 组件，右侧边栏 UI 统一性进一步提升。

- **PreviewPanel V0 重构**：
  - ✅ 模式选择：预览/审阅按钮（Eye 和 FileCheck 图标）
  - ✅ 模板选择：Shadcn Select 下拉框（小说/博客/大纲）
  - ✅ 格式选择：带图标下拉框（PDF/Markdown/纯文本/Word/HTML）+ 导出按钮
  - ✅ 预览区域：顶部信息栏（模式 · 模板 + 格式 Badge）+ ScrollArea
  - ✅ V0 主题色应用：accent-green (#35AB67)
  - ✅ 保留所有功能：预览生成、导出文件、定期刷新

- **新增 Shadcn UI 组件**（2个）：
  - Badge 组件：4 种变体（default/secondary/destructive/outline）
  - ScrollArea 组件：自定义滚动条样式

- **技术成果**：
  - 完全使用 Tailwind CSS 工具类
  - lucide-react 图标（Eye/FileCheck/FileText/FileCode/Download）
  - TypeScript 类型检查通过（0 错误）
  - 像素级还原 V0 设计

---

## [v1.26.0] - 2026-04-16 🎉 右侧边栏重构 Phase 5 全部完成

**重大里程碑**：Phase 5 右侧边栏重构全部 5 个阶段完成！建立了完整的设计系统和公共样式模式，达到生产级质量标准。

- **Phase 5 全部完成**（总计 3.75 小时）：
  - ✅ 第一阶段（30分钟）：设计变量提取 - 20+ 个设计变量
  - ✅ 第二阶段（45分钟）：公共组件模式抽取 - 8 大类公共样式模式
  - ✅ 第三阶段（60分钟）：组件命名清洗与结构优化 - 4 个组件重构
  - ✅ 第四阶段（60分钟）：生产级功能增强 - 动画、响应式、键盘导航、可访问性
  - ✅ 第五阶段（30分钟）：集成测试与文档 - 完整测试清单和使用指南

- **核心成果**：
  - 🎨 完整的设计系统：20+ 个设计变量（颜色、间距、圆角、阴影）
  - 📦 8 大类公共样式模式：卡片、标签、按钮、输入框、空状态、加载状态、分隔符、滚动区域
  - ✨ 流畅的动画系统：6 种动画效果（卡片悬停、高亮脉冲、空状态浮动、按钮反馈、加载动画）
  - 📱 完整的响应式布局：移动端/平板/桌面完整适配
  - ⌨️ 完整的键盘导航：Tab/Enter/Space/Escape 全部支持
  - ♿ WCAG 2.1 AA 级可访问性：ARIA 标签、role 属性、焦点管理
  - 🧹 减少 30% 重复代码：blocks.css 减少约 200 行
  - 📚 完整的测试清单和使用文档

- **文件统计**：
  - 新增：`common-patterns.css`（~500 行）
  - 更新：`design-tokens.css` + 4 个组件 + `blocks.css`
  - 净增加：约 450 行代码（删除 200 行，新增 650 行）

- **技术亮点**：
  - CSS 变量驱动，主题自动适配（Default + Newsprint）
  - GPU 加速动画，性能优化（transform + opacity）
  - 渐进增强，基础功能不依赖动画
  - 焦点管理，模态框焦点陷阱和自动聚焦
  - 触摸友好，所有按钮最小 44px（WCAG 2.1 标准）

---

## [v1.25.0] - 2026-04-16 ✨ 右侧边栏重构 Phase 5 第四阶段完成：生产级功能增强

**重要里程碑**：完成右侧边栏重构第四阶段，4 个 Block 组件达到生产级质量标准，完整的可访问性支持和流畅的交互体验。

- **Phase 5 第四阶段完成**（60分钟）：
  - ✅ 动画和过渡效果（卡片悬停、高亮脉冲、空状态浮动、按钮反馈、加载动画）
  - ✅ 响应式设计优化（移动端/平板/桌面，触摸友好按钮 44px）
  - ✅ 键盘导航支持（Enter/Space/Escape/Tab，焦点管理）
  - ✅ 可访问性改进（ARIA 标签、role 属性、焦点陷阱、WCAG 2.1 AA 级）
  - ✅ 加载状态样式（spinner 旋转器、skeleton 骨架屏）
  - ✅ TypeScript 类型检查通过（0 错误）

- **技术亮点**：
  - 🎯 流畅动画：使用 GPU 加速的 transform 属性，0.2-0.6s 过渡时间
  - ⌨️ 完整键盘导航：所有交互元素支持 Tab/Enter/Space/Escape 键
  - ♿ WCAG 2.1 AA 级可访问性：完整的 ARIA 标签和语义化 HTML
  - 📱 响应式设计：移动端触摸目标 44px，平板和桌面优化布局
  - 🎨 主题一致性：Default 和 Newsprint 主题完整适配

- **Phase 5 进度**：
  - ✅ 第一阶段（30分钟）：设计变量提取 - 完成
  - ✅ 第二阶段（45分钟）：公共组件模式抽取 - 完成
  - ✅ 第三阶段（60分钟）：组件命名清洗与结构优化 - 完成
  - ✅ 第四阶段（60分钟）：生产级功能增强 - 完成
  - ⏸️ 第五阶段（30分钟）：集成测试与文档 - 待开始

---

## [v1.24.0] - 2026-04-16 🎨 右侧边栏重构 Phase 5 第三阶段完成：组件命名清洗与结构优化

**重要里程碑**：完成右侧边栏重构第三阶段，4 个 Block 组件完全重构，应用公共样式模式，代码可维护性显著提升。

- **Phase 5 第三阶段完成**（60分钟）：
  - ✅ 重构 4 个 Block 相关组件（DocumentBlocksPanel、BlockSpacePanel、BlockDetailPanel、BlockDerivativeSelector）
  - ✅ 应用公共样式模式（`.card-interactive`、`.badge-tag`、`.btn-primary`、`.empty-state`、`.scroll-area` 等）
  - ✅ 清理 blocks.css，移除约 200 行冗余样式（减少 30%）
  - ✅ 统一使用语义化类名，提高代码可读性
  - ✅ TypeScript 类型检查通过（0 错误）

- **技术亮点**：
  - 🎯 公共样式复用：所有组件统一使用 common-patterns.css 中的公共类
  - 📝 语义化命名：使用 `.card-interactive`、`.badge-tag`、`.btn-primary` 等语义化类名
  - 🧹 减少重复代码：移除约 200 行冗余 CSS，blocks.css 文件大小减少 30%
  - ✅ 保持功能完整：所有组件功能和交互逻辑保持不变

- **Phase 5 进度**：
  - ✅ 第一阶段（30分钟）：设计变量提取 - 完成
  - ✅ 第二阶段（45分钟）：公共组件模式抽取 - 完成
  - ✅ 第三阶段（60分钟）：组件命名清洗与结构优化 - 完成
  - ⏸️ 第四阶段（60分钟）：生产级功能增强 - 待开始
  - ⏸️ 第五阶段（30分钟）：集成测试与文档 - 待开始

---

## [v1.23.0] - 2026-04-16 🎉 Phase 5 代码重组全部完成：项目结构达到最佳实践

**重大里程碑**：Phase 5 代码重组和架构优化全部完成（3 步），项目结构达到 React + TypeScript 最佳实践，为长期维护和扩展奠定坚实基础。

- **Phase 5 全部完成**（3/3 步骤）：
  - ✅ **Step 1**：高优先级改进（合并重复文件、统一样式管理、添加 constants 目录）
  - ✅ **Step 2**：中优先级改进（引入 Features 架构、完善类型定义、优化 Service 层）
  - ✅ **Step 3**：低优先级改进（添加 Contexts 目录、完善 Plugin 系统、添加测试目录）

- **最终目录结构**：
  ```
  src/
  ├── features/          # 功能模块（ai/editor/auth/blocks）
  ├── types/             # 类型分类（models/api/common）
  ├── services/          # 服务分层（integration/core）
  ├── contexts/          # 全局状态管理
  ├── plugins/           # 插件系统（core/built-in）
  ├── __tests__/         # 测试目录（unit/integration/e2e）
  ├── constants/         # 常量定义
  ├── styles/            # 样式管理
  └── ...
  ```

- **技术成果**：
  - 🎯 引入 Features 架构：按功能域组织代码，提高内聚性
  - 📦 类型定义分类：按用途分类，易于查找和维护
  - 🔧 Service 层分层：按职责分类，清晰的架构层次
  - 🧪 测试目录完整：为未来自动化测试做准备
  - 🔌 Plugin 系统规范化：core/built-in 两层结构
  - ✅ TypeScript 类型检查通过（0 错误、0 警告）
  - ✅ 所有功能正常运行

- **文件变更统计**：
  - Step 1: 43 个文件变更
  - Step 2: 50+ 个文件变更（29 个文件移动到 features）
  - Step 3: 20+ 个文件变更（Plugin 系统重组 + 测试目录）

---

## [v1.22.0] - 2026-04-16 🏗️ Phase 5 代码重组启动：第 1 步完成（高优先级改进）

**重要里程碑**：启动 Phase 5 代码重组计划，完成第 1 步高优先级改进，项目结构更加清晰规范。

- **Phase 5 第 1 步完成**（3/3 任务）：
  1. **合并重复文件**：
     - 删除 `useToast.ts` 和 `Toast.tsx` 重复文件
     - 统一使用 shadcn/ui toast 系统
     - 更新所有相关引用
  2. **统一样式管理**：
     - 创建 `src/styles/` 目录结构（global/components/themes）
     - 移动 15 个组件 CSS 文件到 `src/styles/components/`
     - 将 design tokens 移到 `src/styles/global/design-tokens.css`
     - 更新 13 个组件中的 CSS 导入路径
  3. **添加 Constants 目录**：
     - 创建 `src/constants/` 目录（ui/storage/api/editor）
     - 提取魔法值为命名常量（数据库名、UI 尺寸、localStorage 键名等）
     - 更新代码使用常量引用
- **技术成果**：
  - ✅ 43 个文件变更，净增加 920 行代码
  - ✅ TypeScript 类型检查通过（0 错误、0 警告）
  - ✅ 使用 smartRelocate 自动更新 import 路径
  - ✅ 项目保持可运行状态
- **Spec 文档**：
  - 创建完整的需求文档（12 个详细需求）
  - 创建技术设计文档（3 步执行计划）
  - 定义最终目录结构和验证清单
- **下一步计划**：
  - Phase 5 第 2 步：引入 features 架构、完善类型定义、优化 Service 层（预计 4-6 小时）
  - 或继续 Phase 4 组件迁移（剩余 5 个面板组件）

**当前进度**：
- ✅ Phase 5 第 1 步：完成（3/3 任务）
- ⏸️ Phase 5 第 2 步：待开始
- ⏸️ Phase 5 第 3 步：待开始

---

## [v1.21.0] - 2026-04-16 ✨ BubbleMenu 工具栏增强：两行布局 + 完整 Markdown 格式支持

**重要功能增强**：成功将编辑器 BubbleMenu 工具栏扩展为两行布局，大幅提升用户体验。

- **BubbleMenu 工具栏增强**：
  - **第一行**：Markdown 格式工具
    - 文本类型：正文、H1、H2、H3
    - 文本格式：粗体(B)、斜体(I)、下划线(U)、删除线(S)、行内代码(<>)
    - 列表：无序列表(•)、有序列表(1.)、引用(")
  - **第二行**：AI 编辑操作
    - AI 对话入口：✦ AI
    - AI 操作：续写、改写、缩写、扩写、翻译、解释
    - Block 操作：捕获
- **技术实现**：
  - ✅ 完全迁移到 Tailwind CSS
  - ✅ 安装并集成 `@tiptap/extension-underline` 扩展
  - ✅ 使用 `cn()` 工具函数动态组合类名
  - ✅ 移除旧的 CSS 样式（.bubble-menu, .bubble-menu--ai）
  - ✅ 激活状态紫色高亮，悬停灰色背景
- **用户体验提升**：
  - 🎉 一次选中即可访问所有格式化和 AI 功能
  - 🎉 功能分组清晰，易于查找和使用
  - 🎉 视觉反馈明确，操作体验流畅
  - 🎉 参考 Notion 风格的浮动工具栏设计
- **验证通过**：
  - ✅ TypeScript 类型检查通过（0 错误）
  - ✅ 所有按钮功能正常
  - ✅ 激活状态正确显示
  - ✅ 无破坏性变更

**当前进度**：
- ✅ Phase 4: 3/8 完成（37.5%）+ BubbleMenu 增强 ✅
- ✅ 整体 CSS 迁移: 15/28 完成（54%）
- ✅ BubbleMenu 工具栏: 完全迁移并增强

**下一步**：
1. 安装 Badge, ScrollArea, Separator 组件
2. 迁移剩余 5 个右侧面板组件

---

## [v1.20.0] - 2026-04-16 🎨 Phase 4 持续推进：PreviewPanel 组件迁移完成

**重要进展**：成功完成 PreviewPanel 组件的 Tailwind CSS 迁移，Phase 4 进度达到 37.5%。

- **已完成迁移**（3/8）：
  1. **TabBar**（标签页栏）- ✅ 完成
  2. **RightPanel**（右侧面板容器）- ✅ 完成
  3. **PreviewPanel**（预览面板）- ✅ 完成
     - ✅ 删除 PreviewPanel.css 文件
     - ✅ 样式主题选择（编辑/预览/审阅）
     - ✅ 导出模板选择（小说/博客/大纲）
     - ✅ 配置摘要显示
     - ✅ 预览区域（支持 HTML 和纯文本）
     - ✅ 底部操作栏（复制/导出）
     - ✅ 使用 Shadcn Button 组件
     - ✅ 使用 Tailwind 任意值选择器（[&_h1]、[&_p] 等）
- **技术亮点**：
  - 使用 Tailwind 任意值选择器为 HTML 预览添加样式
  - 使用 `cn()` 工具函数动态切换主题样式
  - 保留所有功能：主题切换、模板选择、预览、导出
  - 响应式设计保持不变
- **验证通过**：
  - ✅ TypeScript 类型检查通过（0 错误）
  - ✅ 所有功能正常工作

**当前进度**：
- ✅ Phase 4: 3/8 完成（37.5%）
- ✅ 整体 CSS 迁移: 15/28 完成（54%）🎉

**下一步**：
1. 安装 Badge, ScrollArea, Separator 组件（10 分钟）
2. 迁移 BlockSpacePanel（30 分钟）
3. 迁移 DocumentBlocksPanel（25 分钟）
4. 迁移 SessionHistoryPanel（25 分钟）
5. 迁移 BlockDetailPanel（25 分钟）
6. 迁移 BlockDerivativeSelector（20 分钟）

---

## [v1.19.0] - 2026-04-16 🎨 Phase 4 重大进展：RightPanel 组件迁移完成

**重要里程碑**：成功完成 RightPanel 组件的完整 Tailwind CSS 迁移，这是项目中最复杂的组件之一。

- **已完成迁移**（2/8）：
  1. **TabBar**（标签页栏）- ✅ 完成
  2. **RightPanel**（右侧面板容器）- ✅ 完成
     - ✅ 删除 RightPanel.css 文件（约 1000 行 CSS）
     - ✅ AI 欢迎界面（沉浸式模式初始状态）
     - ✅ 面板头部（标签页切换、操作按钮）
     - ✅ 设置面板（折叠卡片、表单输入、切换开关）
     - ✅ 消息列表（用户消息、AI 消息、编辑器内容预览）
     - ✅ 输入框区域（Textarea + 发送按钮）
     - ✅ Session 标题栏
     - ✅ 使用 Shadcn Button 和 Textarea 组件
     - ✅ 保留所有功能：AI 对话、设置管理、消息操作、拖拽等
- **技术亮点**：
  - 使用 Tailwind 动画类（animate-in, fade-in-0, slide-in-from-top-1）
  - 使用 CSS 自定义 toggle switch（peer 选择器）
  - 使用 `cn()` 工具函数动态组合复杂类名
  - 保留所有交互逻辑和状态管理
  - 响应式设计保持不变
- **验证通过**：
  - ✅ TypeScript 类型检查通过（0 错误）
  - ✅ 所有功能正常工作
  - ✅ 无破坏性变更

**当前进度**：
- ✅ Phase 4: 2/8 完成（25%）
- ✅ 整体 CSS 迁移: 14/28 完成（50%）🎉

**下一步**：
1. 迁移 PreviewPanel（预计 20 分钟）
2. 安装 Badge, ScrollArea, Separator 组件
3. 迁移 BlockSpacePanel, DocumentBlocksPanel, SessionHistoryPanel
4. 迁移 BlockDetailPanel, BlockDerivativeSelector

---

## [v1.18.0] - 2026-04-16 🎨 Phase 4 开始：TabBar 组件迁移完成

**重要里程碑**：开始 Phase 4 中风险组件迁移，成功完成 TabBar 组件的完整 Tailwind CSS 迁移。

- **已完成迁移**（1/8）：
  1. **TabBar**（标签页栏）- 完全迁移到 Tailwind CSS
     - ✅ 删除 TabBar.css 文件
     - ✅ 使用 Shadcn Button 和 DropdownMenu 组件
     - ✅ 保留所有功能：拖拽重排序、右键菜单、脏标记、类型图标
     - ✅ TypeScript 类型检查通过
- **部分迁移**（1/8）：
  2. **RightPanel**（右侧面板容器）- 约 30% 完成
     - ✅ AI 欢迎界面（沉浸式模式初始状态）
     - ✅ 面板头部（标签页切换、操作按钮）
     - ⏸️ 设置面板、消息列表、输入框区域等待迁移
- **技术改进**：
  - 使用 `cn()` 工具函数动态组合 Tailwind 类名
  - 保留所有原有功能和交互逻辑
  - 响应式设计保持不变
- **验证通过**：
  - ✅ TypeScript 类型检查通过（0 错误）
  - ✅ 所有功能正常工作

**当前进度**：
- ✅ TabBar 完成（1/8）
- 🔄 RightPanel 进行中（约 30% 完成）
- ⏸️ 其他 6 个组件待开始（PreviewPanel、BlockSpacePanel、DocumentBlocksPanel、SessionHistoryPanel、BlockDetailPanel、BlockDerivativeSelector）

**下一步**：
1. 继续完成 RightPanel 迁移（剩余 70%）
2. 迁移 PreviewPanel（预计 20 分钟）
3. 安装 Badge, ScrollArea, Separator 组件
4. 迁移 BlockSpacePanel, DocumentBlocksPanel, SessionHistoryPanel

---

## [v1.17.0] - 2026-04-16 🎨 Phase 3 完成：安装 10 个 Shadcn UI 组件

**重要里程碑**：成功安装并配置 Shadcn UI 组件库，为后续中风险组件迁移奠定基础。

- **已安装组件**（10 个）：
  1. **Button**（按钮）- 6 种变体（default/secondary/destructive/outline/ghost/link），3 种尺寸
  2. **Card**（卡片）- 包含 Header、Title、Description、Content、Footer 子组件
  3. **Dialog**（对话框）- 模态对话框，包含 Trigger、Content、Header、Footer
  4. **Tabs**（标签页）- 标签页切换，包含 List、Trigger、Content
  5. **Select**（选择器）- 下拉选择框，包含 Trigger、Value、Content、Item
  6. **Dropdown Menu**（下拉菜单）- 右键菜单，包含 Trigger、Content、Item、Label、Separator
  7. **Input**（输入框）- 单行文本输入，支持各种 type
  8. **Textarea**（文本域）- 多行文本输入
  9. **Popover**（弹出层）- 轻量级弹出层，包含 Trigger、Content
  10. **Toast**（通知）- 全局通知提示，包含 Toaster 和 useToast Hook
- **问题修复**：
  - 修复 components.json UTF-8 BOM 问题（导致 Shadcn CLI 无法解析）
  - 修复 toaster.tsx 导入路径错误（`@/components/hooks/use-toast` → `@/hooks/use-toast`）
- **依赖安装**：
  - class-variance-authority@0.7.1 - CVA 样式变体管理
  - clsx@2.1.1 - 类名合并工具
  - tailwind-merge@3.5.0 - Tailwind 类名冲突解决
  - lucide-react@1.8.0 - 图标库
  - @radix-ui/* - Radix UI 无头组件（自动安装）
- **测试页面**：
  - 创建完整的组件测试页面（test.html）
  - 测试所有 10 个组件的基本功能、变体、尺寸、状态
  - 访问地址：`http://localhost:5173/test.html`
- **文档完善**：
  - 创建安装文档（docs/guide/shadcn-components-installed.md）
  - 包含每个组件的用途、示例代码、API 说明
  - 提供常见问题解答和参考资源
- **验证通过**：
  - ✅ TypeScript 类型检查通过（0 错误）
  - ✅ 所有组件文件完整
  - ✅ 依赖安装完整
  - ✅ 路径别名配置正确

**技术亮点**：
1. 源代码级别的组件（可直接修改）
2. 完整的可访问性支持（ARIA 标签、键盘导航）
3. 基于 Radix UI 无头组件（高质量、经过充分测试）
4. 使用 CVA 管理样式变体（类型安全、易扩展）
5. 完全兼容 Tailwind CSS（无冲突）

**下一步**：Phase 4 - 使用 Shadcn UI 组件重构中风险组件（TabBar、RightPanel、7 个右侧面板子组件），预计 3-4 小时。

---

## [v1.16.4] - 2026-04-15 🎨 完成所有低风险组件 Tailwind 样式重构

**重要里程碑**：完成 6 个低风险组件的 Tailwind CSS 迁移，累计完成 12 个组件（43%）。

- **今日完成组件**（6 个）：
  - **ActivityBar**（活动栏）：左侧图标栏，使用 flex、h-12、w-12，激活状态紫色左边框
  - **StatusBar**（状态栏）：底部状态显示，三栏布局（同步/保存/统计），状态颜色标记
  - **ResizeHandle**（调整大小手柄）：拖拽调整宽度，group-hover 悬停效果，双击恢复默认
  - **Toast**（提示消息）：固定定位，三种类型（success/error/info），淡入淡出动画
  - **MarkdownRenderer**（Markdown 渲染器）：最复杂组件，20+ 子元素样式，代码高亮、表格、引用
  - **SyncStatusIndicator**（同步状态指示器）：紧凑布局，不同状态不同背景色，旋转动画
- **技术实现**：
  - 移除所有 CSS 文件导入，完全使用 Tailwind 工具类
  - 删除 6 个 CSS 文件，代码更简洁
  - 保持功能逻辑不变，只更新样式
  - TypeScript 类型检查通过 ✅
- **Tailwind 类名规范**：
  - 尺寸：h-6/h-12/h-14、w-12、max-w-[760px]
  - 间距：px-2/px-3/px-4、gap-1/gap-2/gap-3
  - 圆角：rounded-md/rounded-lg/rounded-2xl/rounded-full
  - 颜色：bg-background/bg-muted、text-foreground/text-muted-foreground
  - 状态：hover:bg-muted、disabled:opacity-50
  - 动画：animate-spin（旋转）
- **进度统计**：
  - 总进度：12/28 完成（43%）
  - 今日新增：6 个组件
  - 剩余：16 个组件（8 个中风险 + 8 个低优先级/高风险）

**下一步**：明日开始中风险组件迁移（TabBar、RightPanel、7 个右侧面板子组件），预计 3-4 小时。

---

## [v1.16.3] - 2026-04-15 🎨 AI 沉浸模式 Tailwind 样式重构完成（Phase 2）

**重要里程碑**：完成 AI 沉浸模式从 CSS 到 Tailwind 的完整样式重构，采用 Notion/Roam 风格设计。

- **样式系统升级**：
  - 移除所有组件的 CSS 文件（5 个），完全使用 Tailwind 工具类
  - 更新 Design Tokens（--radius: 0.625rem，添加字体连字优化）
  - 参考 v0.dev 生成的 Notion/Roam 风格设计
- **组件重构**（5 个核心组件）：
  - **ChatHeader**：h-14 顶部导航，按钮 h-8 w-8，激活状态 bg-primary/10
  - **ChatInput**：max-w-[760px] 居中，rounded-2xl 圆角，功能按钮 rounded-full，添加 textarea 自动高度
  - **ChatLayout**：flex flex-col h-screen，内容区 max-w-[760px] mx-auto
  - **MessageContent**：用户消息 bg-muted rounded-2xl，AI 消息 bg-transparent，添加复制和 hover 功能
  - **AIImmersivePanel**：侧边栏 w-80 lg:w-[25%]，遮罩层 bg-black/20
- **交互优化**：
  - Textarea 自动高度调整（最大 200px）
  - 复制按钮（2 秒后恢复）
  - Hover 显示工具栏（opacity-0 → opacity-100）
  - 平滑过渡动画（transition-all duration-200/300）
- **Tailwind 类名规范**：
  - 尺寸：h-7/h-8/h-9/h-14、max-w-[760px]
  - 间距：px-2/px-3/px-4、gap-1/gap-2/gap-3
  - 圆角：rounded-md/rounded-2xl/rounded-full
  - 颜色：bg-background/bg-muted、text-foreground/text-muted-foreground
  - 状态：hover:bg-muted、disabled:opacity-50
- **验证通过**：
  - TypeScript 类型检查通过 ✅
  - 开发服务器正常启动 ✅
  - 功能逻辑保持不变 ✅
  - 代码更简洁（移除 5 个 CSS 文件）✅

**技术亮点**：
1. 完全使用 Tailwind 工具类，无自定义 CSS
2. 借鉴 v0.dev 的 Notion/Roam 风格设计
3. 保持功能逻辑不变，只更新样式
4. 优化交互体验（自动高度、复制、hover）
5. 统一的设计规范和类名约定

**下一步**：
- 手动功能测试（消息发送、工具栏、侧边栏、设置）
- 主题适配测试（Default + Newsprint）
- 响应式测试（桌面/平板/手机）
- Phase 3: 安装常用 Shadcn UI 组件
- Phase 4: 重构其他模块（Sidebar、TabBar、Editor 等）

---

## [v1.16.1] - 2026-04-15 🔧 Tailwind CSS 版本问题修复

**技术修复**：解决 Tailwind CSS 4.x PostCSS 插件兼容性问题。

- **问题诊断**：
  - Tailwind CSS 4.x 架构变更，PostCSS 插件移到独立包
  - 旧配置（`tailwindcss: {}`）不再兼容
  - 开发服务器启动失败，报 PostCSS 插件错误
- **解决方案**：
  - 降级到 Tailwind CSS 3.4.19（Shadcn/UI 官方推荐版本）
  - 保持配置不变，完全兼容
  - 验证通过：类型检查 ✅、开发服务器 ✅
- **技术决策**：
  - 选择稳定性和兼容性优先
  - 遵循 Shadcn/UI 官方推荐
  - 3.x 版本成熟稳定，生态完善，完全满足项目需求

**验证结果**：
- TypeScript 类型检查通过
- 开发服务器成功启动（748ms）
- 无任何错误或警告

---

## [v1.16.0] - 2026-04-15 🎨 Tailwind CSS + Shadcn/UI 安装完成

**重要里程碑**：完成主题样式重塑的第一步，安装并配置 Tailwind CSS 和 Shadcn/UI。

- **Tailwind CSS 安装**：
  - 安装核心依赖（tailwindcss、postcss、autoprefixer）
  - 创建 tailwind.config.js（支持暗色模式、CSS 变量）
  - 创建 postcss.config.js
- **Shadcn/UI 配置**：
  - 安装工具库（class-variance-authority、clsx、tailwind-merge）
  - 创建 components.json 配置文件
  - 创建 src/lib/utils.ts（cn() 工具函数）
  - 创建 src/components/ui/ 目录
- **Design Token 系统**：
  - 创建 src/index.css（完整的 CSS 变量系统，基于 HSL 格式）
  - 定义 20+ CSS 变量（background、foreground、primary、secondary 等）
  - 支持亮色和暗色主题（.dark 类切换）
- **路径别名配置**：
  - 更新 tsconfig.json（添加 @/* 路径别名）
  - 更新 vite.config.ts（添加路径别名解析）
  - 安装 @types/node（path 模块类型定义）
- **验证通过**：
  - TypeScript 类型检查通过（bun run type-check）
  - 开发服务器正常启动（bun run dev）

**核心特性**：
1. CSS 变量系统（HSL 格式，适合主题切换）
2. 暗色模式支持（通过 .dark 类切换）
3. 路径别名（@/components、@/lib/utils）
4. 类型安全（100% TypeScript 类型检查通过）
5. 完全遵循 Shadcn/UI 官方推荐配置

**下一步**：
- 安装具体的 Shadcn UI 组件（Button、Card、Dialog 等）
- 自定义 CSS 变量调整主题
- 使用 Tailwind 工具类重构现有组件

---

## [v1.15.0] - 2026-04-15 🎨 OCR 增强 UI 设计文档完成

**重要里程碑**：完成专业级 OCR 解析工作站的完整设计文档（2180 行）。

- **设计文档分阶段补充**：从 747 行扩展到 **2180 行**（增加 1433 行）
- **PreviewArea Component 设计**：Bounding_Box 渲染核心算法、点击检测、交互功能
- **ResultEditor Component 设计**：多视图切换、模型选择、置信度标记、快捷操作
- **Data Models and Storage 设计**：IndexedDB Schema、PhotoRecordStore、OCR Service 集成
- **Implementation Plan**：5 个阶段详细任务清单和验收标准
- **Testing Strategy**：单元测试、集成测试、性能测试计划

**核心技术亮点**：
1. Canvas 叠加层渲染（高性能 Bounding_Box 可视化）
2. 坐标转换算法（API 坐标 → Canvas 坐标）
3. 双向交互联动（预览区域 ↔ 结果编辑器）
4. IndexedDB 持久化（可靠的本地存储）
5. 模块化组件设计（清晰的职责划分）

---

## [v1.14.0] - 2026-04-15 🎨 OCR 增强 UI 设计文档创建

**重要里程碑**：完成专业级 OCR 解析工作站的需求审核和设计文档创建。

- **需求文档升级（v1.0 → v2.0）**：
  - 从基础款 OCR 插件升级为专业级 OCR 解析工作站
  - 文档规模从 ~600 行扩展到 1041 行
  - 新增 10 个专业功能需求（Requirement 15-24）
  - 新增 5 个 Correctness Properties（Property 11-15）
  - 更新分阶段实施计划（3 步 → 5 步）
- **核心专业功能**：
  - **识别区域可视化（Bounding_Box）** —— 最高优先级功能
    - 在图片上渲染蓝色高亮边界框
    - 点击定位到对应文本
    - 悬停显示置信度
    - 显示/隐藏切换
  - **多模型切换** —— 支持在不同 OCR 模型之间切换对比
  - **多视图** —— 文档解析视图 + JSON 视图
  - **预览工具栏** —— 页码、缩放、旋转、重置、适应
  - **置信度标记** —— 颜色编码（绿/黄/红）、低置信度过滤
- **左栏增强**：
  - 分类管理（最近上传/我的收藏）
  - 搜索功能（按文件名）
  - 顶部操作区（+ 新解析、系统设置）
  - 文件名显示（而非仅时间戳）
- **中栏增强**：
  - 元数据显示（文件名、文件大小、上传时间）
  - Bounding_Box 渲染（Canvas 叠加层）
  - 预览控制工具栏（缩放 25%-400%、旋转、页码）
- **右栏增强**：
  - 模型选择下拉菜单
  - 视图切换（文档解析/JSON）
  - 顶部快捷操作（复制、刷新、保存、下载）
  - 置信度显示和标记
- **设计文档创建**：
  - 高层架构设计（Mermaid 图：组件层次、数据流）
  - 状态管理策略（React Context + useState）
  - HistoryList 组件完整实现（接口定义、子组件、样式）
  - 数据模型定义（Photo_Record、BoundingBox、OCR_Model）
- **分阶段实施计划**（5 个 Phase，共 8 周）：
  - Phase 1: 基础三栏布局 + 历史记录增强（2 周）
  - Phase 2: 图片预览 + 预览工具栏（1 周）
  - Phase 3: 识别区域可视化（Bounding_Box）（2 周，核心）
  - Phase 4: 结果编辑 + 多视图 + 模型切换（2 周）
  - Phase 5: 快捷操作 + 导出 + 性能优化（1 周）

**技术难点**：
- Bounding_Box 渲染（Canvas 叠加层、坐标转换、缩放/旋转同步）
- 多模型切换（API 集成、配置管理）
- 性能优化（虚拟滚动、Canvas 离屏渲染、防抖）

**下一步**：等待设计文档审核，审核通过后进入任务分解和实施阶段

## [v1.13.0] - 2026-04-15 📋 OCR 增强 UI 需求文档创建

**新功能规划**：

- **OCR 插件 UI/UX 增强需求文档**：
  - 创建完整的需求文档（`.kiro/specs/ocr-enhanced-ui/requirements.md`）
  - 设计三栏布局界面（左侧历史记录 + 中间预览 + 右侧结果编辑）
  - 定义 14 个功能需求，包含详细的验收标准
  - 定义 6 个非功能需求（性能、可用性、可维护性、兼容性、安全性、可扩展性）
  - 定义 10 个正确性属性用于 Property-Based Testing
  - 完整的约束、假设和风险分析
  - 规划分三步实施（布局 → 预览 → 编辑）
- **核心功能设计**：
  - 照片历史记录持久化（IndexedDB，最多 100 条）
  - 响应式布局（768px 断点自动切换单栏/三栏）
  - 识别结果编辑（支持复制、插入编辑器、保存为 Block）
  - 性能优化（虚拟滚动、缩略图、懒加载）
  - 完整的可访问性支持（键盘导航、ARIA 标签）
- **质量保证**：
  - 所有需求符合 EARS 模式和 INCOSE 质量规则
  - 可测试、无模糊术语
  - 包含完整的 Property-Based Testing 策略

**技术约束**：
- 完全兼容现有插件系统架构，复用 Plugin_API 和 PluginRegistry
- 使用 React 18 + TypeScript 5 + IndexedDB
- 分三步实施（布局 → 预览 → 编辑）

**下一步**：等待需求审核，审核通过后进入设计阶段

## [v1.12.4] - 2026-04-15 🎨 OCR 加载动画 + 手机访问支持

**用户体验优化**：

- **OCR 识别加载动画**：
  - 三环旋转动画（绿色、蓝色、橙色），动态效果流畅
  - 半透明遮罩 + 毛玻璃效果（backdrop-filter: blur）
  - 文字提示："正在识别文字..." + "请稍候，这可能需要几秒钟"
  - 脉冲动画，吸引用户注意力
  - 识别中禁用按钮，防止重复点击
- **手机访问支持**：
  - 配置 Vite 允许局域网访问（host: '0.0.0.0'）
  - 手机可通过局域网 IP 访问开发服务器
  - 创建完整的手机访问指南（mobile-access.md）
  - 包含 HTTPS 配置、防火墙设置、常见问题解答
- **移动端体验优化**：
  - 加载动画在手机上流畅显示
  - 解决手机识别慢时用户焦虑问题
  - 视觉反馈明显，用户体验提升

**技术细节**：
- 使用 CSS transform 实现 GPU 加速动画
- 使用 cubic-bezier 缓动函数，动画更自然
- 使用 backdrop-filter 实现毛玻璃效果
- 性能优化，动画流畅不卡顿

**访问地址**：
- 电脑：`http://localhost:5173`
- 手机：`http://192.168.2.101:5173`（局域网 IP）

## [v1.12.3] - 2026-04-15 🔧 OCR 403 错误分析 + 备用方案

**问题诊断和多方案支持**：

- **403 Forbidden 错误分析**：
  - 原因：PaddleOCR API 服务器拒绝代理请求
  - 可能：Token 验证失败、请求头缺失、IP 限制、代理被检测
- **代理配置优化**：
  - 添加必要的请求头（User-Agent、Origin、Referer、Accept）
  - 添加代理日志（proxyReq、proxyRes、error）方便调试
  - 模拟真实浏览器请求，避免被服务器检测
- **Tesseract.js 备用方案**（`src/plugins/ocr-plugin/ocrService.tesseract.ts`）：
  - 纯前端 OCR 实现，完全免费，无需 API Key
  - 无 CORS 问题，离线可用
  - 支持中文和英文，识别速度 3-10 秒
  - 准确率略低于 PaddleOCR，适合测试和离线场景
- **完整文档体系**：
  - `docs/guide/ocr-403-fix.md` - 403 错误 4 种解决方案
  - `docs/guide/ocr-solutions-comparison.md` - OCR 方案对比和选择指南
  - `docs/guide/ocr-quick-fix.md` - CORS 问题快速修复参考
  - `docs/guide/README.md` - 使用指南索引

**推荐操作**：
1. 重启开发服务器（`bun run dev`）测试优化后的代理
2. 如果仍然 403，切换到 Tesseract.js（`bun add tesseract.js`）
3. 长期方案：注册百度 OCR API（免费额度足够个人使用）

## [v1.12.2] - 2026-04-15 🔧 CORS 问题深度修复 + 配置清理工具

**Bug 修复**：解决 localStorage 旧配置导致的 CORS 问题持续出现。

- **问题根因**：
  - localStorage 中保存了旧的 HTTPS URL 配置
  - 代码只在配置为空时设置默认值，不会覆盖已存在的旧配置
  - 即使重启服务器，localStorage 持久化存储导致旧配置仍然生效
- **代码修复**：
  - 强制更新旧配置：检测到 HTTPS URL 时自动替换为代理路径
  - 添加详细调试日志：插件激活时输出当前配置，API 调用时输出请求 URL 和响应状态
  - 改进配置初始化逻辑：`if (!apiUrl || apiUrl.startsWith('https://'))`
- **配置清理工具**（`scripts/clear-ocr-config.html`）：
  - 可视化界面，一键查看/清理/重置配置
  - 提供详细的使用步骤说明
  - 自动检测旧配置并给出建议
- **故障排查指南**（`docs/guide/ocr-plugin-troubleshooting.md`）：
  - 3 种解决方案（清理工具/手动清理/自动修复）
  - 详细的调试技巧和验证步骤
  - 常见问题 FAQ 和终极解决方案
  - 生产环境部署建议

**用户操作**：刷新页面即可自动修复，或使用 `http://localhost:5173/scripts/clear-ocr-config.html` 手动清理配置。

## [v1.12.1] - 2026-04-15 🔧 OCR 插件 UI 优化 + CORS 问题修复

**Bug 修复和优化**：

- **UI 布局优化**：
  - 修复插件列表中描述文字被截断的问题
  - 插件卡片改为垂直布局，信息和操作按钮分两行显示
  - 描述文字支持自动换行（word-wrap: break-word）
  - 操作按钮右对齐，支持自动换行
- **CORS 跨域问题修复**：
  - 在 `vite.config.ts` 中添加代理配置，将 `/api/ocr/` 请求转发到 PaddleOCR 服务器
  - 更新 OCR 插件默认 API 地址为 `/api/ocr/layout-parsing`（使用代理）
  - 避免浏览器 CORS 策略阻止请求
- **设置面板优化**：
  - 添加 API 地址说明提示
  - 美化表单样式（输入框、按钮、标签）
  - 添加配置说明文字
- **文档更新**：
  - 新增 `docs/guide/ocr-plugin-usage.md` - OCR 插件使用指南
  - 包含 CORS 问题解决方案、配置说明、常见问题
  - 更新测试指南，添加 CORS 问题说明

**重要提示**：修改 `vite.config.ts` 后需要重启开发服务器（`bun run dev`）以应用代理配置。

## [v1.12.0] - 2026-04-15 🔌 OCR 插件系统实施完成（Phase 1-3）

**重要里程碑**：完成通用可插拔插件系统核心实现，OCR 文字识别插件已集成到应用中。

- **Phase 1: 插件系统核心**：
  - ✅ 插件类型定义（src/types/plugin.ts）：PluginMetadata、PluginPermission、IPlugin、PluginStatus、PluginRegistryEntry
  - ✅ 插件配置存储（src/storage/pluginConfigStore.ts）：基于 localStorage 的配置持久化，get/set/remove/getAll/clearAll 方法
  - ✅ 插件 API（src/services/pluginAPI.ts）：编辑器操作、Block 操作、配置存储、通知系统、权限检查机制
  - ✅ 插件注册表（src/services/pluginRegistry.ts）：插件注册、激活、停用、卸载、实例管理、状态追踪
- **Phase 2: OCR 插件实现**：
  - ✅ OCR 服务（ocrService.ts）：PaddleOCR API 调用封装、Base64 图片识别、错误处理
  - ✅ OCR UI 组件（OCRPanel.tsx）：摄像头拍照、图片上传、识别结果展示、插入编辑器/保存为 Block
  - ✅ OCR 插件入口（index.tsx）：OCRPlugin 类实现 IPlugin 接口、生命周期管理、设置面板
  - ✅ OCR 样式（OCRPanel.css）：响应式布局、主题适配（CSS 变量）
- **Phase 3: 集成与测试**：
  - ✅ 更新 ExtensionsView 组件：插件列表展示、插件状态显示、插件操作（打开/设置/卸载）、插件 UI 渲染容器
  - ✅ 在 App.tsx 中初始化插件系统：创建 PluginAPI 实例、设置插件注册表、注册 OCR 插件
  - ✅ TypeScript 类型检查通过（bun run type-check）
- **技术亮点**：
  - 通用插件架构：完全可插拔，支持多种类型插件扩展
  - 权限系统：7 种权限类型，细粒度控制插件访问
  - 类型安全：所有接口使用 TypeScript 严格类型定义
  - 配置持久化：基于 localStorage，插件配置独立存储
  - 生命周期管理：activate/deactivate 钩子，优雅的插件加载/卸载
  - 依赖层级遵守：严格遵循项目架构约束（types → storage → services → components）
- **用户体验**：
  - 用户可以在 ActivityBar 点击"插件"图标查看已安装插件
  - OCR 插件支持摄像头拍照和图片上传两种方式
  - 识别结果可以插入编辑器（作为 SourceBlock）或保存为显式 Block
  - 插件配置（API URL 和 Token）可在设置面板中修改

新增 8 个文件，修改 3 个文件，所有代码通过 TypeScript 类型检查。下一步：Phase 4 文档与优化（插件开发文档、用户使用文档、性能优化、安全审计）。

## [v1.11.0] - 2026-04-15 🔌 OCR 插件系统技术设计

**重要里程碑**：完成通用可插拔插件系统架构设计，OCR 文字识别作为首个示例插件。

- **通用插件架构**：
  - 标准插件接口（IPlugin）定义生命周期（activate/deactivate/render）
  - 插件注册表（PluginRegistry）管理插件状态和实例
  - 插件 API（PluginAPI）提供主应用功能桥接
  - 插件配置存储（PluginConfigStore）基于 localStorage 持久化
- **权限系统**：7 种权限类型（editor:read/write、block:read/write、storage:read/write、network），装饰器模式权限检查
- **OCR 插件设计**：
  - 完整 UI 组件（摄像头拍照、图片上传、识别结果展示）
  - PaddleOCR API 集成（Base64 编码、流式响应）
  - 识别结果可插入编辑器（SourceBlock）或保存为 Block
  - 配置持久化（API URL、Token）
- **ExtensionsView 增强**：插件列表、安装/卸载、打开/设置、状态管理
- **完全可插拔**：插件独立加载和卸载，卸载后自动清理所有资源和配置
- **类型安全**：所有接口使用 TypeScript 严格类型，完整的错误处理机制
- **安全考虑**：权限管理、API Token 保护、HTTPS Only、XSS 防护、CSP 策略
- **实施路径**：4 周计划（插件系统核心 → OCR 插件实现 → 集成测试 → 文档优化）
- **未来扩展**：插件市场、翻译插件、图表生成插件、代码格式化插件、插件 SDK

新增技术设计文档 `.kiro/specs/ocr-plugin-system/design.md`，包含 3 个 Mermaid 架构图、完整的 TypeScript 接口定义、组件实现代码、测试策略。→ [技术设计](../.kiro/specs/ocr-plugin-system/design.md)

## [v1.10.2] - 2026-04-14 🐛 修复 AI 沉浸模式右侧边栏显示问题

**重要 Bug 修复**：修复 AI 沉浸模式下点击历史对话和设置按钮无法显示右侧边栏的问题。

- **问题根因**：
  - `ChatLayout.css` 中设置了 `width: 100vw`，导致左侧对话区强制占据整个视口宽度
  - 右侧边栏被挤出视口范围，虽然状态更新正确但不可见
  - 这是一个典型的 CSS 布局问题：子元素宽度超出父容器
- **修复方案**：
  - 将 `ChatLayout.css` 中的 `width: 100vw` 改为 `width: 100%`
  - 让 ChatLayout 适应父容器宽度，而不是强制占据整个视口
- **布局逻辑**：
  - `ai-immersive-container` (100vw) → `ai-immersive-main` (flex: 3, 75%) → `ChatLayout` (width: 100%)
  - `ai-immersive-sidebar` (flex: 1, 25%) 正常显示
- **验收标准**：
  - ✅ 点击"历史对话"按钮，右侧边栏正常显示会话列表
  - ✅ 点击"设置"按钮，右侧边栏正常显示设置面板
  - ✅ 左侧对话区宽度自动调整（100% → 75%）
  - ✅ 右侧边栏占据 25% 宽度，3:1 比例正确

修复后 AI 沉浸模式的右侧边栏功能完全正常，用户可以正常访问历史对话和设置面板。

## [v1.10.1] - 2026-04-14 🎨 AI 沉浸模式右侧边栏布局

**重要交互改进**：AI 沉浸模式采用左右分栏布局，历史对话和设置以侧边栏形式显示。

- **左右分栏布局**：
  - 左侧 AI 对话区占 75%（flex: 3）
  - 右侧边栏占 25%（flex: 1）
  - 并排显示，不遮挡对话内容
- **右侧边栏功能**：
  - 点击"历史对话"按钮 → 右侧边栏滑入，显示会话列表
  - 点击"设置"按钮 → 右侧边栏滑入，显示设置面板
  - 再次点击按钮 → 右侧边栏滑出，恢复全宽
- **交互优化**：
  - 左侧对话区始终可见，宽度自动调整（100% → 75%）
  - 平滑过渡动画（0.3s ease）
  - 右侧边栏独立滚动，不影响对话区
  - 完整的 Newsprint 主题适配
- **样式增强**：
  - 创建 AIImmersivePanel.css 样式文件
  - 边框分隔（1px solid，Newsprint 主题 2px）
  - 独立的 header 和 body 区域
  - 按钮激活状态（紫色背景）

相比全屏弹窗，侧边栏布局提供更好的空间利用和交互连续性。→ [完整文档](./spec/features/ai/ai-immersive-mode.md)

## [v1.10.0] - 2026-04-14 🎨 AI 沉浸模式界面优化（Phase 6）

**重要更新**：AI 沉浸模式对话界面全面升级，采用全新的组件化设计。

- **新组件架构**：
  - `ChatLayout`：全屏布局容器（100vh，三区域：顶部导航、中间内容、底部输入）
  - `ChatHeader`：顶部导航栏（折叠按钮、标题、副标题、新建对话、分享按钮）
  - `MessageContent`：AI 回答内容区（水平居中，max-width: 760px，支持 Markdown 渲染）
  - `ChatInput`：底部输入框（圆角 16px，功能按钮组，附件按钮，圆形发送按钮）
  - `AIImmersivePanel`：整合所有子组件的沉浸式面板
- **设计亮点**：
  - 内容区水平居中，最大宽度 760px，最佳阅读体验
  - 正文字号 15px，行高 1.7，使用 CSS 变量
  - 行内代码块：背景 `var(--color-bg-code)`，圆角 4px，padding 2px 6px
  - 底部输入框固定在底部，与内容区宽度一致
  - 功能按钮组（DeepThink、Search）pill 形状，有 icon + 文字
  - 发送按钮圆形（36x36px），主色背景，hover 效果
  - 底部说明文字居中显示，小字，颜色 `var(--color-text-muted)`
- **技术约束**：
  - ✅ 未引入任何新的组件库或第三方库
  - ✅ 所有颜色、字号、圆角使用项目已有的 CSS design token
  - ✅ Props 用 TypeScript interface 定义
  - ✅ 组件拆分遵循单一职责原则
  - ✅ TypeScript 类型检查通过

AI 沉浸模式界面优化完成，Phase 6 全部完成。新界面在 AI 沉浸模式且有消息时自动启用。→ [完整文档](./spec/features/ai/ai-immersive-mode.md)

## [v1.9.2] - 2026-04-14 🐛 修复 Block 发布版本和引用记录

**核心功能 Bug 修复**：修复 Block 编辑后发布版本无响应和引用记录一直为 0 的问题。

- **问题 1：发布版本无响应**
  - 编辑区域的 block 编辑后点击"发布版本"按钮，版本数不增加
  - 原因：发布成功后节点的 `releaseVersion` 属性没有被更新
  - 修复：在 `sourceBlock.ts` 中，发布成功后立即更新节点的 `releaseVersion` 和 `sourceLabel` 属性
- **问题 2：引用记录一直为 0**
  - block 空间的引用记录一直显示为 0，即使已经发布了多个版本
  - 原因：使用了错误的条件判断 `if (currentReleaseVersion !== release.version)`，导致首次发布时不记录 usage
  - 修复：移除条件判断，每次发布都调用 `recordBlockUsage` 记录引用
- **关键改进**：
  - 简化逻辑：移除复杂的条件判断，每次发布都记录 usage
  - 立即更新：先更新节点属性，再记录 usage，确保状态一致
  - 触发事件：通过 `blockUpdated` 事件通知其他组件刷新
- **验收标准**：
  - ✅ 编辑 block 后发布，标签立即更新为新版本号
  - ✅ Block 空间版本数正确增加（1 → 2 → 3...）
  - ✅ 引用记录正确统计（不再为 0）
  - ✅ 多次发布版本，版本号连续递增

修复后 Block 版本管理功能完全正常，版本数和引用记录都能正确统计。→ [测试文档](./tests/block-release-usage-test.md)

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
