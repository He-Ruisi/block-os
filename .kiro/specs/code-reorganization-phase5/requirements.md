# 需求文档：代码重组和架构优化（Phase 5）

## 简介

BlockOS 是一个基于 React + TypeScript 的写作优先、AI 原生的个人知识操作系统。当前项目结构基本清晰，但存在一些可优化的地方，需要系统化地重组代码结构，提升可维护性和可扩展性。

本需求文档定义了一个分 3 步执行的代码重组方案，每步完成后项目必须保持可运行状态。

## 术语表

- **System**：BlockOS 系统
- **Code_Reorganization_Tool**：执行代码重组的工具（AI 或开发者）
- **Type_Checker**：TypeScript 类型检查工具（`bun run type-check`）
- **Import_Path**：模块导入路径
- **Dependency_Layer**：依赖层级（types → utils → storage → services → hooks → components）
- **Feature_Module**：功能模块（ai/editor/auth/blocks）
- **CSS_File**：样式文件
- **Constants_File**：常量定义文件
- **Magic_Value**：魔法数字或魔法字符串（硬编码的值）
- **Service_Layer**：服务层（api/business/integration）
- **Context_Provider**：React Context 提供者
- **Plugin_System**：插件系统
- **Test_Directory**：测试目录


## 需求

### 需求 1：合并重复文件

**用户故事：** 作为开发者，我希望消除重复的文件，以便减少维护成本和避免混淆。

#### 验收标准

1. WHEN 发现 `src/hooks/useToast.ts` 和 `src/hooks/use-toast.ts` 两个文件时，THE Code_Reorganization_Tool SHALL 分析两个文件的使用情况
2. THE Code_Reorganization_Tool SHALL 保留 shadcn/ui 标准的 `use-toast.ts` 文件（kebab-case 命名）
3. THE Code_Reorganization_Tool SHALL 将 `useToast.ts`（camelCase）中的使用迁移到 `use-toast.ts`
4. THE Code_Reorganization_Tool SHALL 更新所有引用 `useToast.ts` 的 Import_Path
5. WHEN 所有引用更新完成后，THE Code_Reorganization_Tool SHALL 删除 `src/hooks/useToast.ts` 文件
6. THE Type_Checker SHALL 通过类型检查（无错误）
7. THE System SHALL 在浏览器中正常运行（Toast 功能正常）

### 需求 2：统一样式管理

**用户故事：** 作为开发者，我希望将分散的 CSS 文件集中管理，以便更好地维护样式系统。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 创建 `src/styles/` 目录结构：
   - `src/styles/global/` — 全局样式（index.css, responsive.css）
   - `src/styles/components/` — 组件样式（Editor.css 等）
   - `src/styles/themes/` — 主题样式（未来扩展）
2. WHEN 组件 CSS 文件存在时，THE Code_Reorganization_Tool SHALL 将其移动到 `src/styles/components/` 目录
3. THE Code_Reorganization_Tool SHALL 更新所有 CSS 导入路径
4. THE Code_Reorganization_Tool SHALL 保留 `src/index.css`（Design Token 系统 + Tailwind）
5. THE Code_Reorganization_Tool SHALL 将 `src/styles/index.css` 内容合并到 `src/index.css`（如有必要）
6. WHEN `src/App.css` 内容为空或已迁移时，THE Code_Reorganization_Tool SHALL 删除该文件
7. THE System SHALL 在浏览器中正常运行（样式显示正常）

### 需求 3：添加 Constants 目录

**用户故事：** 作为开发者，我希望将魔法数字和魔法字符串提取为常量，以便提高代码可读性和可维护性。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 创建 `src/constants/` 目录
2. THE Code_Reorganization_Tool SHALL 创建以下常量文件：
   - `src/constants/ui.ts` — UI 相关常量（尺寸、间距、动画时长）
   - `src/constants/storage.ts` — 存储相关常量（数据库名、表名、键名）
   - `src/constants/api.ts` — API 相关常量（端点、超时时间）
   - `src/constants/editor.ts` — 编辑器相关常量（快捷键、默认内容）
   - `src/constants/index.ts` — 导出所有常量
3. THE Code_Reorganization_Tool SHALL 识别代码中的 Magic_Value（硬编码的数字和字符串）
4. THE Code_Reorganization_Tool SHALL 将 Magic_Value 提取为命名常量
5. THE Code_Reorganization_Tool SHALL 更新代码以使用新的常量
6. THE Type_Checker SHALL 通过类型检查（无错误）
7. THE System SHALL 在浏览器中正常运行（功能不变）


### 需求 4：引入 Features 架构

