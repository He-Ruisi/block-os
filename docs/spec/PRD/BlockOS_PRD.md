# BlockOS · 产品需求文档 v0.1

## 产品定位

一个**写作优先、AI 原生、插件化扩展**的个人知识操作系统。核心理念：写作区永远是主角，AI 是副驾驶，一切输入（对话、灵感、文档）最终都是可复用的块（Block）。

目标用户：有写作/创作/项目管理需求、同时重度使用 AI 的个人用户。

---

## 技术栈

- **前端**：React + Vite + TypeScript
- **编辑器**：TipTap（支持 Markdown + 块级引用）
- **样式**：Tailwind CSS
- **本地存储**：文件系统（.md + .json），Git 版本控制
- **AI 接入**：xiaomi mimo API
- **后续封装**：Tauri（桌面端，支持本地文件读写和 Git 调用）

---

## 核心数据模型

所有内容统一为 Block：

```ts
interface Block {
  id: string           // uuid
  content: string      // 正文
  type: 'text' | 'ai_generated' | 'capture'
  source: 'user_input' | 'ai_chat' | 'manual'
  tags: string[]       // 如 ['灵感', '墨水屏', 'PRD']
  project: string | null
  links: string[]      // 关联 block id
  sessionId: string    // 归属的对话 Session
  created: string      // ISO 时间戳
}

interface Session {
  id: string           // 如 "2026-04-09"
  project: string
  blocks: string[]     // block id 列表
  exportPath: string   // 对应的 .json 文件路径
}
```

---

## 界面布局

三栏结构，参考 VSCode 的轻量化版本：

```
[Activity Bar 36px] | [写作区 / 编辑器 · 主体] | [AI 副驾驶面板 320px]
```

- **Activity Bar（左，极窄）**：文件、块空间、图谱、搜索、插件、设置，图标导航，默认不展开侧边栏
- **写作区（中，主体）**：Markdown 编辑器，AI 生成内容用紫色左边框标注「待润色」状态，支持 `[[双向链接]]` 和 `((块引用))`，底部常驻 `⌘/` AI 指令栏
- **AI 面板（右）**：三个 Tab——对话 / 块空间 / Session，AI 输出直接写入写作区而非气泡，面板只显示状态提示「↗ 已写入文档 · 第三节」
- **状态栏（底部）**：文档保存状态、Git 状态、Session 信息、今日块数量、当前插件模式

---

## 核心功能（MVP）

**1. 写作区**
- Markdown 编辑与实时渲染
- AI 指令直接作用于文档（续写、改写、生成章节）
- 双向链接 `[[]]` 与块引用 `(())`

**2. AI 对话**
- 对话内容按 Session 按天存储为 `.json` + `.md` 双格式
- 任意选中文字，浮动菜单捕获为 Block（存为灵感 / 加入草稿 / 标记引用）
- `@项目` 把当前项目上下文注入 AI

**3. 块空间**
- 收件箱：所有未整理的捕获块
- 画布：拖拽组合块，AI 补全空白，一键导出为文档
- 全局搜索块（按标签、项目、时间）

**4. Git 集成**
- 文档变更自动暂存，用户手动 commit
- 状态栏显示变更数，支持查看 diff

---

## 插件系统（基础设计）

核心只做：块存储、双向链接、AI 对话、Markdown 渲染。

其余功能通过插件扩展，每个插件 = 一套布局 + 一套模板 + 一套快捷键：

- **小说模式**：章节树、人物卡、写作统计
- **项目模式**：看板、PRD 模板、需求追踪
- **每日笔记模式**：日历视图、回顾模板

插件安装后，状态栏切换至对应模式，界面和逻辑随之调整。

---

## 不做的事（MVP 阶段）

- 多人协作
- 云同步（用 Git 替代）
- 移动端
- 复杂权限系统
