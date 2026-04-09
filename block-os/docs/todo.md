# BlockOS 待办事项

## P0 - 核心功能（当前优先）

### Phase 2.5: Block 捕获与上下文传递 🚀
- [ ] 选中文字发送给 AI - [详细需求](./spec/PRD/2026-04-09-phase2.5-block-capture.md)
- [ ] AI 回复捕获为 Block
- [ ] Block 空间基础 UI（右侧面板标签页）
- [ ] IndexedDB 存储实现

### Phase 2: AI 对话集成
- [x] 接入 xiaomi mimo API - [详细需求](./spec/PRD/2026-04-09-phase2-ai-integration.md)
- [x] 实现对话界面（右侧面板）
- [x] AI 输出直接写入编辑器
- [x] AI 回复内容分离
- [x] 系统提示词自定义设置

## P1 - 重要功能

### Phase 3: Block 系统
- [ ] 隐式 Block 系统（段落自动识别）
- [ ] Block 数据模型完善 - [详细需求](./spec/PRD/2026-04-09-phase3-block-system.md)
- [ ] 双向链接 `[[]]` 语法
- [ ] 块引用 `(())` 语法
- [ ] 块空间可视化界面（关系图谱）

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

**更新时间**: 2026-04-09 15:15  
**当前阶段**: Phase 2.5 - Block 捕获与上下文传递  
**下次评审**: Phase 2.5 完成后
