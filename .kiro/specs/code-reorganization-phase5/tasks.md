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

### 当前目录结构

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
├── index.css           # Design Token + Tailwind
├── App.tsx
└── main.tsx
```

### 目标目录结构

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
├── plugins/
│   ├── core/              # 插件核心
│   ├── built-in/          # 内置插件
│   └── index.ts
├── types/
│   ├── models/            # 数据模型
│   ├── api/               # API 类型
│   ├── common/            # 通用类型
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
│   ├── components/
│   └── themes/
├── __tests__/             # 新增
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── utils/
├── index.css              # Design Token + Tailwind
├── App.tsx
└── main.tsx
```

## 第 1 步：高优先级改进

### 1.1 合并重复文件

**问题分析**：
- `src/hooks/useToast.ts` 和 `src/hooks/use-toast.ts` 重复
- `use-toast.ts` 是 shadcn/ui 标准命名（kebab-case）
- `useToast.ts` 可能是早期创建的文件

**实现方案**：
1. 检查两个文件的内容差异
2. 如果内容相同，直接删除 `useToast.ts`
3. 如果内容不同，合并功能到 `use-toast.ts`
4. 使用 `grepSearch` 查找所有引用 `useToast.ts` 的文件
5. 使用 `strReplace` 更新所有 import 路径
6. 删除 `useToast.ts` 文件
7. 运行 `bun run type-check` 验证

**风险控制**：
- 使用 `grepSearch` 确保找到所有引用
- 逐个文件更新 import 路径
- 每次更新后运行类型检查

### 1.2 统一样式管理

**问题分析**：
- CSS 文件分散在各组件目录中
- 难以维护和查找
- 缺乏统一的样式组织

**实现方案**：

1. **创建目录结构**：
   ```bash
   mkdir -p src/styles/global
   mkdir -p src/styles/components
   mkdir -p src/styles/themes
   ```

2. **移动全局样式**：
   - 保留 `src/index.css`（Design Token + Tailwind）
   - 如果存在 `src/styles/index.css`，合并到 `src/index.css`
   - 删除 `src/App.css`（如果为空或已迁移）

3. **移动组件样式**：
   - 使用 `fileSearch` 查找所有 `.css` 文件
   - 使用 `smartRelocate` 移动到 `src/styles/components/`
   - 自动更新所有 import 路径

4. **验证**：
   - 运行 `bun run type-check`
   - 在浏览器中验证样式显示正常

**文件映射**：
```
src/components/editor/Editor.css → src/styles/components/Editor.css
src/components/layout/Sidebar.css → src/styles/components/Sidebar.css
...
```

### 1.3 添加 Constants 目录

**问题分析**：
- 代码中存在大量魔法数字和魔法字符串
- 难以维护和修改
- 缺乏统一的常量管理

**实现方案**：

1. **创建常量文件**：

**src/constants/ui.ts**：
```typescript
// UI 相关常量

// 尺寸
export const UI_SIZES = {
  SIDEBAR_WIDTH: 240,
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 400,
  RIGHT_PANEL_WIDTH: 320,
  RIGHT_PANEL_MIN_WIDTH: 280,
  RIGHT_PANEL_MAX_WIDTH: 600,
  ACTIVITY_BAR_WIDTH: 48,
  TAB_HEIGHT: 36,
  TOOLBAR_HEIGHT: 40,
  STATUS_BAR_HEIGHT: 24,
} as const;

// 间距
export const UI_SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

// 动画时长（毫秒）
export const UI_ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// 断点（响应式）
export const UI_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;
```

**src/constants/storage.ts**：
```typescript
// 存储相关常量

// IndexedDB 数据库名
export const DB_NAME = 'blockos-db';
export const DB_VERSION = 1;

// 对象存储名称
export const STORE_NAMES = {
  PROJECTS: 'projects',
  DOCUMENTS: 'documents',
  BLOCKS: 'blocks',
  SESSIONS: 'sessions',
  OCR_PHOTOS: 'ocr-photos',
  PLUGIN_CONFIGS: 'plugin-configs',
  USAGES: 'usages',
} as const;

// localStorage 键名
export const LOCAL_STORAGE_KEYS = {
  LAYOUT_PREFERENCES: 'blockos-layout-preferences',
  STARRED_ITEMS: 'blockos-starred-items',
  CURRENT_PROJECT: 'blockos-current-project',
  CURRENT_DOCUMENT: 'blockos-current-document',
  VIEW_MODE: 'blockos-view-mode',
  THEME: 'blockos-theme',
} as const;
```

