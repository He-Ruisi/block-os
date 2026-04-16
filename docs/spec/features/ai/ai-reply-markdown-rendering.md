# AI 回复 Markdown 渲染增强

## 概述
将 AI 回复从纯文本渲染升级为完整的 Markdown 渲染，支持代码高亮、表格、列表等丰富格式，提升可读性和用户体验。

## 功能特性

### 1. Markdown 完整支持
- **标题**：H1-H6 六级标题，带样式层级
- **段落**：自动段落间距和行高优化
- **强调**：粗体、斜体、删除线
- **列表**：有序列表、无序列表、嵌套列表
- **引用**：blockquote 样式，带左侧边框和背景色
- **链接**：自动识别，新窗口打开
- **分隔线**：水平分隔线
- **任务列表**：GitHub 风格任务列表（GFM 扩展）

### 2. 代码渲染增强
- **行内代码**：`code` 样式，带背景色和边框
- **代码块**：
  - 语法高亮（支持 100+ 编程语言）
  - 语言标签显示（顶部）
  - 一键复制按钮
  - 主题适配（oneDark / oneLight）
  - 自定义样式（字号、行高、圆角）

### 3. 表格支持
- **完整表格渲染**：thead、tbody、tr、th、td
- **响应式包装器**：横向滚动支持
- **悬停效果**：行悬停高亮
- **边框样式**：完整边框和分隔线

### 4. 主题适配
- **Default 主题**：
  - 圆角设计
  - 柔和阴影
  - 紫色强调色
  - oneDark 代码高亮
- **Newsprint 主题**：
  - 直角设计
  - 硬边框和硬阴影
  - 黑色/红色强调色
  - oneLight 代码高亮
  - 衬线字体标题

### 5. 响应式优化
- **移动端适配**：
  - 字号自动调整（16px）
  - 标题尺寸缩小
  - 代码块全宽显示
  - 表格全宽滚动

## 技术实现

### 核心依赖
```json
{
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "react-syntax-highlighter": "^16.1.1",
  "@types/react-syntax-highlighter": "^15.5.13"
}
```

### 组件架构
```
MarkdownRenderer
├── ReactMarkdown (核心渲染)
│   ├── remarkGfm (GFM 扩展)
│   └── components (自定义组件)
│       ├── code (代码块 + 行内代码)
│       ├── h1-h6 (标题)
│       ├── p (段落)
│       ├── blockquote (引用)
│       ├── ul/ol/li (列表)
│       ├── table/thead/tbody/tr/th/td (表格)
│       ├── a (链接)
│       ├── hr (分隔线)
│       └── strong/em/del (强调)
└── SyntaxHighlighter (代码高亮)
    ├── Prism (语法解析器)
    ├── oneDark (暗色主题)
    └── oneLight (亮色主题)
```

### 使用方式
```tsx
import { MarkdownRenderer } from '../shared/MarkdownRenderer'

// AI 对话回复（如果存在）
{msg.role === 'assistant' && msg.content && (
  <div className="message-content">
    <MarkdownRenderer content={msg.content} />
  </div>
)}

// 编辑器内容（Markdown 渲染，重点展示）
{msg.role === 'assistant' && msg.editorContent && (
  <div className="editor-content-preview">
    <div className="preview-label">📝 编辑器内容</div>
    <div className="preview-markdown">
      <MarkdownRenderer content={msg.editorContent} />
    </div>
  </div>
)}
```

### 样式系统
- **CSS 变量**：使用全局 CSS 变量保持一致性
- **模块化样式**：`MarkdownRenderer.css` 独立样式文件
- **主题切换**：通过 `theme-${theme}` 类名切换
- **响应式**：媒体查询适配移动端

## 用户体验

### AI 回复显示逻辑
1. **对话回复**（`content`）：简短的回复文本，Markdown 渲染
2. **编辑器内容**（`editorContent`）：要写入编辑器的完整内容，Markdown 渲染，重点展示
3. 如果 AI 只返回一个内容，直接显示该内容
4. 如果 AI 同时返回两个内容，分别显示对话回复和编辑器内容

### 视觉效果
- **对话回复**：直接显示在消息区域
- **编辑器内容**：
  - 带标签"📝 编辑器内容"
  - 独立的卡片样式（背景色、边框、圆角）
  - 完整 Markdown 渲染（代码高亮、表格、列表等）
  - Newsprint 主题：硬边框、硬阴影、衬线字体
- **清晰的层级**：标题、段落、列表层次分明
- **代码易读**：语法高亮 + 复制按钮
- **表格整洁**：边框清晰，悬停反馈
- **链接明显**：下划线 + 悬停效果

### 交互优化
- **代码复制**：一键复制代码块内容
- **链接跳转**：新窗口打开外部链接
- **表格滚动**：横向滚动查看宽表格
- **响应式**：移动端自动适配

## 性能优化
- **按需渲染**：只对 AI 回复使用 Markdown 渲染
- **用户消息**：保持纯文本渲染，性能更好
- **懒加载**：SyntaxHighlighter 按需加载语言包
- **缓存优化**：React 组件缓存

## 已知限制
- 不支持 HTML 标签（安全考虑）
- 不支持数学公式（LaTeX）
- 不支持图表（Mermaid）
- 代码块最大高度无限制（可能需要滚动）

## 未来改进
- [ ] 支持数学公式渲染（KaTeX）
- [ ] 支持图表渲染（Mermaid）
- [ ] 支持代码块折叠
- [ ] 支持代码块行号
- [ ] 支持代码块高亮行
- [ ] 支持自定义主题配置
- [ ] 支持 Markdown 编辑预览

## 相关文件
- `src/components/shared/MarkdownRenderer.tsx` - Markdown 渲染组件
- `src/components/shared/MarkdownRenderer.css` - Markdown 样式
- `src/components/panel/RightPanel.tsx` - 集成 Markdown 渲染
- `src/components/panel/RightPanel.css` - 消息样式调整
- `docs/spec/features/ai/ai_reply_style.md` - 原始需求文档

## 参考资料
- [react-markdown 文档](https://github.com/remarkjs/react-markdown)
- [remark-gfm 文档](https://github.com/remarkjs/remark-gfm)
- [react-syntax-highlighter 文档](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [Prism 支持的语言](https://prismjs.com/#supported-languages)
