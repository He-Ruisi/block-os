# 架构规范增强 - Container/View 模式和 Shell 组件

**日期**: 2026-04-17  
**类型**: 架构规范增强

## 完成内容

### 1. 创建 Shell 组件 API 文档
- 文件: `src/components/shells/API.md`
- 内容: 所有 Shell 组件的 TypeScript 接口和使用规范
- 核心原则: **回调统一传值（不传 Event）**
- 包含: 5 个 Shell 组件的完整 API 文档
- 包含: 创建新 Shell 组件的规范和模板
- 包含: 测试规范和常见问题解答

### 2. 增强 Container/View 模式 Skill
- 文件: `.kiro/skills/container-view-pattern.md`
- 新增: **可用 Shell 组件清单**（5 个组件）
- 新增: **Mappers 模板**（数据转换层）
- 新增: **架构边界严格约束**（4 个边界规则）
- 更新: Container 模板（通过 hooks 访问数据）
- 更新: View 模板（只 import ViewModel 类型）

### 3. 增强 Shadcn UI 重构规范
- 文件: `.kiro/steering/shadcn-ui-refactor.md`
- 新增: **Shell 组件清单**（5 个组件 + API + 使用示例）
- 新增: **如何添加新 Shell 组件**（7 步流程）
- 强调: 禁止在 View 内部临时实现 shell 级组件

## 核心改进

### 问题 1: Shell 组件清单缺失 ✅ 已解决
**问题**: 没有显式列出可用的 Shell 组件，AI 可能不知道有哪些可用。

**解决方案**:
- 在 `container-view-pattern.md` 中添加 **可用 Shell 组件清单**（5 个）
- 在 `shadcn-ui-refactor.md` 中添加 **Shell 组件清单**（含 API 和示例）
- 创建 `src/components/shells/API.md` 专门文档化所有 Shell 组件 API
- 强调规则: **如果 shells 中没有，必须先在 `components/shells/` 中实现，再使用**

### 问题 2: ViewModel 转换位置不够严格 ✅ 已解决
**问题**: Container 内直接转换 ViewModel，复杂项目会导致 Container 臃肿。

**解决方案**:
- 新增 **Mappers 模板**（数据转换层）
- 规则: **当 ViewModel 转换逻辑超过 5 行或被多处使用时，必须抽到 `mappers.ts`**
- 示例: `toBlockViewModel()` 和 `toBlockViewModels()` 纯函数
- 好处: 可单测、Container 更干净、多个 Container 可复用

### 问题 3: Container 不应直接 import blockStore ✅ 已解决
**问题**: 模板中 Container 直接访问 `blockStore`，破坏架构边界。

**解决方案**:
- 更新 Container 模板: **通过 hooks 访问数据**
- 规则: **Container 不直接访问 `storage/*`，必须通过 `features/<feature>/hooks/*` 间接访问**
- 架构边界: `Container (数据编排层) → Hooks (数据接入层) → Storage/Services (数据存储层)`
- 示例: `useBlockSearch()` hook 封装 store 访问和订阅

### 问题 4: SearchInput 的 onChange 签名不一致 ✅ 已解决
**问题**: Shell 组件的回调签名不明确，可能传 Event 或 string。

**解决方案**:
- 创建 `src/components/shells/API.md` 文档化所有 Shell 组件 API
- 核心原则: **回调统一传值（不传 Event）**
- 规则: `onChange: (value: string) => void`（传 string，不传 Event）
- 内部实现: Shell 组件内部处理 Event，对外传值
- 好处: View 层不处理 Event、简化 Container、提高可测试性

### 问题 5: 缺少类型导入边界约束 ✅ 已解决
**问题**: View 可能直接 import 领域模型类型，破坏架构边界。

**解决方案**:
- 新增 **架构边界严格约束**（4 个边界规则）
- 规则: **View 组件禁止 import `types/models/*`，只能 import 本目录的 ViewModel 类型**
- 原因: ViewModel 是展示层的"防腐层"，隔离领域模型变化
- 示例: `import type { BlockViewModel } from './types'`（✅）vs `import type { Block } from '@/types/models/block'`（❌）

