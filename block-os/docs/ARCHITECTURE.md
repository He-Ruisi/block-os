# BlockOS 项目架构文档

**最后更新**: 2026-04-09  
**版本**: v0.1

## 项目概述
BlockOS 是一个写作优先、AI 原生、插件化扩展的个人知识操作系统。

## 目录结构

```
block-os/
├── src/                          # 源代码
│   ├── components/               # React 组件
│   │   ├── ActivityBar.tsx       # 左侧活动栏
│   │   ├── Editor.tsx            # 核心编辑器
│   │   └── RightPanel.tsx        # 右侧面板
│   ├── styles/                   # 样式文件
│   ├── App.tsx                   # 主应用
│   └── main.tsx                  # 入口文件
│
├── docs/                         # 项目文档
│   ├── spec/                     # 需求规格
│   │   ├── PRD/                  # 产品需求文档
│   │   ├── features/             # 功能需求（按模块分类）
│   │   │   ├── editor/           # 编辑器功能
│   │   │   ├── ai/               # AI 功能
│   │   │   ├── block-system/     # Block 系统
│   │   │   └── storage/          # 存储功能
│   │   ├── prototype/            # 原型文件
│   │   └── archive/              # 已废弃需求
│   │
│   ├── guide/                    # 使用指南
│   │   ├── user/                 # 用户指南
│   │   └── developer/            # 开发者指南
│   │
│   ├── logs/                     # 工作日志
│   │   └── YYYY-MM/              # 按月组织
│   │       ├── YYYY-MM-DD.md     # 每天一个文件
│   │       └── index.md          # 月度索引
│   │
│   ├── attachs/                  # 附件（API 文档等）
│   ├── CHANGELOG.md              # 重要里程碑记录
│   ├── todo.md                   # 待办清单
│   └── ARCHITECTURE.md           # 本文档
│
├── .kiro/                        # Kiro 配置
│   ├── hooks/                    # 自动化 Hooks
│   └── steering/                 # 开发规范
│
├── public/                       # 静态资源
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置
└── README.md                     # 项目说明
```

## 文档组织原则

### 1. 按功能分类
需求文档按功能模块组织（editor/ai/block-system/storage），而非按时间。

**优点**:
- 快速定位某个功能的所有相关文档
- 便于功能迭代和版本管理
- 新成员快速了解模块职责

### 2. 每天一个日志
工作日志按月份组织，每天一个文件，追加模式更新。

**优点**:
- 减少文件数量，便于查找
- 完整记录一天的工作流程
- 月度索引提供快速导航

### 3. 清晰的层级
文档分为三个层级：
- **spec**: 需求和设计（What & Why）
- **guide**: 使用说明（How）
- **logs**: 工作记录（When & Who）

## 自动化 Hooks

### 1. Daily Changelog Logger
- **触发**: 每轮对话结束（agentStop）
- **功能**: 追加工作日志到当天文件
- **格式**: 时间 + 标题 + 内容 + 文件变更

### 2. Spec & Todo Tracker
- **触发**: 每轮对话结束（agentStop）
- **功能**: 提取新需求，更新文档和待办清单
- **分类**: 按功能模块（editor/ai/block-system/storage）

### 3. Auto Git Commit
- **触发**: 每轮对话结束（agentStop）
- **功能**: 自动提交代码变更
- **信息**: 时间戳 + 变更摘要

## 开发规范

### 命名规范
- **组件**: PascalCase (Editor.tsx)
- **样式**: kebab-case (editor.css)
- **文档**: kebab-case (basic-markdown.md)
- **日志**: YYYY-MM-DD.md

### 文档模板
每个功能需求文档应包含：
- 功能概述
- 用户故事
- 功能需求（核心/可选）
- 技术方案
- 实施计划
- 验收标准

### Git 提交规范
```
YYYY-MM-DD HH:mm: 变更摘要

详细说明（可选）
```

## 技术栈

### 前端
- **框架**: React 18
- **语言**: TypeScript 5
- **构建**: Vite 6
- **编辑器**: TipTap 2
- **包管理**: Bun

### 开发工具
- **IDE**: VSCode / Kiro
- **版本控制**: Git
- **代码规范**: TypeScript Strict Mode

## 参考资料

### 文档组织
- [Vue.js 文档结构](https://vuejs.org/guide/)
- [React 文档结构](https://react.dev/learn)
- [Rust 文档结构](https://doc.rust-lang.org/book/)

### 最佳实践
- [Git 最佳实践](https://git-scm.com/book/en/v2)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React 最佳实践](https://react.dev/learn/thinking-in-react)

## 版本历史

### v0.1 (2026-04-09)
- ✅ 项目初始化
- ✅ Phase 1 基础编辑器完成
- ✅ 文档架构优化
- ✅ Hooks 系统优化

### 下一版本计划
- Phase 2: AI 对话集成
- Phase 3: Block 系统
- 完善开发者指南
