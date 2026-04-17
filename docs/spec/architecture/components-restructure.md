# Components 架构重构 - 技术设计文档

**文档类型**: 架构设计  
**创建日期**: 2026-04-17  
**状态**: 草稿  
**优先级**: P1

---

## 概述

<!-- 简要描述本次架构重构的目标和范围 -->

### 背景

<!-- 当前架构存在的问题 -->

### 目标

<!-- 重构后要达到的目标 -->

---

## 高层设计

### 当前架构问题

#### 问题 1: layout/ 混杂了 Layout 骨架和 Feature 业务

<!-- 详细描述问题 -->

#### 问题 2: panel/ 混杂了 Shell 容器和 Feature 业务

<!-- 详细描述问题 -->

#### 问题 3: project/ 孤立存在

<!-- 详细描述问题 -->

### 目标架构

#### 架构原则

<!-- 功能域聚合、高内聚低耦合等原则 -->

#### 目录结构设计

```
src/
├── components/
│   ├── layout/              ← 纯骨架（5 个文件）
│   ├── panels/              ← 容器壳（1 个文件）
│   ├── shells/              ← UI 模式（保持不变）
│   ├── shared/              ← 通用组件（保持不变）
│   └── ui/                  ← Shadcn 组件（保持不变）
│
├── features/
│   ├── sidebar/             ← 左侧边栏功能域（6 个子功能）
│   ├── right-sidebar/       ← 右侧边栏功能域（4 个子功能）
│   ├── settings/            ← 设置功能域
│   ├── projects/            ← 项目管理功能域
│   ├── blocks/              ← Block 核心逻辑（2 个组件）
│   ├── ai/                  ← AI 功能域（保持不变）
│   ├── auth/                ← 认证功能域（保持不变）
│   └── editor/              ← 编辑器功能域（保持不变）
```

#### 功能域划分

##### 1. sidebar/ - 左侧边栏功能域

<!-- 包含的子功能、职责边界 -->

##### 2. right-sidebar/ - 右侧边栏功能域

<!-- 包含的子功能、职责边界 -->

##### 3. settings/ - 设置功能域

<!-- 职责边界 -->

##### 4. projects/ - 项目管理功能域

<!-- 职责边界 -->

##### 5. blocks/ - Block 核心逻辑

<!-- 调整后的职责边界 -->

### 架构优势

<!-- 对比新旧架构的优势 -->

---

## 迁移计划

### Phase 1: 左侧边栏功能域（6 个组件）

| 原路径 | 新路径 | 理由 | Container-View |
|--------|--------|------|----------------|
| `layout/ExplorerView.tsx` | `features/sidebar/explorer/` | 左侧边栏 - 项目浏览 | ✅ 必须 |
| `layout/SearchView.tsx` | `features/sidebar/search/` | 左侧边栏 - 搜索 | ✅ 必须 |
| `layout/OutlineView.tsx` | `features/sidebar/outline/` | 左侧边栏 - 大纲 | ✅ 必须 |
| `layout/StarredView.tsx` | `features/sidebar/starred/` | 左侧边栏 - 收藏 | ✅ 必须 |
| `layout/ExtensionsView.tsx` | `features/sidebar/extensions/` | 左侧边栏 - 扩展 | ✅ 必须 |
| `layout/PluginWorkspaceView.tsx` | `features/sidebar/plugin-workspace/` | 左侧边栏 - 插件 | ✅ 必须 |

**预计时间**: <!-- 填写预计时间 -->

**验收标准**:
- [ ] 所有组件迁移完成
- [ ] TypeScript 类型检查通过
- [ ] 所有功能正常工作
- [ ] 更新所有 import 路径

### Phase 2: 右侧边栏功能域（4 个组件）

