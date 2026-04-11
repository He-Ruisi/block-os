# BlockOS 待办事项

## P0 - 核心功能（当前优先）

### Supabase 云端集成 🔐
- [x] 用户认证（用户名+密码，无邮箱验证）
- [x] 登录/注册页面
- [x] 数据同步服务（projects/documents/blocks）
- [x] RLS 安全策略
- [x] 用户信息显示和退出
- [ ] 数据自动同步（本地操作后自动上传）
- [ ] 首次登录从云端拉取数据
- [ ] 离线模式支持（断网时使用本地数据）

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
  - [ ] 编辑器中 AI 块样式根据主题动态切换
- [ ] 阶段三：交互模式重构（对话沉浸 ↔ 分屏协作 ↔ 写作沉浸光谱）
- [ ] AI 行内气泡（选中文字后快捷改写/扩展/润色）

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
- [ ] Block 编辑和更新
- [ ] Block 删除和归档
- [ ] Block 导出（Markdown/JSON）
- [ ] Block 批量操作

### 编辑器增强
- [x] AI 回复拖拽到编辑器（插入到光标位置）
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

**更新时间**: 2026-04-11 12:55  
**当前阶段**: P0 多项目工作区 UI 全部完成  
**下次评审**: 阶段三（交互模式重构）或 Phase 4 本地存储
