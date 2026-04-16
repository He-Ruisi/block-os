# 设计文档：代码重组和架构优化（Phase 5）

## 概述

本设计文档描述了 BlockOS Phase 5 代码重组的技术实现方案。重组分为 3 个步骤执行，每步完成后项目保持可运行状态。

## 设计原则

1. **渐进式重构**：分步执行，每步独立验证
2. **零破坏性**：保持所有功能不变，只优化结构
3. **类型安全**：每步完成后 TypeScript 类型检查必须通过
4. **依赖层级**：严格遵守 types → utils → storage → services → hooks → components
5. **自动化优先**：使用 `smartRelocate` 自动更新 import 路径

## 架构设计

### 当前目录结构（Step 1 完成后）

```
src/
├── types/              # 类型定义（已存在）
├── utils/              # 工具函数（已存在）
├── storage/            # IndexedDB Store（已存在）
├── services/           # 业务逻辑（已存在，需重组）
├── editor/             # TipTap 扩展（已存在）
├── hooks/              # React Hooks（已存在，需重组）
├── components/         # React 组件（已存在）
├── lib/                # 第三方集成（已存在）
├── plugins/            # 插件系统（已存在，需重组）
├── constants/          # ✅ 常量定义（Step 1 完成）
├── styles/             # ✅ 样式文件（Step 1 完成）
├── index.css           # Design Token + Tailwind
├── App.tsx
└── main.tsx
```

### 目标目录结构（Step 2-3 完成后）

```
src/
├── features/              # 功能模块（Step 2 新增）
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
├── services/              # Step 2 重组
│   ├── api/               # API 层
│   ├── business/          # 业务逻辑
│   ├── integration/       # 第三方集成
│   ├── core/              # 核心服务
│   └── index.ts
├── storage/
│   ├── core/              # 核心存储
│   └── stores/            # 各类 Store
├── hooks/
│   ├── common/            # 通用 hooks
│   ├── features/          # 功能 hooks
│   ├── layout/            # 布局 hooks
│   └── index.ts
├── lib/
│   ├── supabase/
│   ├── git/
│   └── utils/             # 合并原 utils
├── plugins/               # Step 3 重组
│   ├── core/              # 插件核心
│   ├── built-in/          # 内置插件
│   └── index.ts
├── types/                 # Step 2 重组
│   ├── models/            # 数据模型
│   ├── api/               # API 类型
│   ├── common/            # 通用类型
│   └── index.ts
├── constants/             # ✅ Step 1 完成
├── contexts/              # Step 3 新增
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── index.ts
├── styles/                # ✅ Step 1 完成
├── __tests__/             # Step 3 新增
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── utils/
├── index.css
├── App.tsx
└── main.tsx
```

## Step 2: 中优先级改进

### 2.1 引入 Features 架构

**设计思路**：
- 按功能域组织代码，而非按技术类型
- 每个 feature 包含相关的 components、hooks、services
- 保持依赖层级规则，避免循环依赖

**Feature 划分**：

1. **ai** - AI 对话功能
   - components: AIImmersivePanel, ChatLayout, ChatHeader, ChatInput, MessageContent
   - hooks: useAIChat, useSession
   - services: aiService, sessionService

2. **editor** - 编辑器功能
   - components: Editor, EditorBubbleMenu, SuggestionMenu
   - hooks: (如果有)
   - extensions: 所有 TipTap 扩展

3. **auth** - 认证功能
   - components: LoginPage, RegisterPage
   - hooks: useAuth
   - services: authService

4. **blocks** - Block 系统功能
   - components: BlockSpacePanel, BlockDetailPanel, BlockDerivativeSelector, DocumentBlocksPanel
   - hooks: useBlockSearch
   - services: blockCaptureService, blockReleaseService, exportService

**实现方案**：

1. 创建 feature 目录结构
2. 使用 `smartRelocate` 移动组件到对应 feature
3. 创建 index.ts 导出文件
4. 验证依赖层级（services 不依赖 hooks/components，hooks 不依赖 components）

### 2.2 完善类型定义

**实现方案**：

1. 创建子目录：`models/`, `api/`, `common/`
2. 移动类型文件：
   - `block.ts`, `document.ts`, `project.ts`, `chat.ts` → `models/`
   - `layout.ts`, `plugin.ts`, `ocr.ts` → `common/`
3. 更新 `index.ts` 重新导出所有类型
4. 使用 `smartRelocate` 自动更新引用

### 2.3 优化 Service 层

**实现方案**：

