# DeepSeek API 集成

**状态**: 已完成  
**优先级**: P1  
**完成日期**: 2026-04-13

## 概述

为 BlockOS 添加 DeepSeek API 支持，实现多 AI 提供商架构，用户可以在小米 MiMo 和 DeepSeek 之间自由切换。

## 功能特性

### 1. 多 AI 提供商架构

**支持的提供商**:
- **小米 MiMo**: 快速响应，适合日常对话
- **DeepSeek**: 深度推理，适合复杂任务

**提供商配置**:
```typescript
interface AIProviderConfig {
  name: string              // 显示名称
  apiUrl: string           // API 端点
  defaultModel: string     // 默认模型
  supportedModels: string[] // 支持的模型列表
  headerKey: string        // API Key header 名称
}
```

### 2. DeepSeek 模型支持

**deepseek-chat** (非思考模式):
- 模型版本: DeepSeek-V3.2
- 上下文长度: 128K
- 最大输出: 默认 4K，最大 8K
- 适用场景: 日常对话、资料查询、简单创作
- 特点: 快速响应，高效率

**deepseek-reasoner** (思考模式):
- 模型版本: DeepSeek-V3.2
- 上下文长度: 128K
- 最大输出: 默认 32K，最大 64K
- 适用场景: 数理逻辑、代码编程、金融/法律分析、科研
- 特点: 深度思考、智能搜索、多步推理与自我纠错

### 3. 温度参数优化

根据 DeepSeek 官方建议，针对不同任务类型设置最佳温度:

| 任务类型 | 温度值 |
|---------|--------|
| 编程/数学 | 0.0 |
| 数据清洗/分析 | 1.0 |
| 通用对话 | 1.3 |
| 翻译 | 1.3 |
| 创作/诗歌 | 1.5 |

**实现逻辑**:
- 翻译任务: 1.3
- 续写/扩写 (创作类): 1.5
- 其他任务: 1.0

### 4. UI 集成

**设置面板新增**:
- AI 提供商选择下拉框
- 模型选择下拉框（根据提供商动态更新）
- 实时提示信息（显示当前选择的特点）

**用户体验**:
- 选择保存到 localStorage，下次自动恢复
- 切换提供商时自动切换到该提供商的默认模型
- 错误提示包含具体的 API Key 配置信息

## 技术实现

### 核心函数

```typescript
// 获取当前提供商
getCurrentProvider(): AIProvider

// 设置当前提供商
setCurrentProvider(provider: AIProvider): void

// 获取提供商配置
getProviderConfig(provider?: AIProvider): AIProviderConfig

// 获取提供商 API Key
getProviderApiKey(provider?: AIProvider): string

// 获取当前模型
getCurrentModel(): string

// 设置当前模型
setCurrentModel(model: string): void
```

### API 请求适配

**MiMo API**:
- Header: `api-key: <key>`
- 模型: `mimo-v2-flash`

**DeepSeek API**:
- Header: `Authorization: Bearer <key>`
- 模型: `deepseek-chat` / `deepseek-reasoner`
- 端点: `https://api.deepseek.com/chat/completions`

### 环境变量

```env
# 小米 MiMo API Key
VITE_MIMO_API_KEY=your_api_key_here

# DeepSeek API Key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## 使用指南

### 1. 配置 API Key

在 `.env` 文件中添加 DeepSeek API Key:
```env
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
```

### 2. 切换 AI 提供商

1. 打开右侧 AI 对话面板
2. 点击设置按钮（⚙️）
3. 在"AI 提供商"下拉框中选择 DeepSeek
4. 在"模型"下拉框中选择模型（deepseek-chat 或 deepseek-reasoner）
5. 点击"保存"

### 3. 选择建议

**日常使用**:
- 简单对话、查询: 小米 MiMo 或 deepseek-chat
- 快速响应优先: 小米 MiMo

**专业任务**:
- 代码编程、数学推理: deepseek-reasoner
- 深度分析、科研: deepseek-reasoner
- 复杂逻辑推导: deepseek-reasoner

## 定价信息

DeepSeek API 定价（每 1M tokens）:
- 输入 tokens (缓存命中): $0.028
- 输入 tokens (缓存未命中): $0.28
- 输出 tokens: $0.42

## 架构约束

- 遵循 CLAUDE.md 规范（单一职责、类型安全）
- 提供商配置集中管理
- API Key 从环境变量读取
- 用户偏好保存到 localStorage
- 错误处理友好，提示具体配置信息

## 相关文档

- [DeepSeek API 文档](../../attachs/deepseek_api.md)
- [AI 集成需求](./ai-integration.md)
- [Session 管理](./session-management.md)

## 未来扩展

- [ ] 支持更多 AI 提供商（OpenAI、Claude、文心一言等）
- [ ] 提供商性能监控和统计
- [ ] 智能提供商推荐（根据任务类型）
- [ ] 成本追踪和预算管理
- [ ] 多提供商并行请求（对比回答质量）
