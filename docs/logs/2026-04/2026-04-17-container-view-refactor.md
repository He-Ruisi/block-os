# Container/View 模式重构 - DocumentBlocksPanel

**日期**: 2026-04-17  
**类型**: 架构优化 + 代码重构

## 完成内容

### 1. 创建 Container/View 拆分模式 Skill
- 文件: `.kiro/skills/container-view-pattern.md`
- 内容: 完整的 Container/View 拆分指南
  - 核心原则（Container 负责逻辑，View 负责渲染）
  - 文件组织结构（feature 内部拆分）
  - 代码模板（Container、View、子 View、ViewModel）
  - 拆分步骤和注意事项
  - 测试策略
  - 迁移优先级

### 2. 重构 DocumentBlocksPanel（试点）
将单文件组件拆分为 Container/View 模式：

#### 新文件结构
```
src/features/blocks/components/DocumentBlocksPanel/
├── DocumentBlocksPanelContainer.tsx  # 容器组件（逻辑）
├── DocumentBlocksPanelView.tsx       # 主展示组件
├── BlockListView.tsx                 # Block 列表展示
├── BlockItemView.tsx                 # 单个 Block 展示
├── types.ts                          # ViewModel 类型
└── index.ts                          # 导出入口
```

#### 职责划分

**Container（DocumentBlocksPanelContainer.tsx）**
- ✅ 使用 `useState`、`useEffect` 管理状态
- ✅ 调用 `documentStore` 加载数据
- ✅ 定时刷新逻辑（2 秒轮询）
- ✅ 数据转换为 ViewModel
- ✅ 计算统计数据（totalBlocks、totalLinks）

**View（DocumentBlocksPanelView.tsx）**
- ✅ 接收 props（blocks、documentTitle、isLoading、stats）
- ✅ 使用 Shadcn UI 组件（ScrollArea）
- ✅ 使用 Shell 组件（PanelShell）
- ✅ 纯渲染逻辑，无状态管理

**子 View（BlockListView.tsx、BlockItemView.tsx）**
- ✅ 拆分列表和单项渲染
- ✅ 使用 Shadcn UI（Card、Badge）
- ✅ 图标渲染逻辑（getNodeIcon）

#### ViewModel 设计
```typescript
interface BlockViewModel {
  id: string;
  nodeType: string;
  content: string;
  links: string[];
  index: number;  // 预计算的序号
}

interface DocumentBlocksStats {
  totalBlocks: number;
  totalLinks: number;
}
```

### 3. 保持向后兼容
- ✅ 导出路径不变：`export { DocumentBlocksPanel } from './components/DocumentBlocksPanel'`
- ✅ 组件名称不变：`DocumentBlocksPanel`
- ✅ 无需修改其他文件的 import

### 4. 类型检查通过
```bash
bun run type-check  # ✅ 无错误
```

## 技术亮点

### 1. 逻辑与 UI 分离
- Container 专注业务逻辑（store、hooks、数据转换）
- View 专注渲染（Shadcn UI、样式组合）
- 提升可测试性和可维护性

### 2. ViewModel 模式
- 隐藏 store 内部类型（DocumentBlock）
- 只暴露展示需要的字段
- 预计算派生数据（index、stats）

### 3. 组件拆分粒度合理
- 主 View：面板整体布局
- 列表 View：Block 列表渲染
- 单项 View：单个 Block 卡片
- 每个组件职责单一，易于理解

### 4. 遵循项目规范
- ✅ 使用 Shadcn UI 组件（Card、Badge、ScrollArea）
- ✅ 使用 Shell 组件（PanelShell）
- ✅ 使用 Tailwind CSS 工具类
- ✅ TypeScript 严格类型检查

## 下一步计划

### 待重构组件（按优先级）
1. ✅ **DocumentBlocksPanel** - 已完成
2. ⏳ **BlockDetailPanel** - 详情展示，逻辑较多
3. ⏳ **BlockSpacePanel** - 全局 Block 管理
4. ⏳ **BlockDerivativeSelector** - 派生选择器

### 重构收益
- 代码可读性提升（逻辑与 UI 分离）
- 可测试性提升（Container 和 View 可独立测试）
- 可维护性提升（修改逻辑不影响 UI，反之亦然）
- 可复用性提升（View 组件可在其他场景复用）

## 相关文件
- Skill: `.kiro/skills/container-view-pattern.md`
- 重构组件: `src/features/blocks/components/DocumentBlocksPanel/`
- 项目规范: `.kiro/steering/shadcn-ui-refactor.md`
