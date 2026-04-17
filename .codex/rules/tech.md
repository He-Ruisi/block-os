# BlockOS 技术栈

## 核心技术
- React 18 + TypeScript 5（严格模式）
- Vite 6 构建
- TipTap 2（基于 ProseMirror）编辑器
- Bun 包管理器（路径: `~/.bun/bin/bun`）
- IndexedDB 本地存储（数据库: `blockos-db`）
- MiMo API（小米 AI，流式 SSE）
- Supabase（可选认证和云同步）
- **Shadcn UI + Tailwind CSS**（UI 组件库和样式框架）

## UI 组件规范
- **必须**使用 Shadcn UI 组件替代原生 HTML 元素
- **必须**使用 Tailwind CSS 工具类，避免自定义 CSS
- **必须**使用 `cn()` 工具函数动态组合类名
- **必须**使用 lucide-react 图标库
- 详细规范见 `.kiro/steering/shadcn-ui-refactor.md`

## 常用命令
```bash
bun install          # 安装依赖
bun run dev          # 启动开发服务器
bun run build        # 构建（tsc + vite build）
bun run type-check   # TypeScript 类型检查（tsc --noEmit）
bunx shadcn@latest add <component>  # 安装 Shadcn UI 组件
```

## 关键约束
- 禁止循环依赖，依赖方向严格单向向下
- 不引入新的大型框架，除非明确讨论
- 所有函数参数和返回值必须有明确类型
- 每个文件单一职责
- 代码修改后运行 `bun run type-check` 确保类型安全
- **禁止使用原生 HTML 元素（button、input、textarea 等），必须使用 Shadcn UI 组件**
