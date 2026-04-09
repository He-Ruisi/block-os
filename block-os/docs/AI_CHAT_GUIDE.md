# AI 对话功能使用指南

## 功能概述

BlockOS 已集成小米 MiMo AI 对话功能，位于右侧面板。

## 功能特性

### 1. 流式响应
- AI 回复采用流式输出，实时显示生成内容
- 打字机效果，提升交互体验

### 2. 消息历史
- 自动保存对话历史
- 支持多轮对话上下文

### 3. 快捷操作
- **Enter**: 发送消息
- **Shift + Enter**: 换行

## 配置步骤

### 1. 获取 API Key

1. 访问 [小米 MiMo 开放平台](https://mimo.xiaomi.com)
2. 注册/登录账号
3. 创建应用并获取 API Key

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env`，填入 API Key：

```
VITE_MIMO_API_KEY=your_actual_api_key_here
```

### 3. 启动应用

```bash
bun run dev
```

访问 http://localhost:5173，右侧面板即可使用 AI 对话。

## 技术细节

### 使用的模型
- **mimo-v2-flash**: 快速响应模型
- **temperature**: 0.8（通用问答）
- **top_p**: 0.95

### API 配置
- **端点**: `https://api.xiaomimimo.com/v1/chat/completions`
- **认证方式**: `api-key` 请求头
- **流式输出**: `stream: true`

### 系统提示词
```
你是MiMo，是小米公司研发的AI智能助手。
今天的日期：2026-04-09，你的知识截止日期是2024年12月。
```

## 常见问题

### Q: API 请求失败怎么办？
A: 检查以下几点：
1. API Key 是否正确配置
2. 网络连接是否正常
3. API Key 是否有效且未过期

### Q: 如何修改模型参数？
A: 编辑 `src/components/RightPanel.tsx`，修改 `sendMessage` 函数中的参数：
- `model`: 模型名称
- `temperature`: 采样温度
- `top_p`: 核采样概率

### Q: 如何更换其他模型？
A: 支持的模型：
- `mimo-v2-flash`: 快速响应
- `mimo-v2-pro`: 高质量输出
- `mimo-v2-omni`: 多模态支持

## 下一步计划

- [ ] AI 输出直接写入编辑器
- [ ] 选中文字快速发送给 AI
- [ ] 对话历史持久化
- [ ] 自定义系统提示词