**用户故事：** 作为开发者，我希望将复杂功能模块化，以便更好地组织代码和实现功能隔离。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 创建 `src/features/` 目录
2. THE Code_Reorganization_Tool SHALL 为每个 Feature_Module 创建子目录：
   - `src/features/ai/` — AI 对话功能
   - `src/features/editor/` — 编辑器功能
   - `src/features/auth/` — 认证功能
   - `src/features/blocks/` — Block 系统功能
3. WHEN Feature_Module 包含多个相关组件、hooks、services 时，THE Code_Reorganization_Tool SHALL 将它们组织到对应的 feature 目录下
4. THE Code_Reorganization_Tool SHALL 在每个 feature 目录中创建 `index.ts` 导出文件
5. THE Code_Reorganization_Tool SHALL 更新所有 Import_Path 以使用新的 feature 路径
6. THE Code_Reorganization_Tool SHALL 保持 Dependency_Layer 规则（不引入循环依赖）
7. THE Type_Checker SHALL 通过类型检查（无错误）
8. THE System SHALL 在浏览器中正常运行（所有功能正常）

### 需求 5：完善类型定义

**用户故事：** 作为开发者，我希望按用途分类类型定义，以便更容易找到和维护类型。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 重组 `src/types/` 目录结构：
   - `src/types/models/` — 数据模型类型（block, document, project, chat）
   - `src/types/api/` — API 相关类型（请求、响应、错误）
   - `src/types/common/` — 通用类型（layout, plugin）
   - `src/types/index.ts` — 统一导出
2. THE Code_Reorganization_Tool SHALL 将现有类型文件移动到对应的子目录
3. THE Code_Reorganization_Tool SHALL 更新 `src/types/index.ts` 以重新导出所有类型
4. THE Code_Reorganization_Tool SHALL 更新所有 Import_Path 以使用新的类型路径
5. THE Type_Checker SHALL 通过类型检查（无错误）
6. THE System SHALL 在浏览器中正常运行（类型系统正常）

### 需求 6：优化 Service 层

**用户故事：** 作为开发者，我希望将 Service 层按职责分类，以便更清晰地理解服务的作用。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 重组 `src/services/` 目录结构：
   - `src/services/api/` — API 调用层（aiService, authService）
   - `src/services/business/` — 业务逻辑层（blockCaptureService, blockReleaseService, exportService, sessionService）
   - `src/services/integration/` — 第三方集成层（syncService, autoSyncService, gitIntegration, ocrBlockService）
   - `src/services/core/` — 核心服务（pluginAPI, pluginRegistry）
   - `src/services/index.ts` — 统一导出
2. THE Code_Reorganization_Tool SHALL 将现有服务文件移动到对应的子目录
3. THE Code_Reorganization_Tool SHALL 更新所有 Import_Path 以使用新的服务路径
4. THE Code_Reorganization_Tool SHALL 保持 Dependency_Layer 规则（services 不依赖 hooks 或 components）
5. THE Type_Checker SHALL 通过类型检查（无错误）
6. THE System SHALL 在浏览器中正常运行（所有服务功能正常）


### 需求 7：添加 Contexts 目录

**用户故事：** 作为开发者，我希望集中管理 React Context，以便更好地组织全局状态。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 创建 `src/contexts/` 目录
2. THE Code_Reorganization_Tool SHALL 识别可以提取为 Context 的全局状态（如 AuthContext, ThemeContext）
3. WHEN 创建新的 Context_Provider 时，THE Code_Reorganization_Tool SHALL 遵循命名规范：`<Name>Context.tsx`
4. THE Code_Reorganization_Tool SHALL 创建 `src/contexts/index.ts` 导出文件
5. THE Code_Reorganization_Tool SHALL 更新相关组件以使用新的 Context
6. THE Type_Checker SHALL 通过类型检查（无错误）
7. THE System SHALL 在浏览器中正常运行（Context 功能正常）

### 需求 8：完善 Plugin 系统结构

**用户故事：** 作为开发者，我希望规范化插件系统结构，以便更容易开发和维护插件。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 重组 `src/plugins/` 目录结构：
   - `src/plugins/core/` — 插件核心（类型定义、基类、工具）
   - `src/plugins/built-in/` — 内置插件（ocr-plugin 等）
   - `src/plugins/index.ts` — 统一导出
2. THE Code_Reorganization_Tool SHALL 将 `src/plugins/ocr-plugin/` 移动到 `src/plugins/built-in/ocr-plugin/`
3. THE Code_Reorganization_Tool SHALL 创建 `src/plugins/core/` 目录并定义插件接口
4. THE Code_Reorganization_Tool SHALL 更新所有 Import_Path 以使用新的插件路径
5. THE Type_Checker SHALL 通过类型检查（无错误）
6. THE System SHALL 在浏览器中正常运行（插件功能正常）

