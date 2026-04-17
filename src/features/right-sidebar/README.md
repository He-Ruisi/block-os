# Right Sidebar Feature

右侧边栏功能域，包含所有右侧面板组件。

## 组件列表

### 1. PreviewPanel - 预览导出面板
- **路径**: `preview/`
- **职责**: 文档预览和导出功能
- **Container/View**: ✅ 已拆分
- **Hook**: `usePreview` - 封装预览数据加载逻辑

### 2. SessionHistoryPanel - 会话历史面板
- **路径**: `session-history/`
- **职责**: AI 对话历史管理
- **Container/View**: ✅ 已拆分
- **依赖**: `@/features/ai` (groupSessionsByDate, exportSessionAsJSON)

### 3. BlockSpacePanel - Block 空间面板
- **路径**: `block-space/`
- **职责**: 全局 Block 管理和搜索
- **Container/View**: ✅ 已拆分
- **Hook**: `useBlocks` - 封装 Block 数据访问

### 4. DocumentBlocksPanel - 文档 Block 面板
- **路径**: `document-blocks/`
- **职责**: 当前文档的 Block 列表
- **Container/View**: ✅ 已拆分
- **依赖**: `documentStore`

## 架构规范

所有组件遵循 Container/View 模式：

```
<ComponentName>/
├── <ComponentName>Container.tsx  # 逻辑容器
├── <ComponentName>View.tsx       # 主展示组件
├── types.ts                      # ViewModel 类型
├── mappers.ts                    # 数据转换函数
├── hooks/                        # 自定义 hooks（可选）
└── index.ts                      # 导出入口
```

### 关键约束

1. **Container 层**
   - ✅ 通过 hooks 访问数据
   - ❌ 禁止直接访问 `storage/*`
   - ✅ 使用 mappers 转换数据

2. **View 层**
   - ✅ 只 import ViewModel 类型
   - ❌ 禁止 import 领域模型类型
   - ✅ 使用 Shadcn UI 和 Shell 组件

3. **Hooks**
   - ✅ 封装 store 访问逻辑
   - ✅ 提供订阅机制
   - ❌ 不包含业务逻辑

## 使用示例

```tsx
// 从统一入口导入
import { PreviewPanel, SessionHistoryPanel, BlockSpacePanel } from '@/features/right-sidebar';

// 或从具体路径导入
import { PreviewPanel } from '@/features/right-sidebar/preview';
```

## 迁移记录

- **日期**: 2026-04-17
- **来源**: 
  - `src/components/panel/PreviewPanel.tsx` → `preview/`
  - `src/components/panel/SessionHistoryPanel.tsx` → `session-history/`
  - `src/features/blocks/components/BlockSpacePanel/` → `block-space/`
  - `src/features/blocks/components/DocumentBlocksPanel/` → `document-blocks/`
- **变更**: 完成 Container/View 拆分，创建 hooks 和 mappers
- **验证**: ✅ TypeScript 类型检查通过

## 参考资料

- [Container/View 模式](/.codex/skills/container-view-pattern.md)
- [架构重构文档](/docs/spec/architecture/components-restructure.md)
- [Shell 组件 API](/src/components/shells/API.md)
