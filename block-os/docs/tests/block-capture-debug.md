# Block 捕获失败问题诊断

## 问题描述
点击"捕获为Block"按钮后，直接显示捕获失败。

## 根本原因分析

### 1. blockStore 未在 App.tsx 中初始化

**问题代码位置:** `block-os/src/App.tsx`

**问题:** App.tsx 中没有调用 `blockStore.init()`，导致 blockStore.db 为 null。

**影响:**
- RightPanel 中虽然有 `blockStore.init()`，但它是在 useEffect 中异步执行的
- 如果用户在初始化完成前点击"捕获为Block"，会因为 db 为 null 而失败

### 2. 错误处理不够详细

**问题代码位置:** `block-os/src/components/RightPanel.tsx` (第 115-142 行)

```typescript
const captureBlock = async (messageId: string) => {
  // ...
  try {
    await blockStore.saveBlock(block)
    // ...
  } catch (error) {
    console.error('[Block Capture] Failed to save block:', error)
    showToast('Block 捕获失败，请重试', 'error')
  }
}
```

**问题:** 
- 只打印了错误，没有显示具体的错误信息
- 用户无法知道失败的具体原因

### 3. blockStore.saveBlock 的错误处理

**问题代码位置:** `block-os/src/lib/blockStore.ts` (第 67-77 行)

```typescript
async saveBlock(block: Block): Promise<string> {
  if (!this.db) throw new Error('Database not initialized')
  // ...
}
```

**问题:**
- 如果 db 未初始化，会抛出异常
- 但 RightPanel 的 catch 块没有显示详细错误信息

## 修复方案

### 方案1: 在 App.tsx 中初始化 blockStore（推荐）

在 App.tsx 中添加初始化逻辑：

```typescript
import { useEffect } from 'react'
import { blockStore } from './lib/blockStore'

function App() {
  // ... 现有代码 ...
  
  // 初始化 blockStore
  useEffect(() => {
    blockStore.init().catch(error => {
      console.error('Failed to initialize blockStore:', error)
    })
  }, [])
  
  // ... 其余代码 ...
}
```

### 方案2: 改进 captureBlock 的错误处理

在 RightPanel.tsx 中改进错误处理：

```typescript
const captureBlock = async (messageId: string) => {
  const message = messages.find(m => m.id === messageId)
  if (!message || message.role !== 'assistant') return

  try {
    // 确保 blockStore 已初始化
    if (!blockStore.db) {
      console.log('[Block Capture] Initializing blockStore...')
      await blockStore.init()
    }
    
    const content = message.editorContent || message.content
    const block: Block = {
      id: generateUUID(),
      content: content,
      type: 'ai-generated',
      source: {
        type: 'ai',
        aiMessageId: messageId,
        capturedAt: new Date()
      },
      metadata: {
        title: `AI 回复 - ${new Date().toLocaleString()}`,
        tags: ['AI回复', '手动捕获'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    await blockStore.saveBlock(block)
    console.log('[Block Capture] Block saved successfully:', block.id)
    
    // 触发 Block 更新事件
    window.dispatchEvent(new Event('blockUpdated'))
    
    // 显示成功提示
    showToast('Block 捕获成功！', 'success')
    
    // 切换到 Block 空间标签页
    setActiveTab('blocks')
  } catch (error) {
    console.error('[Block Capture] Failed to save block:', error)
    
    // 显示详细错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showToast(`Block 捕获失败: ${errorMessage}`, 'error')
  }
}
```

### 方案3: 添加初始化状态检查

在 RightPanel 中添加初始化状态：

```typescript
const [isBlockStoreReady, setIsBlockStoreReady] = useState(false)

useEffect(() => {
  blockStore.init()
    .then(() => {
      setIsBlockStoreReady(true)
      console.log('[RightPanel] blockStore initialized')
    })
    .catch(error => {
      console.error('[RightPanel] Failed to initialize blockStore:', error)
      showToast('初始化失败，Block 功能不可用', 'error')
    })
}, [])

// 在按钮上添加禁用状态
<button
  className="capture-button"
  onClick={() => captureBlock(msg.id)}
  disabled={!isBlockStoreReady}
  title={isBlockStoreReady ? '捕获为Block' : '正在初始化...'}
>
  ◆ 捕获为Block
</button>
```

## 快速测试脚本

在浏览器控制台执行以下代码来诊断问题：

```javascript
// 检查 blockStore 是否初始化
console.log('blockStore.db:', window.blockStore?.db || 'blockStore not accessible');

// 手动初始化并测试
(async () => {
  try {
    // 动态导入 blockStore
    const { blockStore, generateUUID } = await import('./src/lib/blockStore.ts');
    
    console.log('1. 检查初始化状态');
    console.log('blockStore.db:', blockStore.db);
    
    if (!blockStore.db) {
      console.log('2. 初始化 blockStore');
      await blockStore.init();
      console.log('✅ 初始化成功');
    }
    
    console.log('3. 测试保存 Block');
    const testBlock = {
      id: generateUUID(),
      content: '测试 Block - ' + new Date().toLocaleString(),
      type: 'text',
      source: {
        type: 'editor',
        capturedAt: new Date()
      },
      metadata: {
        title: '测试 Block',
        tags: ['测试'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    
    await blockStore.saveBlock(testBlock);
    console.log('✅ Block 保存成功:', testBlock.id);
    
    console.log('4. 读取所有 Blocks');
    const allBlocks = await blockStore.getAllBlocks();
    console.log('📦 总共有', allBlocks.length, '个 blocks');
    console.log('所有 blocks:', allBlocks);
    
    console.log('5. 触发更新事件');
    window.dispatchEvent(new Event('blockUpdated'));
    console.log('✅ blockUpdated 事件已触发');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
})();
```

## 推荐修复顺序

1. **立即修复:** 在 App.tsx 中添加 blockStore 初始化
2. **改进:** 在 RightPanel 中添加初始化状态检查
3. **优化:** 改进错误处理，显示详细错误信息

## 验证修复

修复后，在控制台应该看到：

```
[RightPanel] blockStore initialized
[Block Capture] Block saved successfully: <uuid>
✅ blockUpdated 事件被触发
[BlockSpacePanel] Reloading blocks...
```

并且 Toast 提示应该显示"Block 捕获成功！"