### 需求 9：添加测试目录结构

**用户故事：** 作为开发者，我希望建立规范的测试目录结构，以便未来添加自动化测试。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 创建 `src/__tests__/` 目录
2. THE Code_Reorganization_Tool SHALL 创建测试目录结构：
   - `src/__tests__/unit/` — 单元测试
   - `src/__tests__/integration/` — 集成测试
   - `src/__tests__/e2e/` — 端到端测试
   - `src/__tests__/fixtures/` — 测试数据
   - `src/__tests__/utils/` — 测试工具
3. THE Code_Reorganization_Tool SHALL 创建 `src/__tests__/README.md` 说明测试规范
4. WHEN 现有测试文件存在时，THE Code_Reorganization_Tool SHALL 将其移动到对应的测试目录
5. THE Code_Reorganization_Tool SHALL 创建示例测试文件（可选）
6. THE Type_Checker SHALL 通过类型检查（无错误）


### 需求 10：保持项目可运行状态

**用户故事：** 作为开发者，我希望每个重组步骤完成后项目都能正常运行，以便及时发现和修复问题。

#### 验收标准

1. WHEN 完成每个重组步骤后，THE Code_Reorganization_Tool SHALL 运行 `bun run type-check` 验证类型安全
2. THE Type_Checker SHALL 通过类型检查（无错误、无警告）
3. THE Code_Reorganization_Tool SHALL 在浏览器中手动测试核心功能：
   - 编辑器加载和编辑
   - AI 对话功能
   - Block 创建和引用
   - 文档保存和加载
   - 插件功能（OCR）
4. WHEN 发现功能异常时，THE Code_Reorganization_Tool SHALL 立即回滚并修复问题
5. THE Code_Reorganization_Tool SHALL 在每个步骤完成后创建 Git commit
6. THE System SHALL 在所有步骤完成后保持完整功能

### 需求 11：更新文档和配置

**用户故事：** 作为开发者，我希望更新项目文档和配置文件，以便反映新的目录结构。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 更新 `CLAUDE.md` 中的项目结构说明
2. THE Code_Reorganization_Tool SHALL 更新 `docs/ARCHITECTURE.md` 中的架构图
3. THE Code_Reorganization_Tool SHALL 更新 `.kiro/rules/structure.md` 中的目录说明
4. THE Code_Reorganization_Tool SHALL 更新 `tsconfig.json` 中的路径别名（如有必要）
5. THE Code_Reorganization_Tool SHALL 更新 `vite.config.ts` 中的路径配置（如有必要）
6. THE Code_Reorganization_Tool SHALL 创建 `docs/guide/phase5-reorganization-summary.md` 总结重组内容
7. THE Type_Checker SHALL 通过类型检查（无错误）

### 需求 12：依赖层级验证

**用户故事：** 作为开发者，我希望验证重组后的代码仍然遵守依赖层级规则，以便避免循环依赖。

#### 验收标准

1. THE Code_Reorganization_Tool SHALL 验证依赖方向：types → utils → storage → services → hooks → components
2. THE Code_Reorganization_Tool SHALL 确保 features 目录中的模块不违反依赖层级
3. THE Code_Reorganization_Tool SHALL 确保 services 层不依赖 hooks 或 components
4. THE Code_Reorganization_Tool SHALL 确保 hooks 层不依赖 components
5. WHEN 发现循环依赖时，THE Code_Reorganization_Tool SHALL 报告错误并提供修复建议
6. THE Type_Checker SHALL 通过类型检查（无错误）
7. THE System SHALL 在浏览器中正常运行（无循环依赖导致的问题）


## 执行计划

### 第 1 步：高优先级改进（立即行动）

**目标：** 解决当前存在的明显问题，提升代码质量。

**包含需求：**
- 需求 1：合并重复文件（useToast）
- 需求 2：统一样式管理
- 需求 3：添加 Constants 目录

**预计时间：** 2-3 小时

**验收标准：**
- 所有重复文件已合并
- CSS 文件已集中到 `src/styles/` 目录
- 常量已提取到 `src/constants/` 目录
- `bun run type-check` 通过
- 项目在浏览器中正常运行

**风险评估：**
- 🟢 低风险：文件合并和移动操作相对安全
- ⚠️ 注意事项：需要仔细更新所有 import 路径

---

### 第 2 步：中优先级改进（结构优化）

**目标：** 优化代码组织结构，提升可维护性。

