# BlockOS 测试指南

本目录包含 BlockOS 项目的自动化测试。

## 目录结构

```
__tests__/
├── unit/           # 单元测试
│   ├── utils/      # 工具函数测试
│   ├── storage/    # 存储层测试
│   └── services/   # 服务层测试
├── integration/    # 集成测试
│   ├── editor/     # 编辑器集成测试
│   ├── ai/         # AI 功能集成测试
│   └── blocks/     # Block 系统集成测试
├── e2e/            # 端到端测试
│   ├── workflows/  # 用户工作流测试
│   └── scenarios/  # 场景测试
├── fixtures/       # 测试数据
│   ├── blocks.ts   # Block 测试数据
│   ├── documents.ts # 文档测试数据
│   └── sessions.ts # 会话测试数据
└── utils/          # 测试工具
    ├── setup.ts    # 测试环境设置
    ├── helpers.ts  # 测试辅助函数
    └── mocks.ts    # Mock 数据和函数
```

## 测试类型

### 单元测试（Unit Tests）

测试单个函数、类或模块的功能。

**特点**：
- 快速执行
- 隔离测试
- 不依赖外部资源

**示例**：
```typescript
// src/__tests__/unit/utils/uuid.test.ts
import { describe, it, expect } from 'bun:test'
import { generateUUID, isValidUUID } from '@/utils/uuid'

describe('UUID Utils', () => {
  it('should generate valid UUID', () => {
    const uuid = generateUUID()
    expect(isValidUUID(uuid)).toBe(true)
  })

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID()
    const uuid2 = generateUUID()
    expect(uuid1).not.toBe(uuid2)
  })
})
```

### 集成测试（Integration Tests）

测试多个模块之间的交互。

**特点**：
- 测试模块间协作
- 可能涉及数据库、API
- 执行时间较长

**示例**：
```typescript
// src/__tests__/integration/blocks/blockCapture.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'
import { captureBlock } from '@/services/business/blockCaptureService'
import { blockStore } from '@/storage/blockStore'

describe('Block Capture Integration', () => {
  beforeEach(async () => {
    // 清理测试数据
    await blockStore.clear()
  })

  it('should capture block and save to storage', async () => {
    const block = await captureBlock({
      content: 'Test content',
      type: 'explicit',
    })

    const saved = await blockStore.getById(block.id)
    expect(saved).toBeDefined()
    expect(saved?.content).toBe('Test content')
  })
})
```

### 端到端测试（E2E Tests）

测试完整的用户工作流。

**特点**：
- 模拟真实用户操作
- 测试整个应用流程
- 执行时间最长

**示例**：
```typescript
// src/__tests__/e2e/workflows/createDocument.test.ts
import { describe, it, expect } from 'bun:test'
import { render, screen, userEvent } from '@testing-library/react'
import App from '@/App'

describe('Create Document Workflow', () => {
  it('should create new document and edit content', async () => {
    render(<App />)
    
    // 点击新建文档
    await userEvent.click(screen.getByText('新建文档'))
    
    // 输入标题
    const titleInput = screen.getByPlaceholderText('无标题文档')
    await userEvent.type(titleInput, 'My Document')
    
    // 输入内容
    const editor = screen.getByRole('textbox')
    await userEvent.type(editor, 'Hello World')
    
    // 验证内容已保存
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

## 测试命名规范

### 文件命名
- 单元测试：`<module>.test.ts`
- 集成测试：`<feature>.test.ts`
- 端到端测试：`<workflow>.test.ts`

### 测试用例命名
使用 `should` 语句描述预期行为：

```typescript
it('should generate valid UUID', () => { ... })
it('should throw error when input is invalid', () => { ... })
it('should save block to storage', () => { ... })
```

## 运行测试

```bash
# 运行所有测试
bun test

# 运行单元测试
bun test src/__tests__/unit

# 运行集成测试
bun test src/__tests__/integration

# 运行端到端测试
bun test src/__tests__/e2e

# 运行特定测试文件
bun test src/__tests__/unit/utils/uuid.test.ts