1. 创建子目录：`api/`, `business/`, `integration/`, `core/`
2. 文件分类：
   - **API 层**：aiService, authService
   - **业务逻辑层**：blockCaptureService, blockReleaseService, exportService, sessionService
   - **第三方集成层**：syncService, autoSyncService, gitIntegration, ocrBlockService
   - **核心服务层**：pluginAPI, pluginRegistry
3. 使用 `smartRelocate` 移动文件
4. 创建 `index.ts` 统一导出

## Step 3: 低优先级改进

### 3.1 添加 Contexts 目录

**实现方案**：

1. 创建 `src/contexts/` 目录
2. 识别可提取的 Context（AuthContext, ThemeContext）
3. 创建 Context 文件（可选，为未来扩展做准备）
4. 创建 `index.ts` 导出文件

### 3.2 完善 Plugin 系统结构

**实现方案**：

1. 创建子目录：`core/`, `built-in/`
2. 移动 `ocr-plugin/` 到 `built-in/ocr-plugin/`
3. 创建插件核心文件（types.ts, base.ts）
4. 创建 `index.ts` 统一导出
5. 使用 `smartRelocate` 自动更新引用

### 3.3 添加测试目录结构

**实现方案**：

1. 创建目录结构：`unit/`, `integration/`, `e2e/`, `fixtures/`, `utils/`
2. 创建 `README.md` 说明测试规范
3. 创建示例测试文件（可选）

## 贯穿所有步骤的任务

### 保持项目可运行状态

**验证流程**：

1. **类型检查**：`bun run type-check` - 必须 0 错误、0 警告
2. **开发服务器**：`bun run dev` - 必须成功启动，无控制台错误
3. **功能测试**（浏览器）：
   - 编辑器加载和编辑
   - AI 对话功能
   - Block 创建和引用
   - 文档保存和加载
   - 插件功能（OCR）
   - 样式显示正常
   - 响应式布局正常
4. **Git Commit**：每个步骤完成后创建有意义的 commit

### 更新文档和配置

**需要更新的文件**：

1. **CLAUDE.md** - 更新项目结构说明
2. **docs/ARCHITECTURE.md** - 更新架构图和目录结构
3. **.kiro/rules/structure.md** - 更新目录说明和依赖层级规则
4. **tsconfig.json** - 添加路径别名（如有必要）
5. **vite.config.ts** - 添加路径配置（如有必要）
6. **docs/guide/phase5-reorganization-summary.md** - 创建重组总结文档

### 依赖层级验证

**验证规则**：

1. **types** - 零依赖
2. **utils** - 只依赖 types
3. **storage** - 依赖 types + utils
4. **services** - 依赖 types + utils + storage
5. **hooks** - 依赖 types + storage + services
6. **components** - 依赖以上所有层
7. **features** - 遵守以上规则，内部按层级组织

**验证方法**：

1. 手动检查 import 语句
2. 使用工具检查（可选）：`madge --circular --extensions ts,tsx src/`
3. TypeScript 类型检查：`bun run type-check`

## 技术决策记录

### 为什么使用 Features 架构？

**优点**：
- 按功能域组织，代码内聚性高
- 易于理解和维护
- 支持功能独立开发和测试
- 便于代码复用和模块化

**缺点**：
- 需要重新组织大量文件
- 可能引入循环依赖风险
- 学习成本（团队需要适应新结构）

**决策**：采用 Features 架构，因为项目已经有一定规模，按功能域组织更有利于长期维护。

### 为什么分 3 步执行？

**原因**：
- 降低风险：每步独立验证，出问题可以快速回滚
- 渐进式重构：不影响正常开发，可以分批完成
- 优先级明确：先解决明显问题，再优化结构，最后完善规范

### 为什么使用 smartRelocate？

**原因**：
- 自动更新 import 路径，减少手动工作
- 降低出错风险
- 提高重构效率

**注意事项**：
- 仅用于移动文件，不修改文件内容
- 移动前确保文件没有被其他人修改
- 移动后立即验证类型检查

## 风险缓解措施

### Import 路径更新遗漏

**缓解措施**：
1. 使用 `smartRelocate` 自动更新
2. 使用 `grepSearch` 查找所有引用
3. 每步完成后运行 `bun run type-check`
4. 在浏览器中手动测试核心功能

### 循环依赖引入

**缓解措施**：
1. 严格遵守依赖层级规则
2. Features 内部按层级组织
3. 使用依赖分析工具验证
4. 类型检查会检测部分循环依赖

### 运行时错误

**缓解措施**：
1. 每步完成后在浏览器中手动测试
2. 测试核心功能流程
3. 检查控制台错误
4. 发现问题立即回滚并修复