## 架构边界严格约束（新增）

### 1. Container 数据访问边界
```
❌ 错误: import { blockStore } from '@/storage/blockStore';
✅ 正确: import { useBlocks } from '@/features/blocks/hooks/useBlocks';
```

### 2. View 类型导入边界
```
❌ 错误: import type { Block } from '@/types/models/block';
✅ 正确: import type { BlockViewModel } from './types';
```

### 3. Shell 组件回调边界
```
❌ 错误: onChange: (e: React.ChangeEvent) => void
✅ 正确: onChange: (value: string) => void
```

### 4. ViewModel 转换边界
```
❌ 错误: Container 内直接 map 转换（超过 5 行）
✅ 正确: 使用 mappers.ts 中的纯函数
```

## 文件变更

### 新增文件
- `src/components/shells/API.md` - Shell 组件 API 文档（约 400 行）

### 更新文件
- `.kiro/skills/container-view-pattern.md` - 增强架构规范（新增约 300 行）
- `.kiro/steering/shadcn-ui-refactor.md` - 增强 Shell 组件说明（新增约 100 行）

## 技术亮点

### 1. 完整的 Shell 组件 API 文档
- 所有 Shell 组件的 TypeScript 接口
- 回调命名规范（onClick、onChange、onSelect 等）
- Props 接口定义模板
- 内部 Event 处理模板
- 类型导出规范
- 测试规范

### 2. 严格的架构边界约束
- Container 通过 hooks 访问数据（不直接访问 store）
- View 只 import ViewModel 类型（不 import 领域模型）
- Shell 组件回调传值（不传 Event）
- ViewModel 转换抽到 mappers（不在 Container 内转换）

### 3. 清晰的组件分层规则
```
components/
├── ui/           # Shadcn UI 基础组件
├── shells/       # 项目级展示壳组件（5 个）
└── layout/       # 应用框架组件

features/<feature>/
├── components/   # 业务组件（Container + View）
├── hooks/        # 数据接入层
└── services/     # 业务逻辑层
```

### 4. 可复用的代码模板
- Mappers 模板（数据转换层）
- Container 模板（数据编排层）
- View 模板（展示层）
- Shell 组件创建模板

## 验收标准

### ✅ 文档完整性
- Shell 组件 API 文档完整（5 个组件 + 规范）
- Container/View 模式 Skill 完整（清单 + 边界 + 模板）
- Shadcn UI 重构规范完整（清单 + 示例 + 流程）

### ✅ 架构边界清晰
- Container 数据访问边界明确
- View 类型导入边界明确
- Shell 组件回调边界明确
- ViewModel 转换边界明确

### ✅ 类型检查通过
```bash
bun run type-check  # ✅ 无错误
```

## 影响范围

### 对现有代码的影响
- **无破坏性变更**：现有代码继续工作
- **渐进式改进**：新代码遵循新规范
- **重构指导**：为后续重构提供明确指南

### 对开发流程的影响
- **更严格的架构约束**：防止架构腐化
- **更清晰的职责划分**：Container vs View vs Hooks
- **更高的代码质量**：可测试、可维护、可复用

## 下一步计划

### 应用新规范重构组件
1. **BlockDetailPanel** - 应用 mappers + hooks 边界
2. **BlockSpacePanel** - 应用 Shell 组件清单
3. **BlockDerivativeSelector** - 应用 ViewModel 类型边界

### 完善 Hooks 层
- 创建 `useBlocks` hook（封装 blockStore 访问）
- 创建 `useDocuments` hook（封装 documentStore 访问）
- 创建 `useProjects` hook（封装 projectStore 访问）

### 补充测试
- Mappers 单元测试（纯函数，易于测试）
- Shell 组件单元测试（验证回调传值）
- Container 集成测试（验证 hooks 调用）

## 参考资源

- [Shell 组件 API 文档](../../src/components/shells/API.md)
- [Container/View 模式 Skill](../../.kiro/skills/container-view-pattern.md)
- [Shadcn UI 重构规范](../../.kiro/steering/shadcn-ui-refactor.md)
- [Shell 组件 README](../../src/components/shells/README.md)
