# Block 捕获功能测试用例

## 测试目标
验证点击"捕获为Block"按钮后，Block 是否成功保存到 IndexedDB 并在 Block 空间中显示。

## 测试环境
- 浏览器: Chrome/Safari/Firefox
- 开发工具: 打开浏览器控制台（F12）

## 测试步骤

### 1. 准备测试环境

1. 启动开发服务器
   ```bash
   cd block-os
   bun run dev
   ```

2. 打开浏览器访问 `http://localhost:5173`

3. 打开浏览器开发者工具（F12），切换到 Console 标签页

### 2. 测试 IndexedDB 初始化

在控制台执行以下代码，检查 IndexedDB 是否正常初始化：

```javascript
// 检查 IndexedDB 数据库
indexedDB.databases().then(dbs => {
  console.log('所有数据库:', dbs);
  const blockosDb = dbs.find(db => db.name === 'blockos-db');
  if (blockosDb) {
    console.log('✅ blockos-db 数据库存在');
  } else {
    console.log('❌ blockos-db 数据库不存在');
  }
});

// 打开数据库并检查 stores
const request = indexedDB.open('blockos-db', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  console.log('数据库版本:', db.version);
  console.log('Object Stores:', Array.from(db.objectStoreNames));
  
  if (db.objectStoreNames.contains('blocks')) {
    console.log('✅ blocks store 存在');
    
    // 读取所有 blocks
    const tx = db.transaction(['blocks'], 'readonly');
    const store = tx.objectStore('blocks');
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = () => {
      console.log('当前 blocks 数量:', getAllRequest.result.length);
      console.log('所有 blocks:', getAllRequest.result);
    };
  } else {
    console.log('❌ blocks store 不存在');
  }
  
  db.close();
};
request.onerror = (e) => {
  console.error('❌ 打开数据库失败:', e.target.error);
};
```

**预期结果:**
- ✅ blockos-db 数据库存在
- ✅ blocks store 存在
- 显示当前 blocks 数量

### 3. 测试 AI 对话和 Block 捕获

1. 在右侧面板的"对话"标签页中，输入一个简单的问题：
   ```
   你好，请介绍一下你自己
   ```

2. 点击"发送"按钮，等待 AI 回复

3. 在控制台中监听 Block 相关事件：
   ```javascript
   // 监听 blockUpdated 事件
   window.addEventListener('blockUpdated', () => {
     console.log('✅ blockUpdated 事件被触发');
   });
   
   // 监听所有自定义事件
   const originalDispatchEvent = window.dispatchEvent;
   window.dispatchEvent = function(event) {
     if (event instanceof CustomEvent || event.type === 'blockUpdated') {
       console.log('🔔 事件触发:', event.type, event);
     }
     return originalDispatchEvent.call(this, event);
   };
   ```

4. 当 AI 回复完成后，点击"◆ 捕获为Block"按钮

5. 观察控制台输出

**预期结果:**
- 控制台显示: `[Block Capture] Block saved successfully: <block-id>`
- 控制台显示: `✅ blockUpdated 事件被触发`
- 显示 Toast 提示: "Block 捕获成功！"
- 自动切换到"Block空间"标签页

### 4. 验证 Block 是否保存成功

在控制台执行以下代码：

```javascript
// 方法1: 直接查询 IndexedDB
const request = indexedDB.open('blockos-db', 1);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['blocks'], 'readonly');
  const store = tx.objectStore('blocks');
  const getAllRequest = store.getAll();
  
  getAllRequest.onsuccess = () => {
    const blocks = getAllRequest.result;
    console.log('📦 总共有', blocks.length, '个 blocks');
    console.log('最新的 block:', blocks[0]);
    
    // 检查最新 block 的属性
    if (blocks.length > 0) {
      const latestBlock = blocks[0];
      console.log('Block ID:', latestBlock.id);
      console.log('Block 类型:', latestBlock.type);
      console.log('Block 来源:', latestBlock.source);
      console.log('Block 内容:', latestBlock.content.substring(0, 100) + '...');
      console.log('Block 标签:', latestBlock.metadata.tags);
    }
  };
  
  db.close();
};

// 方法2: 使用 blockStore API
import { blockStore } from './src/lib/blockStore';
blockStore.getAllBlocks().then(blocks => {
  console.log('通过 blockStore 获取的 blocks:', blocks.length);
});
```

**预期结果:**
- 显示新增的 block
- Block 类型为 'ai-generated'
- Block 来源为 'ai'
- Block 内容包含 AI 的回复

### 5. 验证 BlockSpacePanel 是否更新

1. 手动切换到"Block空间"标签页（如果没有自动切换）

2. 检查是否显示新捕获的 Block

3. 在控制台执行：
   ```javascript
   // 检查 BlockSpacePanel 是否监听了 blockUpdated 事件
   const listeners = getEventListeners(window);
   console.log('window 上的事件监听器:', listeners);
   console.log('blockUpdated 监听器数量:', listeners.blockUpdated?.length || 0);
   ```

**预期结果:**
- Block 空间中显示新捕获的 Block
- Block 卡片显示正确的内容、标签和时间
- 至少有 1 个 blockUpdated 监听器

## 常见问题诊断

### 问题1: 点击"捕获为Block"按钮没有反应

**可能原因:**
1. blockStore 未初始化
2. captureBlock 函数抛出异常
3. IndexedDB 权限问题