**包含需求：**
- 需求 4：引入 Features 架构
- 需求 5：完善类型定义
- 需求 6：优化 Service 层

**预计时间：** 4-6 小时

**验收标准：**
- Features 架构已建立
- 类型定义已按用途分类
- Service 层已按职责分类
- `bun run type-check` 通过
- 项目在浏览器中正常运行

**风险评估：**
- 🟡 中风险：涉及大量文件移动和 import 路径更新
- ⚠️ 注意事项：需要特别注意依赖层级规则，避免循环依赖

---

### 第 3 步：低优先级改进（长期优化）

**目标：** 为未来扩展做准备，建立规范。

**包含需求：**
- 需求 7：添加 Contexts 目录
- 需求 8：完善 Plugin 系统结构
- 需求 9：添加测试目录结构

**预计时间：** 3-4 小时

**验收标准：**
- Contexts 目录已创建
- Plugin 系统结构已规范化
- 测试目录结构已建立
- `bun run type-check` 通过
- 项目在浏览器中正常运行

**风险评估：**
- 🟢 低风险：主要是创建新目录和移动少量文件
- ⚠️ 注意事项：Context 提取需要谨慎，避免过度抽象

---

### 贯穿所有步骤的需求

**包含需求：**
- 需求 10：保持项目可运行状态
- 需求 11：更新文档和配置
- 需求 12：依赖层级验证

**执行方式：**
- 每个步骤完成后立即验证
- 每个步骤完成后更新相关文档
- 每个步骤完成后创建 Git commit


## 最终目录结构

重组完成后，项目目录结构如下：

```
src/
├── features/              # 功能模块（新增）
│   ├── ai/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   ├── editor/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── extensions/
│   │   └── index.ts
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   └── blocks/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.ts
├── components/
│   ├── layout/            # 布局组件
│   ├── shared/            # 共享组件
│   └── ui/                # shadcn/ui 组件
├── services/
│   ├── api/               # API 层
│   │   ├── aiService.ts
│   │   └── authService.ts
│   ├── business/          # 业务逻辑
│   │   ├── blockCaptureService.ts
│   │   ├── blockReleaseService.ts
│   │   ├── exportService.ts
│   │   └── sessionService.ts
│   ├── integration/       # 第三方集成
│   │   ├── syncService.ts
│   │   ├── autoSyncService.ts
│   │   ├── gitIntegration.ts
│   │   └── ocrBlockService.ts
│   ├── core/              # 核心服务
│   │   ├── pluginAPI.ts
│   │   └── pluginRegistry.ts
│   └── index.ts
├── storage/
│   ├── core/              # 核心存储
│   │   └── database.ts
│   └── stores/            # 各类 Store
│       ├── blockStore.ts
│       ├── documentStore.ts
│       ├── projectStore.ts
│       ├── sessionStore.ts
│       ├── ocrPhotoStore.ts
│       ├── pluginConfigStore.ts
│       ├── usageStore.ts
│       └── index.ts
├── hooks/
│   ├── common/            # 通用 hooks
│   │   ├── use-toast.ts
│   │   ├── useLongPress.ts
│   │   ├── useSwipeGesture.ts
│   │   └── useViewport.ts
│   ├── features/          # 功能 hooks
│   │   ├── useAIChat.ts
│   │   ├── useAuth.ts
│   │   ├── useAutoSync.ts
│   │   ├── useBlockSearch.ts
│   │   └── useSession.ts
│   ├── layout/            # 布局 hooks
│   │   ├── useAppLayout.ts
│   │   └── useTabs.ts
│   └── index.ts
├── lib/
│   ├── supabase/
│   │   └── supabase.ts
│   ├── git/
│   │   └── gitIntegration.ts
│   └── utils/             # 合并原 utils
│       ├── uuid.ts
│       ├── date.ts
│       ├── markdown.ts
│       └── index.ts
├── plugins/
│   ├── core/              # 插件核心
│   │   ├── types.ts
│   │   ├── base.ts
│   │   └── index.ts
│   ├── built-in/          # 内置插件
│   │   └── ocr-plugin/
│   └── index.ts
├── types/
│   ├── models/            # 数据模型
│   │   ├── block.ts
│   │   ├── document.ts
│   │   ├── project.ts
│   │   └── chat.ts
│   ├── api/               # API 类型
│   │   └── index.ts
│   ├── common/            # 通用类型
│   │   ├── layout.ts
│   │   ├── plugin.ts
│   │   └── ocr.ts
│   └── index.ts
├── constants/             # 新增
│   ├── ui.ts
│   ├── storage.ts
│   ├── api.ts
│   ├── editor.ts
│   └── index.ts
├── contexts/              # 新增
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── index.ts
├── styles/
│   ├── global/
│   │   ├── index.css
│   │   └── responsive.css
│   ├── components/
│   │   ├── Editor.css
│   │   └── ...
│   └── themes/
│       └── (未来扩展)
├── __tests__/             # 新增
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   ├── utils/
│   └── README.md
├── index.css              # Design Token + Tailwind
├── App.tsx
└── main.tsx
```