**src/constants/api.ts**：
```typescript
// API 相关常量

// API 端点
export const API_ENDPOINTS = {
  MIMO: 'https://api.xiaomi.com/v1/chat/completions',
  DEEPSEEK: 'https://api.deepseek.com/v1/chat/completions',
  PADDLE_OCR: '/api/ocr/layout-parsing',
} as const;

// 超时时间（毫秒）
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  OCR: 60000,
  UPLOAD: 120000,
} as const;

// 重试次数
export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;
```

**src/constants/editor.ts**：
```typescript
// 编辑器相关常量

// 快捷键
export const EDITOR_SHORTCUTS = {
  NEW_TAB: 'Mod-t',
  CLOSE_TAB: 'Mod-w',
  TOGGLE_SIDEBAR: 'Mod-b',
  SAVE: 'Mod-s',
  SEND_TO_AI: 'Mod-Shift-a',
} as const;

// 默认内容
export const EDITOR_DEFAULTS = {
  UNTITLED_DOCUMENT: '无标题文档',
  AI_CONVERSATION_NOTE: 'AI 对话笔记',
  PLACEHOLDER: '开始写作...',
} as const;

// 编辑器配置
export const EDITOR_CONFIG = {
  MAX_CONTENT_WIDTH: 760,
  AUTO_SAVE_DELAY: 2000,
  DEBOUNCE_DELAY: 500,
} as const;
```

**src/constants/index.ts**：
```typescript
// 统一导出所有常量

export * from './ui';
export * from './storage';
export * from './api';
export * from './editor';
```

2. **识别和替换魔法值**：
   - 使用 `grepSearch` 查找硬编码的数字和字符串
   - 优先处理明显的魔法值（如 240、320、'blockos-db' 等）
   - 使用 `strReplace` 替换为常量引用

3. **验证**：
   - 运行 `bun run type-check`
   - 确保所有功能正常

## 第 2 步：中优先级改进

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
   - hooks: useEditor (如果有)
   - extensions: 所有 TipTap 扩展

3. **auth** - 认证功能
   - components: LoginPage, RegisterPage
   - hooks: useAuth
   - services: authService (如果有)

4. **blocks** - Block 系统功能
   - components: BlockSpacePanel, BlockDetailPanel, BlockDerivativeSelector, DocumentBlocksPanel
   - hooks: useBlockSearch
   - services: blockCaptureService, blockReleaseService, exportService

**实现方案**：

1. **创建 feature 目录结构**：
   ```bash
   mkdir -p src/features/ai/{components,hooks,services}
   mkdir -p src/features/editor/{components,hooks,extensions}
   mkdir -p src/features/auth/{components,hooks,services}
   mkdir -p src/features/blocks/{components,hooks,services}
   ```

2. **移动文件**：
   - 使用 `smartRelocate` 移动组件到对应 feature
   - 自动更新 import 路径

3. **创建 index.ts 导出文件**：
   ```typescript
   // src/features/ai/index.ts
   export * from './components/AIImmersivePanel';
   export * from './components/ChatLayout';
   export * from './hooks/useAIChat';
   export * from './services/aiService';
   ```

4. **验证依赖层级**：
   - 确保 features 不违反依赖层级规则
   - services 不依赖 hooks 或 components
   - hooks 不依赖 components

### 2.2 完善类型定义

**实现方案**：

1. **创建子目录**：
   ```bash
   mkdir -p src/types/models
   mkdir -p src/types/api
   mkdir -p src/types/common
   ```

2. **移动类型文件**：
   - `block.ts` → `models/block.ts`
   - `document.ts` → `models/document.ts`
   - `project.ts` → `models/project.ts`
   - `chat.ts` → `models/chat.ts`
   - `layout.ts` → `common/layout.ts`
   - `plugin.ts` → `common/plugin.ts`
   - `ocr.ts` → `common/ocr.ts`