| 原路径 | 新路径 | 理由 | Container-View |
|--------|--------|------|----------------|
| `panel/PreviewPanel.tsx` | `features/right-sidebar/preview/` | 右侧边栏 - 预览导出 | ✅ 必须 |
| `panel/SessionHistoryPanel.tsx` | `features/right-sidebar/session-history/` | 右侧边栏 - 会话历史 | ✅ 必须 |
| `features/blocks/components/DocumentBlocksPanel/` | `features/right-sidebar/document-blocks/` | 右侧边栏 - 文档 Block | ✅ 已完成 |
| `features/blocks/components/BlockSpacePanel/` | `features/right-sidebar/block-space/` | 右侧边栏 - Block 空间 | ✅ 已完成 |

**预计时间**: <!-- 填写预计时间 -->

**验收标准**:
- [ ] 所有组件迁移完成
- [ ] TypeScript 类型检查通过
- [ ] 所有功能正常工作
- [ ] 更新所有 import 路径

### Phase 3: 设置功能域（1 个组件）

| 原路径 | 新路径 | 理由 | Container-View |
|--------|--------|------|----------------|
| `panel/SettingsPanel.tsx` | `features/settings/` | 设置功能域 | ✅ 必须 |

**预计时间**: 已完成 (2026-04-17)

**验收标准**:
- [x] 组件迁移完成
- [x] TypeScript 类型检查通过
- [x] 所有功能正常工作
- [x] 更新所有 import 路径

**迁移详情**:
- ✅ 创建 `features/settings/components/SettingsPanel/` 目录
- ✅ Container/View 拆分完成：
  - `SettingsPanelContainer.tsx` - 逻辑层（hooks、事件处理）
  - `SettingsPanelView.tsx` - 主展示层
  - `AccountTabView.tsx` - 账号标签页
  - `SyncTabView.tsx` - 同步标签页
  - `types.ts` - ViewModel 类型定义
  - `mappers.ts` - 数据转换层
- ✅ 更新 `App.tsx` import 路径
- ✅ 删除原文件 `components/panel/SettingsPanel.tsx`
- ✅ TypeScript 类型检查通过

### Phase 4: 项目管理 + 重命名容器（2 个组件）

| 原路径 | 新路径 | 理由 | Container-View |
|--------|--------|------|----------------|
| `project/ProjectOverview.tsx` | `features/projects/` | 项目管理功能域 | ✅ 必须 |
| `panel/RightPanel.tsx` | `panels/RightPanelShell.tsx` | 统一 Shell 命名 | ❌ 不需要 |

**预计时间**: <!-- 填写预计时间 -->

**验收标准**:
- [ ] 所有组件迁移完成
- [ ] TypeScript 类型检查通过
- [ ] 所有功能正常工作
- [ ] 更新所有 import 路径
- [ ] 删除空目录

---

## 技术细节

### Container-View 拆分规范

<!-- 引用 container-view-pattern skill -->

### Shadcn UI 重构规范

<!-- 引用 ui-refactor skill -->

### 架构边界约束

<!-- 引用架构边界规则 -->

---

## 风险评估

### 高风险项

<!-- 列出高风险项及缓解措施 -->

### 中风险项

<!-- 列出中风险项及缓解措施 -->

### 低风险项

<!-- 列出低风险项 -->

---

## 验证计划

### 功能验证

<!-- 功能测试清单 -->

### 性能验证

<!-- 性能测试清单 -->

### 类型检查

```bash
bun run type-check
```

---

## 回滚计划

<!-- 如果迁移失败，如何回滚 -->

---

## 参考资料

- [Container/View 模式 Skill](../../../.kiro/skills/container-view-pattern.md)
- [UI 重构 Skill](../../../.kiro/skills/ui-refactor.md)
- [Shell 组件设计 Skill](../../../.kiro/skills/shells-design.md)
- [架构文档](../../ARCHITECTURE.md)
- [项目结构规范](../../../.codex/rules/structure.md)

---

## 更新日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-04-17 | v0.1 | 创建文档框架 | - |
