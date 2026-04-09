# BlockOS 快速开始指南

## 🚀 5 分钟上手

### 1. 安装依赖
```bash
cd block-os
bun install
```

### 2. 启动开发服务器
```bash
bun run dev
```

访问 http://localhost:5173

### 3. 开始写作
- 在编辑器中输入文本
- 使用工具栏格式化（B=加粗, I=斜体, H1/H2=标题）
- 支持 Markdown 语法自动转换

## 📁 项目结构速查

```
block-os/
├── src/components/     # 组件代码在这里
├── docs/
│   ├── spec/features/  # 功能需求文档
│   ├── logs/YYYY-MM/   # 工作日志（每天一个）
│   └── todo.md         # 待办清单
└── .kiro/hooks/        # 自动化配置
```

## 📝 常用命令

```bash
# 开发
bun run dev              # 启动开发服务器
bun run type-check       # TypeScript 类型检查
bun run build            # 构建生产版本

# Git
git status               # 查看变更
git log --oneline -5     # 查看最近 5 次提交
```

## 📚 文档导航

### 新手必读
1. [README.md](../README.md) - 项目介绍
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构说明
3. [todo.md](./todo.md) - 当前任务

### 功能需求
- [编辑器功能](./spec/features/editor/) - 编辑器相关
- [AI 功能](./spec/features/ai/) - AI 对话（规划中）
- [Block 系统](./spec/features/block-system/) - 知识管理（规划中）

### 开发日志
- [今日日志](./logs/2026-04/2026-04-09.md)
- [月度索引](./logs/2026-04/index.md)

## 🔧 自动化功能

项目配置了 3 个自动化 Hooks：

1. **Daily Changelog Logger**: 每轮对话结束自动记录日志
2. **Spec & Todo Tracker**: 自动提取需求并更新待办
3. **Auto Git Commit**: 自动提交代码变更

配置文件在 `.kiro/hooks/`

## 💡 开发技巧

### 添加新功能
1. 在 `docs/spec/features/<category>/` 创建需求文档
2. 在 `docs/todo.md` 添加待办事项
3. 在 `src/components/` 实现组件
4. 更新日志记录进度

### 查找文档
- 按功能找需求: `docs/spec/features/<category>/`
- 按时间找日志: `docs/logs/YYYY-MM/YYYY-MM-DD.md`
- 看待办事项: `docs/todo.md`

### 调试问题
```bash
# 查看类型错误
bun run type-check

# 查看 Git 变更
git diff

# 查看最近日志
cat docs/logs/2026-04/2026-04-09.md
```

## 🎯 当前状态

- ✅ Phase 1: 基础编辑器 - **已完成**
- 🔄 Phase 2: AI 对话 - 规划中
- ⏳ Phase 3: Block 系统 - 规划中

查看详细进度: [todo.md](./todo.md)

## 🆘 遇到问题？

1. 查看 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解项目结构
2. 查看 [工作日志](./logs/) 了解最近变更
3. 查看 [需求文档](./spec/features/) 了解功能设计

## 📖 推荐阅读顺序

1. README.md - 了解项目
2. QUICK_START.md - 本文档
3. ARCHITECTURE.md - 深入架构
4. spec/features/README.md - 功能规划
5. logs/2026-04/index.md - 开发历程