**诊断步骤:**
```javascript
// 检查 blockStore 是否初始化
console.log('blockStore.db:', blockStore.db);

// 手动测试保存 block
import { blockStore, generateUUID } from './src/lib/blockStore';

const testBlock = {
  id: generateUUID(),
  content: '测试 Block',
  type: 'text',
  source: {
    type: 'editor',
    capturedAt: new Date()
  },
  metadata: {
    title: '测试',
    tags: ['测试'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

blockStore.saveBlock(testBlock)
  .then(id => console.log('✅ 测试 Block 保存成功:', id))
  .catch(err => console.error('❌ 测试 Block 保存失败:', err));
```

### 问题2: Block 保存成功但 BlockSpacePanel 不更新

**可能原因:**
1. blockUpdated 事件未触发
2. BlockSpacePanel 未监听事件
3. 事件监听器被移除

**诊断步骤:**
```javascript
// 手动触发 blockUpdated 事件
window.dispatchEvent(new Event('blockUpdated'));
console.log('手动触发 blockUpdated 事件');

// 检查 BlockSpacePanel 组件是否挂载
const blockSpacePanel = document.querySelector('.block-space-panel');
console.log('BlockSpacePanel 是否存在:', !!blockSpacePanel);
```

### 问题3: Toast 提示显示"捕获失败"

**可能原因:**
1. IndexedDB 写入失败
2. Block 数据格式错误
3. 浏览器存储空间不足

**诊断步骤:**
```javascript
// 检查浏览器存储空间
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    console.log('已使用存储:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
    console.log('可用存储:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
  });
}

// 检查控制台错误日志
console.log('查看控制台是否有错误信息');
```

## 自动化测试脚本

将以下代码粘贴到控制台，自动执行完整测试：

```javascript
(async function testBlockCapture() {
  console.log('🧪 开始 Block 捕获功能测试...\n');
  
  // 测试1: 检查数据库
  console.log('📋 测试1: 检查 IndexedDB 数据库');
  const dbs = await indexedDB.databases();
  const blockosDb = dbs.find(db => db.name === 'blockos-db');
  if (blockosDb) {
    console.log('✅ blockos-db 数据库存在');
  } else {
    console.log('❌ blockos-db 数据库不存在');
    return;
  }
  
  // 测试2: 检查 blocks store
  console.log('\n📋 测试2: 检查 blocks store');
  const request = indexedDB.open('blockos-db', 1);
  
  await new Promise((resolve, reject) => {
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains('blocks')) {
        console.log('✅ blocks store 存在');
        
        // 读取当前 blocks
        const tx = db.transaction(['blocks'], 'readonly');
        const store = tx.objectStore('blocks');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const blocks = getAllRequest.result;
          console.log('📦 当前 blocks 数量:', blocks.length);
          if (blocks.length > 0) {
            console.log('最新 block:', {
              id: blocks[0].id,
              type: blocks[0].type,
              content: blocks[0].content.substring(0, 50) + '...'
            });
          }
          db.close();
          resolve();
        };
      } else {
        console.log('❌ blocks store 不存在');
        db.close();
        reject();
      }
    };
    
    request.onerror = (e) => {
      console.error('❌ 打开数据库失败:', e.target.error);
      reject();
    };
  });
  
  // 测试3: 检查事件监听器
  console.log('\n📋 测试3: 检查事件监听器');
  const listeners = getEventListeners(window);
  const blockUpdatedListeners = listeners.blockUpdated?.length || 0;
  console.log('blockUpdated 监听器数量:', blockUpdatedListeners);
  if (blockUpdatedListeners > 0) {
    console.log('✅ 事件监听器已注册');
  } else {
    console.log('⚠️ 没有 blockUpdated 监听器');
  }
  
  // 测试4: 检查 BlockSpacePanel
  console.log('\n📋 测试4: 检查 BlockSpacePanel 组件');
  const blockSpacePanel = document.querySelector('.block-space-panel');
  if (blockSpacePanel) {
    console.log('✅ BlockSpacePanel 组件已挂载');
  } else {
    console.log('⚠️ BlockSpacePanel 组件未挂载（可能在其他标签页）');
  }
  
  console.log('\n✅ 测试完成！');
  console.log('\n💡 下一步: 发送 AI 消息并点击"捕获为Block"按钮进行实际测试');
})();
```

## 测试结果记录

| 测试项 | 预期结果 | 实际结果 | 状态 |
|--------|---------|---------|------|
| IndexedDB 初始化 | 数据库和 store 存在 | | ⬜ |
| Block 保存 | 成功保存到 IndexedDB | | ⬜ |
| 事件触发 | blockUpdated 事件触发 | | ⬜ |
| Toast 提示 | 显示成功提示 | | ⬜ |
| 标签页切换 | 自动切换到 Block 空间 | | ⬜ |
| Block 显示 | Block 空间显示新 Block | | ⬜ |

## 修复建议

如果测试失败，请检查以下代码位置：

1. **RightPanel.tsx** - `captureBlock` 函数（第 115-142 行）
2. **blockStore.ts** - `saveBlock` 方法（第 67-77 行）
3. **BlockSpacePanel.tsx** - `blockUpdated` 事件监听（第 37-44 行）
4. **App.tsx** - blockStore 初始化

## 参考日志

成功的控制台输出应该类似：

```
[Block Capture] Block saved successfully: 550e8400-e29b-41d4-a716-446655440000
✅ blockUpdated 事件被触发
[BlockSpacePanel] Reloading blocks...
📦 总共有 1 个 blocks
```
