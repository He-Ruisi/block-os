# BlockOS - 写作优先的知识操作系统

## 当前版本：v0.2 - AI 对话集成

这是 BlockOS 的第二个版本，集成了 AI 对话功能。

### 已实现功能

- ✅ 三栏布局（Activity Bar + 编辑器 + 右侧面板）
- ✅ 基础 Markdown 编辑器（基于 TipTap）
- ✅ 基础格式化工具栏（加粗、斜体、标题）
- ✅ AI 对话面板（小米 MiMo API）
- ✅ 流式响应支持
- ✅ 简洁的 UI 设计

### 待实现功能

- ⏳ AI 输出写入编辑器
- ⏳ 选中文字捕获为 Block
- ⏳ 块（Block）系统
- ⏳ 双向链接 `[[]]`
- ⏳ 块引用 `(())`
- ⏳ Git 集成
- ⏳ 本地文件存储

## 配置

### 1. 获取 MiMo API Key

访问 [小米 MiMo 开放平台](https://mimo.xiaomi.com) 获取 API Key。

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```
VITE_MIMO_API_KEY=your_api_key_here
```

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
- 小米 MiMo API (AI 对话)
