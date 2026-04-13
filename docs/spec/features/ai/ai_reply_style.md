好，情况很清晰。解决方案分两层：

**第一层：渲染 Markdown**

你需要一个库把 AI 返回的 raw 文本转成带格式的 HTML。React 生态里最常用的组合是：

- `react-markdown` — 把 markdown 字符串渲染成 React 组件
- `remark-gfm` — 支持表格、删除线、任务列表等 GitHub 风格扩展
- `react-syntax-highlighter` — 代码块语法高亮

这三个加起来就能覆盖 Google AI Studio 那种效果。

**第二层：流式输出（streaming）**

你现在用 fetch API，如果是等 AI 回复完整再显示，用户体验会很差。要改成流式读取，核心是用 `ReadableStream` 逐块读取响应：

```typescript
const response = await fetch('/api/chat', { method: 'POST', body: ... })
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  setMessage(prev => prev + chunk)  // 逐步追加到状态
}
```

然后把这个不断增长的字符串传给 `react-markdown` 渲染，就能实现打字机效果，同时 markdown 格式实时生效。

**第三层：和你的 BlockOS 主题融合**

`react-markdown` 支持自定义每个元素的渲染组件，比如：

```tsx
<ReactMarkdown
  components={{
    h1: ({children}) => <h1 style={{fontFamily: 'serif', ...}}>...</h1>,
    code: ({children}) => <CodeBlock>...</CodeBlock>,
  }}
>
  {message}
</ReactMarkdown>
```

排版可以完全匹配你的 newsprint 主题，而不是用库的默认样式。



