# BlockOS - 写作优先的知识操作系统

## 当前版本：v0.1 MVP

这是 BlockOS 的第一个最小化版本，专注于核心写作功能。

### 已实现功能

- ✅ 三栏布局（Activity Bar + 编辑器 + 右侧面板）
- ✅ 基础 Markdown 编辑器（基于 TipTap）
- ✅ 基础格式化工具栏（加粗、斜体、标题）
- ✅ 简洁的 UI 设计

### 待实现功能

- ⏳ AI 对话集成
- ⏳ 块（Block）系统
- ⏳ 双向链接 `[[]]`
- ⏳ 块引用 `(())`
- ⏳ Git 集成
- ⏳ 本地文件存储

## 开发

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

## 技术栈

- React 18
- TypeScript
- Vite
- TipTap (编辑器)
- Bun (包管理器)
