---
inclusion: always
---

# BlockOS 项目上下文

## 项目概述

BlockOS 是一个基于 Web 的知识管理和写作系统，结合了 AI 对话能力和块状知识组织。

**核心理念**：写作优先 + AI 辅助 + 块状知识管理

## 项目结构

```
block-os/
├── src/
│   ├── components/          # React 组件
│   │   ├── ActivityBar.tsx  # 左侧活动栏（36px）
│   │   ├── Editor.tsx       # 核心编辑器（TipTap）
│   │   └── RightPanel.tsx   # 右侧面板（320px，AI 对话区）
│   ├── styles/
│   │   └── index.css        # 全局样式
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── docs/
│   ├── logs/                # 工作日志
│   │   └── CHANGELOG.md     # 变更日志索引
│   ├── spec/                # 需求文档
│   │   ├── PRD/             # 产品需求文档
│   │   └── todo.md          # 待办事项清单
│   └── PHASE_*.md           # 阶段性文档
├── public/                  # 静态资源
├── .kiro/
│   ├── hooks/               # 自动化 hooks
│   └── steering/            # 项目规则和上下文
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 构建配置
```

## 技术栈

### 核心框架
- **React 18.3.1**: UI 框架
- **TypeScript 5.6.3**: 类型系统
- **Vite 6.0.3**: 构建工具和开发服务器

### 编辑器
- **TipTap 2.10.4**: 富文本编辑器核心
  - 基于 ProseMirror
  - 支持 Markdown 语法
  - 可扩展的节点和标记系统

### 包管理
- **Bun**: 默认包管理器和运行时
  - 安装路径: `~/.bun/bin/bun`
  - 使用 `bun add` 安装依赖
  - 使用 `bun run` 执行脚本

### 开发工具
- **@vitejs/plugin-react**: React 支持
- **@types/react**: React 类型定义
- **@types/react-dom**: React DOM 类型定义

## 设计系统

### 布局
- **三栏布局**: Activity Bar (36px) + 编辑器 (flex-grow) + 右侧面板 (320px)
- **CSS Grid**: 响应式布局实现
- **编辑器宽度**: 最大 680px，居中显示

### 样式规范
- **CSS 变量**: 统一主题色管理
- **色系**: 灰度色系 + 紫色强调色
- **圆角**: 统一 6px
- **参考**: VSCode 设计语言

### 组件规范
- 每个组件独立 CSS 文件
- 使用 `.tsx` 扩展名
- 类型安全优先

## 开发约束

### 代码规范
1. **类型安全**: 所有代码必须通过 TypeScript 类型检查
2. **组件化**: UI 拆分为独立可复用组件
3. **最小化实现**: 只实现必要功能，避免过度设计
4. **渐进增强**: 分阶段实现功能

### 工作流
1. 使用 `bun install` 安装依赖
2. 使用 `bun run dev` 启动开发服务器
3. 使用 `bun run type-check` 进行类型检查
4. 代码修改后必须通过类型检查

### 自动化
- **daily-changelog-logger**: 每轮对话后生成工作日志
- **spec-todo-tracker**: 自动管理需求文档和待办清单
- **auto-git-commit**: 自动提交代码变更

## 当前状态

### 已完成 (Phase 1)
- ✅ 项目结构搭建
- ✅ 三栏布局实现
- ✅ TipTap 编辑器集成
- ✅ 基础 Markdown 支持（H1/H2/Bold/Italic/List）
- ✅ Activity Bar 组件
- ✅ 右侧面板占位

### 进行中 (Phase 2)
- 🚧 AI 对话集成（xiaomi mimo API）
- 🚧 对话界面实现
- 🚧 AI 输出写入编辑器
- 🚧 文字捕获为 Block

### 计划中
- 📋 Phase 3: Block 系统（双向链接、块引用）
- 📋 Phase 4: 本地存储与 Git 集成

## 限制和注意事项

### 技术限制
- 仅支持现代浏览器（ES2020+）
- 需要 Bun 运行时环境
- TypeScript strict 模式

### 设计限制
- 编辑器永远是主角，占据最大空间
- 保持界面简洁，避免功能堆砌
- 优先考虑写作体验

### 开发限制
- 不自动添加测试（除非明确要求）
- 不过度优化（先实现再优化）
- 保持代码简洁可读

## 参考文档

- [产品需求文档](../docs/spec/PRD/BlockOS_PRD.md)
- [待办事项](../docs/spec/todo.md)
- [变更日志](../docs/logs/CHANGELOG.md)
