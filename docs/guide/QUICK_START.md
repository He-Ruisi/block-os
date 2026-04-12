# BlockOS 快速上手

## 启动

```bash
cd block-os
bun install
bun run dev          # → http://localhost:5173
```

## 开发

```bash
bun run type-check   # TypeScript 类型检查（每次改代码后跑）
bun run build        # 构建生产版本
```

## 项目结构

详见 [ARCHITECTURE.md](../ARCHITECTURE.md)

## 文档导航

| 文档 | 用途 |
|------|------|
| [CLAUDE.md](../../CLAUDE.md) | AI/新人快速上手 + 关键约束 |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | 架构概览 + ADR 索引 |
| [todo.md](../todo.md) | 当前待办事项 |
| [CHANGELOG.md](../CHANGELOG.md) | 版本更新记录 |
| [spec/architecture/](../spec/architecture/) | 架构决策记录（ADR） |
| [spec/features/](../spec/features/) | 功能需求文档 |
| [spec/PRD/](../spec/PRD/) | 产品需求文档 |
| [guide/SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Supabase 配置指南 |

## 自动化

项目配置了 2 个 Hooks（`.kiro/hooks/`）：
- **Post-Session Documentation**：每轮对话结束后自动追加日志、更新 todo/spec
- **Auto Git Commit**：自动提交代码变更