3. **更新 index.ts**：
   ```typescript
   // src/types/index.ts
   export * from './models/block';
   export * from './models/document';
   export * from './models/project';
   export * from './models/chat';
   export * from './common/layout';
   export * from './common/plugin';
   export * from './common/ocr';
   ```

4. **使用 smartRelocate 自动更新引用**

### 2.3 优化 Service 层

**实现方案**：

1. **创建子目录**：
   ```bash
   mkdir -p src/services/api
   mkdir -p src/services/business
   mkdir -p src/services/integration
   mkdir -p src/services/core
   ```

2. **文件分类和移动**：

**API 层**（直接调用外部 API）：
- `aiService.ts` → `api/aiService.ts`
- `authService.ts` → `api/authService.ts`（如果存在）

**业务逻辑层**（处理业务规则）：
- `blockCaptureService.ts` → `business/blockCaptureService.ts`
- `blockReleaseService.ts` → `business/blockReleaseService.ts`
- `exportService.ts` → `business/exportService.ts`
- `sessionService.ts` → `business/sessionService.ts`

**第三方集成层**（集成外部服务）：
- `syncService.ts` → `integration/syncService.ts`
- `autoSyncService.ts` → `integration/autoSyncService.ts`
- `gitIntegration.ts` → `integration/gitIntegration.ts`
- `ocrBlockService.ts` → `integration/ocrBlockService.ts`

**核心服务层**（系统核心功能）：
- `pluginAPI.ts` → `core/pluginAPI.ts`
- `pluginRegistry.ts` → `core/pluginRegistry.ts`

3. **创建 index.ts**：
   ```typescript
   // src/services/index.ts
   export * from './api/aiService';
   export * from './business/blockCaptureService';
   export * from './integration/syncService';
   export * from './core/pluginAPI';
   ```

4. **使用 smartRelocate 自动更新引用**

## 第 3 步：低优先级改进

### 3.1 添加 Contexts 目录

**实现方案**：

1. **创建目录**：
   ```bash
   mkdir -p src/contexts
   ```

2. **识别可提取的 Context**：
   - 当前项目中可能没有显式的 Context
   - 可以考虑提取：AuthContext（用户认证状态）、ThemeContext（主题切换）

3. **创建示例 Context**（可选）：

**src/contexts/AuthContext.tsx**：
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 实现逻辑...

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

4. **创建 index.ts**：
   ```typescript
   // src/contexts/index.ts
   export * from './AuthContext';
   export * from './ThemeContext';
   ```

### 3.2 完善 Plugin 系统结构

**实现方案**：

1. **创建子目录**：
   ```bash
   mkdir -p src/plugins/core
   mkdir -p src/plugins/built-in
   ```

2. **移动文件**：
   - `src/plugins/ocr-plugin/` → `src/plugins/built-in/ocr-plugin/`

3. **创建插件核心文件**：

**src/plugins/core/types.ts**：
```typescript
// 插件类型定义（从 src/types/plugin.ts 移动或引用）
export * from '@/types/common/plugin';
```

**src/plugins/core/base.ts**：
```typescript
// 插件基类（可选）
import type { IPlugin } from './types';

export abstract class BasePlugin implements IPlugin {
  // 通用实现...
}
```

4. **创建 index.ts**：
   ```typescript
   // src/plugins/index.ts
   export * from './core/types';
   export * from './core/base';
   export * from './built-in/ocr-plugin';
   ```

5. **使用 smartRelocate 自动更新引用**

### 3.3 添加测试目录结构

**实现方案**：

1. **创建目录结构**：
   ```bash
   mkdir -p src/__tests__/unit
   mkdir -p src/__tests__/integration
   mkdir -p src/__tests__/e2e
   mkdir -p src/__tests__/fixtures
   mkdir -p src/__tests__/utils
   ```

2. **创建 README.md**：

