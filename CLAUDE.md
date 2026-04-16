# BlockOS 项目指南

## 快速上手

```bash
bun install          # 安装依赖
bun run dev          # 启动开发服务器
bun run build        # 构建（tsc + vite build）
bun run type-check   # TypeScript 类型检查
```

## 技术栈
React 18 + TypeScript 5 + Vite 6 + TipTap 2 + IndexedDB + Bun

## 关键约束

1. **禁止循环依赖** — 依赖方向只能向下：types → utils → storage → services → hooks → features → components → App
2. **类型安全** — 所有函数参数和返回值必须有明确类型，修改后运行 `bun run type-check`
3. **单一职责** — 每个文件只做一件事
4. **不引入新框架** — 除非明确讨论
5. **内容/样式/模板分离** — Block 的来源信息、视觉表现、导出规则三层独立。详见 [ADR](./docs/spec/architecture/content-style-template.md)
6. **Features 架构** — 复杂功能按功能域组织（ai/editor/auth/blocks），每个 feature 包含相关的 components/hooks/services

## 核心概念

- **Block**：最小知识单元。隐式（文档段落自动生成）或显式（用户手动捕获）
- **SourceBlock**：TipTap 自定义节点，来源信息存在 attrs 中（不可编辑），内容可编辑
- **StyleTheme**：编辑/预览/审阅三套视觉主题
- **DocumentTemplate**：小说/博客/大纲三套导出模板

## 架构详情
→ [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 命名规范
- 组件: PascalCase (`Editor.tsx`)
- 工具/服务: camelCase (`aiService.ts`)
- 类型: camelCase (`block.ts`)
- CSS: 与组件同名 (`Editor.css`)
- Hooks: `use` 前缀 (`useAppLayout.ts`)
