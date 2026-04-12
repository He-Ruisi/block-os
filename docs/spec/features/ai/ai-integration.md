# Phase 2: AI 对话集成

## 优先级
P0 - 核心功能

## 目标
在编辑器基础上集成 AI 对话能力，实现智能写作辅助。

## 功能需求

### 1. AI API 集成
- 接入 xiaomi mimo API
- 配置 API 密钥管理
- 实现请求/响应处理
- 错误处理和重试机制

### 2. 对话界面
- 右侧面板实现对话 UI
- 消息列表展示
- 输入框和发送按钮
- 加载状态提示

### 3. 编辑器集成
- AI 输出直接写入编辑器
- 支持流式输出（打字机效果）
- 插入位置控制（光标位置/末尾）

### 4. 文字捕获
- 选中文字快捷操作
- 将选中内容捕获为 Block
- 上下文传递给 AI

## 技术方案

### API 层
```typescript
interface AIService {
  sendMessage(content: string, context?: string): Promise<string>
  streamMessage(content: string, onChunk: (chunk: string) => void): Promise<void>
}
```

### 状态管理
- 对话历史存储
- 当前会话状态
- 编辑器与 AI 的数据同步

## 验收标准
- [ ] 能够发送消息并接收 AI 回复
- [ ] AI 回复自动插入编辑器
- [ ] 选中文字可快速发送给 AI
- [ ] 流式输出体验流畅

## 依赖
- Phase 1 编辑器基础完成
- xiaomi mimo API 访问权限