**src/__tests__/README.md**：
```markdown
# BlockOS 测试指南

## 目录结构

- `unit/` - 单元测试（测试单个函数或组件）
- `integration/` - 集成测试（测试多个模块协作）
- `e2e/` - 端到端测试（测试完整用户流程）
- `fixtures/` - 测试数据和模拟数据
- `utils/` - 测试工具函数

## 测试规范

### 单元测试

文件命名：`<ComponentName>.test.ts` 或 `<functionName>.test.ts`

示例：
\`\`\`typescript
// src/__tests__/unit/utils/uuid.test.ts
import { generateUUID } from '@/utils/uuid';

describe('generateUUID', () => {
  it('should generate a valid UUID', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
\`\`\`

### 集成测试

测试多个模块协作，如 Store + Service。

### 端到端测试

测试完整用户流程，如"创建项目 → 创建文档 → 编辑内容 → 保存"。

## 运行测试

\`\`\`bash
# 运行所有测试
bun test

# 运行单元测试
bun test src/__tests__/unit

# 运行集成测试
bun test src/__tests__/integration

# 运行 e2e 测试
bun test src/__tests__/e2e
\`\`\`

## 测试覆盖率

\`\`\`bash
bun test --coverage
\`\`\`

目标覆盖率：
- 工具函数（utils）：≥ 90%
- 业务逻辑（services）：≥ 80%
- 组件（components）：≥ 70%
```

3. **创建示例测试文件**（可选）：

**src/__tests__/unit/utils/uuid.test.ts**：
```typescript
import { generateUUID } from '@/utils/uuid';

describe('generateUUID', () => {
  it('should generate a valid UUID', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});
```

## 贯穿所有步骤的任务

### 保持项目可运行状态

**验证流程**：

1. **类型检查**：
   ```bash
   bun run type-check
   ```
   - 必须 0 错误、0 警告

2. **开发服务器**：
   ```bash
   bun run dev
   ```
   - 必须成功启动
   - 无控制台错误

3. **功能测试**（浏览器）：
   - 编辑器加载和编辑
   - AI 对话功能
   - Block 创建和引用
   - 文档保存和加载
   - 插件功能（OCR）
   - 样式显示正常
   - 响应式布局正常

4. **Git Commit**：
   ```bash
   git add .
   git commit -m "refactor: [step-name] - [description]"
   ```

### 更新文档和配置

**需要更新的文件**：

1. **CLAUDE.md**：
   ```markdown
   ## 项目结构

   \`\`\`
   src/
   ├── features/              # 功能模块
   ├── components/
   ├── services/
   │   ├── api/              # API 层
   │   ├── business/         # 业务逻辑
   │   └── integration/      # 第三方集成
   ├── storage/
   ├── hooks/
   ├── lib/
   ├── plugins/
   ├── types/
   ├── constants/            # 常量定义
   ├── contexts/             # React Context
   ├── styles/
   └── __tests__/            # 测试文件
   \`\`\`
   ```

2. **docs/ARCHITECTURE.md**：
   - 更新架构图
   - 更新目录结构说明
   - 更新依赖层级图

3. **.kiro/rules/structure.md**：
   - 更新目录说明
   - 更新命名规范
   - 更新依赖层级规则

4. **tsconfig.json**（如有必要）：
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@features/*": ["./src/features/*"],
         "@components/*": ["./src/components/*"],
         "@services/*": ["./src/services/*"],
         "@hooks/*": ["./src/hooks/*"],
         "@types/*": ["./src/types/*"],
         "@constants/*": ["./src/constants/*"],
         "@contexts/*": ["./src/contexts/*"]
       }
     }
   }
   ```

5. **vite.config.ts**（如有必要）：
   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
       '@features': path.resolve(__dirname, './src/features'),
       '@components': path.resolve(__dirname, './src/components'),
       '@services': path.resolve(__dirname, './src/services'),
       '@hooks': path.resolve(__dirname, './src/hooks'),
       '@types': path.resolve(__dirname, './src/types'),
       '@constants': path.resolve(__dirname, './src/constants'),
       '@contexts': path.resolve(__dirname, './src/contexts'),
     },
   },
   ```

6. **docs/guide/phase5-reorganization-summary.md**：
   - 创建重组总结文档
   - 记录所有变更
   - 提供迁移指南

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

1. **手动检查**：
   - 检查每个文件的 import 语句
   - 确保不违反依赖层级

2. **工具检查**（可选）：
   ```bash
   # 安装依赖分析工具
   bun add -D madge

   # 检测循环依赖
   npx madge --circular --extensions ts,tsx src/

   # 生成依赖图
   npx madge --image graph.svg src/
   ```

3. **类型检查**：
   - TypeScript 编译器会检测部分循环依赖
   - 运行 `bun run type-check` 验证

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
