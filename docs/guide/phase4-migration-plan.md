# Phase 4: 中风险组件迁移计划

## 迁移策略

参考 `references/b_xvVUaSE0ejv/components/ui/` 中的 Shadcn UI 组件进行迁移。

## 组件迁移清单（8个）

### 1. TabBar（标签页栏）- 优先级 P0
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Tabs
- **参考文件**: ✅ `references/b_xvVUaSE0ejv/components/ui/navigation/tabs.tsx`
- **已安装**: ✅ `src/components/ui/tabs.tsx`
- **迁移状态**: 🟢 可以开始
- **预计时间**: 30 分钟

**功能需求**：
- 标签页列表（可滚动）
- 拖拽重排序
- 右键菜单（保存/关闭/关闭其他/关闭右侧）
- 新建标签按钮
- 全屏切换按钮
- 脏标记（未保存）
- 类型图标（今日/项目/文档）

**迁移方案**：
- 使用 Shadcn Tabs 作为基础
- 保留拖拽功能（HTML5 Drag and Drop API）
- 使用 Dropdown Menu 实现右键菜单
- 使用 Button 组件实现操作按钮

---

### 2. RightPanel（右侧面板容器）- 优先级 P0
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Card + Tabs
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/navigation/tabs.tsx`
- **已安装**: ✅ `src/components/ui/card.tsx`, `src/components/ui/tabs.tsx`
- **迁移状态**: 🟢 可以开始
- **预计时间**: 20 分钟

**功能需求**：
- 面板容器（可折叠）
- 标签页切换（AI 对话/Block 空间/预览/文档 Blocks/会话历史）
- 响应式布局

**迁移方案**：
- 使用 Card 作为容器
- 使用 Tabs 实现标签页切换
- 保留现有的面板切换逻辑

---

### 3. BlockSpacePanel（Block 空间面板）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Card + Input + Badge
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/form/input.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/badge.tsx`
- **已安装**: ✅ Card, Input | ❌ Badge（需要安装）
- **迁移状态**: 🟡 需要先安装 Badge
- **预计时间**: 30 分钟

**功能需求**：
- 搜索框
- Block 列表
- 标签过滤
- Block 详情查看

**迁移方案**：
- 使用 Card 作为容器
- 使用 Input 实现搜索框
- 使用 Badge 显示标签
- 使用 Button 实现操作按钮

---

### 4. BlockDetailPanel（Block 详情面板）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Dialog + Card
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/overlay/dialog.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
- **已安装**: ✅ Dialog, Card
- **迁移状态**: 🟢 可以开始
- **预计时间**: 25 分钟

**功能需求**：
- Block 内容显示
- 版本列表
- 引用记录
- 操作按钮（编辑/删除/导出）

**迁移方案**：
- 使用 Dialog 作为弹出层
- 使用 Card 组织内容区域
- 使用 Button 实现操作按钮

---

### 5. BlockDerivativeSelector（Block 派生选择器）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Select + Dialog
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/form/select.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/overlay/dialog.tsx`
- **已安装**: ✅ Select, Dialog
- **迁移状态**: 🟢 可以开始
- **预计时间**: 20 分钟

**功能需求**：
- 版本选择下拉框
- 版本预览
- 插入/派生操作

**迁移方案**：
- 使用 Select 实现版本选择
- 使用 Dialog 显示版本详情
- 使用 Button 实现操作按钮

---

### 6. DocumentBlocksPanel（文档 Blocks 面板）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Card + ScrollArea
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/layout/scroll-area.tsx`
- **已安装**: ✅ Card | ❌ ScrollArea（需要安装）
- **迁移状态**: 🟡 需要先安装 ScrollArea
- **预计时间**: 25 分钟

**功能需求**：
- Block 列表（可滚动）
- Block 点击跳转
- Block 操作（查看详情）

**迁移方案**：
- 使用 Card 作为容器
- 使用 ScrollArea 实现滚动列表
- 使用 Button 实现操作按钮

---

### 7. PreviewPanel（预览面板）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Card + Select
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/form/select.tsx`
- **已安装**: ✅ Card, Select
- **迁移状态**: 🟢 可以开始
- **预计时间**: 20 分钟

**功能需求**：
- 样式主题选择（编辑/预览/审阅）
- 内容预览区域
- 导出按钮

**迁移方案**：
- 使用 Card 作为容器
- 使用 Select 实现主题选择
- 使用 Button 实现导出按钮

---

### 8. SessionHistoryPanel（会话历史面板）- 优先级 P1
- **当前状态**: 使用自定义 CSS
- **目标组件**: Shadcn Card + ScrollArea + Separator
- **参考文件**: 
  - ✅ `references/b_xvVUaSE0ejv/components/ui/display/card.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/layout/scroll-area.tsx`
  - ✅ `references/b_xvVUaSE0ejv/components/ui/layout/separator.tsx`
- **已安装**: ✅ Card | ❌ ScrollArea, Separator（需要安装）
- **迁移状态**: 🟡 需要先安装 ScrollArea, Separator
- **预计时间**: 25 分钟

**功能需求**：
- 会话列表（按日期分组）
- 会话点击加载
- 会话导出
- 日期分隔符

**迁移方案**：
- 使用 Card 作为容器
- 使用 ScrollArea 实现滚动列表
- 使用 Separator 实现日期分隔
- 使用 Button 实现操作按钮

---

## 需要安装的额外组件

### 优先级 P0（立即安装）
1. ❌ **Badge**（徽章）- BlockSpacePanel 需要
2. ❌ **ScrollArea**（滚动区域）- DocumentBlocksPanel, SessionHistoryPanel 需要
3. ❌ **Separator**（分隔符）- SessionHistoryPanel 需要

### 优先级 P1（可选）
4. ❌ **Context Menu**（右键菜单）- TabBar 可选使用（当前使用自定义实现）
5. ❌ **Avatar**（头像）- 未来可能需要
6. ❌ **Alert**（警告）- 未来可能需要

---

## 执行顺序

### 第一批：立即可迁移（3个，约 70 分钟）
1. ✅ TabBar（30 分钟）
2. ✅ RightPanel（20 分钟）
3. ✅ PreviewPanel（20 分钟）

### 第二批：安装组件后迁移（3个，约 80 分钟）
**先安装**：Badge, ScrollArea, Separator（10 分钟）

4. ✅ BlockSpacePanel（30 分钟）
5. ✅ DocumentBlocksPanel（25 分钟）
6. ✅ SessionHistoryPanel（25 分钟）

### 第三批：最后迁移（2个，约 45 分钟）
7. ✅ BlockDetailPanel（25 分钟）
8. ✅ BlockDerivativeSelector（20 分钟）

---

## 总预计时间
- **第一批**：70 分钟
- **安装组件**：10 分钟
- **第二批**：80 分钟
- **第三批**：45 分钟
- **总计**：约 3.5 小时

---

## 验证清单

每个组件完成后：
- [ ] 移除 CSS 导入语句
- [ ] 删除 CSS 文件
- [ ] 运行 `bun run type-check`
- [ ] 手动测试功能
- [ ] Git 提交

---

**创建时间**：2026-04-16 00:50  
**状态**：准备开始第一批迁移