# 监听模式（开发时使用）
bun test --watch
```

## 测试覆盖率

```bash
# 生成测试覆盖率报告
bun test --coverage

# 查看覆盖率报告
open coverage/index.html
```

## 测试最佳实践

### 1. 遵循 AAA 模式

```typescript
it('should do something', () => {
  // Arrange - 准备测试数据
  const input = 'test'
  
  // Act - 执行被测试的操作
  const result = doSomething(input)
  
  // Assert - 验证结果
  expect(result).toBe('expected')
})
```

### 2. 使用描述性的测试名称

❌ 不好：
```typescript
it('test 1', () => { ... })
```

✅ 好：
```typescript
it('should return empty array when no blocks exist', () => { ... })
```

### 3. 每个测试只验证一件事

❌ 不好：
```typescript
it('should handle blocks', () => {
  // 测试创建
  const block = createBlock()
  expect(block).toBeDefined()
  
  // 测试更新
  updateBlock(block.id, { content: 'new' })
  expect(block.content).toBe('new')
  
  // 测试删除
  deleteBlock(block.id)
  expect(getBlock(block.id)).toBeNull()
})
```

✅ 好：
```typescript
it('should create block', () => { ... })
it('should update block content', () => { ... })
it('should delete block', () => { ... })
```

### 4. 使用 Fixtures 管理测试数据

```typescript
// src/__tests__/fixtures/blocks.ts
export const mockBlock = {
  id: 'test-block-1',
  content: 'Test content',
  type: 'explicit',
  createdAt: new Date('2024-01-01'),
}

// 在测试中使用
import { mockBlock } from '../fixtures/blocks'

it('should process block', () => {
  const result = processBlock(mockBlock)
  expect(result).toBeDefined()
})
```

### 5. 清理测试数据

```typescript
import { beforeEach, afterEach } from 'bun:test'

beforeEach(async () => {
  // 每个测试前清理数据
  await blockStore.clear()
})

afterEach(async () => {
  // 每个测试后清理数据（可选）
  await cleanup()
})
```

### 6. 避免测试实现细节

❌ 不好（测试实现细节）：
```typescript
it('should call internal method', () => {
  const spy = jest.spyOn(service, '_internalMethod')
  service.doSomething()
  expect(spy).toHaveBeenCalled()
})
```

✅ 好（测试行为）：
```typescript
it('should return correct result', () => {
  const result = service.doSomething()
  expect(result).toBe('expected')
})
```

## 测试工具

### Bun Test

BlockOS 使用 Bun 内置的测试运行器。

**特点**：
- 快速执行
- 内置断言库
- 支持 TypeScript
- 兼容 Jest API

**文档**：https://bun.sh/docs/cli/test

### Testing Library（可选）

用于测试 React 组件。

```bash
bun add -d @testing-library/react @testing-library/user-event
```

**文档**：https://testing-library.com/docs/react-testing-library/intro/

## 持续集成

测试应该在 CI/CD 流程中自动运行：

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run type-check
```

## 测试覆盖率目标

- **工具函数（utils）**：90%+
- **存储层（storage）**：80%+
- **服务层（services）**：70%+
- **组件（components）**：60%+

## 常见问题

### Q: 如何 mock IndexedDB？

A: 使用 `fake-indexeddb` 库：

```typescript
import 'fake-indexeddb/auto'
import { openDB } from 'idb'

// 测试代码
```

### Q: 如何测试异步代码？

A: 使用 `async/await`：

```typescript
it('should fetch data', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})
```

### Q: 如何跳过测试？

A: 使用 `it.skip` 或 `describe.skip`：

```typescript
it.skip('should do something', () => {
  // 暂时跳过此测试
})
```

## 参考资源

- [Bun Test 文档](https://bun.sh/docs/cli/test)
- [Testing Library 文档](https://testing-library.com/)
- [Jest API 参考](https://jestjs.io/docs/api)
- [测试最佳实践](https://testingjavascript.com/)

---

**最后更新**：2026-04-16