## 风险评估

### 高风险项

1. **Import 路径更新遗漏**
   - 风险：大量文件移动可能导致部分 import 路径未更新
   - 缓解措施：使用 `smartRelocate` 工具自动更新引用；每步完成后运行 `bun run type-check`

2. **循环依赖引入**
   - 风险：Features 架构可能意外引入循环依赖
   - 缓解措施：严格遵守依赖层级规则；使用依赖分析工具验证

3. **运行时错误**
   - 风险：某些动态导入或路径可能在运行时才暴露问题
   - 缓解措施：每步完成后在浏览器中手动测试核心功能

### 中风险项

1. **CSS 样式丢失**
   - 风险：CSS 文件移动后可能导致样式加载失败
   - 缓解措施：仔细更新所有 CSS import 路径；在浏览器中验证样式

2. **常量提取不完整**
   - 风险：部分魔法值可能未被识别和提取
   - 缓解措施：分批提取，优先处理明显的魔法值；后续迭代继续优化

3. **Context 提取过度**
   - 风险：过度使用 Context 可能导致性能问题
   - 缓解措施：仅提取真正需要全局共享的状态；避免频繁更新的状态

### 低风险项

1. **测试目录创建**
   - 风险：仅创建目录结构，不涉及现有代码修改
   - 缓解措施：无需特殊措施

2. **文档更新**
   - 风险：文档更新不影响代码运行
   - 缓解措施：确保文档与实际结构一致

## 回滚策略

每个步骤完成后创建 Git commit，如果发现问题：

1. **立即回滚**：使用 `git reset --hard HEAD~1` 回滚到上一个 commit
2. **分析问题**：检查类型错误、运行时错误、样式问题
3. **修复后重试**：修复问题后重新执行该步骤
4. **验证通过**：确保 `bun run type-check` 通过且浏览器运行正常

## 验证清单

每个步骤完成后，执行以下验证：

### 类型检查
- [ ] 运行 `bun run type-check`
- [ ] 无类型错误
- [ ] 无类型警告

### 功能测试
- [ ] 编辑器加载和编辑正常
- [ ] AI 对话功能正常
- [ ] Block 创建和引用正常
- [ ] 文档保存和加载正常
- [ ] 插件功能（OCR）正常
- [ ] 样式显示正常
- [ ] 响应式布局正常

### 代码质量
- [ ] 无循环依赖
- [ ] 依赖层级正确
- [ ] 命名规范一致
- [ ] 文件组织清晰

### 文档更新
- [ ] `CLAUDE.md` 已更新
- [ ] `docs/ARCHITECTURE.md` 已更新
- [ ] `.kiro/rules/structure.md` 已更新
- [ ] 创建了重组总结文档

### Git 管理
- [ ] 创建了有意义的 commit message
- [ ] Commit 包含所有相关文件
- [ ] 可以安全回滚

## 成功标准

重组完成后，项目应满足以下标准：

1. **代码组织清晰**：目录结构符合最终目录结构定义
2. **无重复文件**：所有重复文件已合并
3. **类型安全**：`bun run type-check` 通过，无错误无警告
4. **功能完整**：所有功能在浏览器中正常运行
5. **依赖规范**：严格遵守依赖层级规则，无循环依赖
6. **文档同步**：所有文档已更新，反映新的目录结构
7. **可维护性提升**：代码更易理解、修改和扩展
8. **性能无退化**：重组不影响应用性能

## 后续优化建议

重组完成后，可以考虑以下优化：

1. **引入依赖分析工具**：如 `madge` 或 `dependency-cruiser`，自动检测循环依赖
2. **添加 ESLint 规则**：强制执行 import 路径规范和依赖层级规则
3. **建立测试覆盖率目标**：逐步提升测试覆盖率
4. **优化构建配置**：利用新的目录结构优化 Vite 构建性能
5. **引入代码分割**：基于 features 架构实现按需加载
6. **完善类型定义**：为所有 API 和服务添加完整的类型定义
7. **建立代码审查规范**：确保新代码遵守重组后的结构规范

---

**文档版本：** 1.0  
**创建日期：** 2026-04-16  
**最后更新：** 2026-04-16  
**状态：** 待审核
