# Blocks Feature Container/View 重构进度

**日期**: 2026-04-17  
**Skill**: container-view-pattern  
**目标**: 重构 blocks feature 中剩余的 3 个组件

## 进度概览

- ✅ **BlockSpacePanel** - 已完成（1/3）
- ⏸️ **BlockDetailPanel** - 待开始（2/3）
- ⏸️ **BlockDerivativeSelector** - 待开始（3/3）

---

## 1. BlockSpacePanel 重构（已完成）

### 文件结构
```
src/features/blocks/components/BlockSpacePanel/
├── BlockSpacePanelContainer.tsx  # 容器组件（逻辑）
├── BlockSpacePanelView.tsx       # 主展示组件
├── BlockListView.tsx             # Block 列表展示
├── BlockItemView.tsx             # 单个 Block 卡片
├── mappers.ts                    # 数据转换层
├── types.ts                      # ViewModel 类型
└── index.ts                      # 导出
```

### 新增 Hook
```
src/features/blocks/hooks/useBlocks.ts  # 封装 blockStore 访问
```

### 职责划分

**Container（BlockSpacePanelContainer.tsx）**
- ✅ 使用 `useBlocks` hook 访问数据（不直接访问 blockStore）
- ✅ 搜索和标签过滤逻辑
- ✅ 高亮和详情面板状态管理
- ✅ 事件监听（showBlockInSpace、openBlockDetail、blockUpdated）
- ✅ 使用 `toBlockViewModels` mapper 转换数据

**View（BlockSpacePanelView.tsx）**
- ✅ 使用 SearchInput Shell 组件
- ✅ 使用 Shadcn UI 组件（Button、ScrollArea）
- ✅ 只 import ViewModel 类型（不 import Block 类型）
- ✅ 纯渲染逻辑，无状态管理

**Mappers（mappers.ts）**
- ✅ `toBlockViewModel()` - 单个转换
- ✅ `toBlockViewModels()` - 批量转换
- ✅ `truncateContent()` - 内容截断工具函数

**ViewModel（types.ts）**
```typescript
interface BlockViewModel {
  id: string;
  title: string;
  content: string;
  preview: string;
  tags: string[];
  type: string;
}

interface BlockSpaceStats {
  totalBlocks: number;
  filteredBlocks: number;
  allTags: string[];
}
```

### 技术亮点
- ✅ 逻辑与 UI 完全分离
- ✅ 通过 `useBlocks` hook 访问数据（不直接访问 blockStore）
- ✅ 使用 mappers 转换数据（不在 Container 内转换）
- ✅ 使用 SearchInput Shell 组件
- ✅ Bento Grid 卡片布局（响应式 2 列）
- ✅ 保持所有功能：搜索、标签过滤、拖拽、高亮、详情面板
- ✅ TypeScript 类型检查通过

### 遵循的架构边界
1. **Container 数据访问边界** ✅
   - 通过 `useBlocks` hook 访问数据
   - 不直接 import `blockStore`
   
2. **View 类型导入边界** ✅
   - 只 import `BlockViewModel` 类型
   - 不 import `Block` 领域模型类型
   
3. **Shell 组件回调边界** ✅
   - `SearchInput` 的 `onChange` 传 string
   - 不处理 Event 对象
   
4. **ViewModel 转换边界** ✅
   - 使用 `mappers.ts` 中的纯函数
   - 不在 Container 内直接转换

---

## 2. BlockDetailPanel 重构（待开始）

### 当前状态
- 文件: `src/features/blocks/components/BlockDetailPanel.tsx`（约 250 行）
- 复杂度: 中等
- 主要功能:
  - Block 详情展示
  - 版本历史列表（releases）
  - 引用记录列表（usages）
  - 发布新版本
  - 插入到编辑器

### 重构计划
1. 创建 `BlockDetailPanel/` 目录
2. 定义 ViewModel 类型（BlockDetailViewModel、ReleaseViewModel、UsageViewModel）
3. 创建 mappers（toBlockDetailViewModel、toReleaseViewModels、toUsageViewModels）
4. 创建 Container（逻辑层）
5. 创建 View（展示层）
6. 创建子 View（ReleaseListView、UsageListView）

---

## 3. BlockDerivativeSelector 重构（待开始）

### 当前状态
- 文件: `src/features/blocks/components/BlockDerivativeSelector.tsx`（约 200 行）
- 复杂度: 中等
- 主要功能:
  - 显示源 Block
  - 显示派生版本列表
  - 单选选择
  - 模态框交互

### 重构计划
1. 创建 `BlockDerivativeSelector/` 目录
2. 定义 ViewModel 类型（DerivativeTreeViewModel）
3. 创建 mappers（toDerivativeTreeViewModel）
4. 创建 Container（逻辑层）
5. 创建 View（展示层）
6. 创建子 View（SourceBlockView、DerivativeListView）

---

## 下一步

继续重构 BlockDetailPanel，预计 30 分钟完成。

## 参考资源

- [Container/View 模式 Skill](../../../.kiro/skills/container-view-pattern.md)
- [Shell 组件 API 文档](../../../src/components/shells/API.md)
- [架构规范增强文档](./2026-04-17-architecture-enhancement.md)
