# BlockOS 待办事项

## P0 - 核心功能（当前优先）

### 项目架构优化 🔧
- [x] 设计新的文档组织结构 - [详细方案](./spec/2026-04-09-project-structure-improvement.md)
- [x] 优化 Hooks 触发时机（改为 agentStop）
- [x] 实现每天一个日志文件（追加模式）
- [x] 创建新的目录结构（logs/YYYY-MM/, spec/features/）
- [x] 更新 3 个 Hooks 配置文件
- [x] 创建架构文档（ARCHITECTURE.md, QUICK_START.md 等）
- [ ] 清理旧的分散日志文件
- [ ] 移动现有需求文档到功能分类目录

### Phase 3: Block 系统 🚀
- [ ] 隐式 Block 系统（段落自动识别）- [详细需求](./spec/PRD/2026-04-09-phase3-block-system.md)
- [ ] Block 数据模型完善（添加 links 字段）
- [ ] 双向链接 `[[]]` 语法
- [ ] 块引用 `(())` 语法
- [ ] 块空间可视化界面（关系图谱）

## P1 - 重要功能

### Phase 4: 本地存储
- [ ] 文件系统读写 - [详细需求](./spec/PRD/2026-04-09-phase4-local-storage.md)
- [ ] Git 集成与自动提交
- [ ] Session 管理与状态恢复

## P2 - 增强功能

### Block 增强
- [ ] Block 编辑和更新
- [ ] Block 删除和归档
- [ ] Block 导出（Markdown/JSON）
- [ ] Block 批量操作

### 编辑器增强
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

**更新时间**: 2026-04-09 16:30  
**当前阶段**: Phase 3 - Block 系统  
**下次评审**: Phase 3 完成后
