# BlockOS - 写作优先的知识操作系统

## 当前版本：v0.1 MVP

这是 BlockOS 的第一个最小化版本，专注于核心写作功能。

### 已实现功能

- ✅ 三栏布局（Activity Bar + 编辑器 + 右侧面板）
- ✅ 基础 Markdown 编辑器（基于 TipTap）
- ✅ 基础格式化工具栏（加粗、斜体、标题）
- ✅ 简洁的 UI 设计
- ✅ 完善的文档架构和自动化系统

### 待实现功能

- ⏳ AI 对话集成
- ⏳ 块（Block）系统
- ⏳ 双向链接 `[[]]`
- ⏳ 块引用 `(())`
- ⏳ Git 集成
- ⏳ 本地文件存储

## 快速开始

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 类型检查
bun run type-check

# 构建
bun run build
```

访问 http://localhost:5173 开始使用！

## 📚 文档导航

- **新手必读**
  - [快速开始](docs/QUICK_START.md) - 5 分钟上手
  - [项目架构](docs/ARCHITECTURE.md) - 深入了解结构
  - [改进总结](docs/IMPROVEMENTS_SUMMARY.md) - 架构优化说明

- **功能需求**
  - [功能概览](docs/spec/features/README.md)
  - [编辑器功能](docs/spec/features/editor/)
  - [待办清单](docs/todo.md)

- **开发日志**
  - [今日日志](docs/logs/2026-04/2026-04-09.md)
  - [月度索引](docs/logs/2026-04/index.md)

## 项目特色

### 🎯 写作优先
编辑器永远是主角，占据最大空间，提供流畅的写作体验。

### 🤖 AI 原生（规划中）
AI 作为副驾驶，直接在文档中生成内容，而非传统的对话气泡。

### 🧩 块系统（规划中）
一切内容都是可复用的块（Block），支持双向链接和块引用。

### 📁 完善的架构
- 按功能分类的需求文档
- 每天一个文件的工作日志
- 自动化的文档和代码管理

## 技术栈

- React 18
- TypeScript
- Vite
- TipTap (编辑器)
- Bun (包管理器)

## 自动化功能

项目配置了 3 个自动化 Hooks 和 1 个专业 Skill：

### Hooks（自动触发）
1. **Daily Changelog Logger**: 每轮对话结束自动追加工作日志
2. **Spec & Todo Tracker**: 自动提取需求并按功能分类
3. **Auto Git Commit**: 自动提交代码变更

配置文件在 `.kiro/hooks/`

### Skills（手动激活）
1. **Fix Skill**: 系统化 bug 修复工具
   - 自动扫描历史相似问题
   - 标准化诊断和修复流程
   - 记录到 bugs.md 知识库
   - 使用方式: `#fix [问题描述]`
   - [快速参考](docs/FIX_SKILL_QUICK_REF.md)

配置文件在 `.kiro/skills/`

## 开发规范

- **文档组织**: 按功能分类（editor/ai/block-system/storage）
- **日志管理**: 每天一个文件，追加模式
- **命名规范**: kebab-case (文件), PascalCase (组件)
- **类型安全**: TypeScript Strict Mode

详见 [ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 项目结构

```
block-os/
├── src/                    # 源代码
│   ├── components/         # React 组件
│   └── styles/             # 样式文件
├── docs/                   # 项目文档
│   ├── spec/features/      # 功能需求（按模块分类）
│   ├── logs/YYYY-MM/       # 工作日志（每天一个）
│   └── guide/              # 使用指南
├── .kiro/hooks/            # 自动化配置
└── public/                 # 静态资源
```

## 里程碑

- ✅ 2026-04-09: Phase 1 完成 - 基础编辑器
- ✅ 2026-04-09: 项目架构优化
- ⏳ Phase 2: AI 对话集成
- ⏳ Phase 3: Block 系统

## License

MIT
