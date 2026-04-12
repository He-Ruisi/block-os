# Block 捕获功能快速测试指南

## 修复内容

已修复 Block 捕获失败的问题：

1. ✅ 在 `App.tsx` 中添加了 blockStore 初始化
2. ✅ 在 `blockStore.ts` 中添加了 `isInitialized()` 方法
3. ✅ 在 `RightPanel.tsx` 中改进了错误处理，添加了初始化检查

## 快速测试步骤

### 1. 启动开发服务器

```bash
cd block-os
bun run dev
```

### 2. 打开浏览器

访问 `http://localhost:5173`

### 3. 打开开发者工具

按 `F12` 或 `Cmd+Option+I` (Mac) 打开控制台

### 4. 测试 AI 对话和 Block 捕获

1. 在右侧面板的"对话"标签页中输入：
   ```
   你好，请用一句话介绍你自己
   ```

2. 点击"发送"按钮

3. 等待 AI 回复完成

4. 点击"◆ 捕获为Block"按钮

### 5. 验证结果

**预期结果:**

✅ 控制台输出：
```
[Block Capture] Block saved successfully: <uuid>
```

✅ 显示绿色 Toast 提示："Block 捕获成功！"

✅ 自动切换到"Block空间"标签页

✅ 在 Block 空间中看到新捕获的 Block，显示：
- 🤖 AI 标记
- AI 回复内容
- #AI回复 #手动捕获 标签
- 时间戳（刚刚）

### 6. 浏览器控制台快速测试

如果想快速验证 blockStore 是否正常工作，在控制台执行：

```javascript
// 检查初始化状态
console.log('blockStore 已初始化:', window.blockStore?.isInitialized?.() || '无法访问');

// 直接查询 IndexedDB
indexedDB.databases().then(dbs => {
  const db = dbs.find(d => d.name === 'blockos-db');
  console.log('blockos-db 存在:', !!db);
});
```

## 常见问题

### Q: 仍然显示"捕获失败"

**解决方案:**
1. 刷新页面（Cmd+R 或 Ctrl+R）
2. 清除浏览器缓存
3. 检查控制台是否有错误信息
4. 确保浏览器支持 IndexedDB

### Q: Block 空间中看不到捕获的 Block

**解决方案:**
1. 手动切换到"Block空间"标签页
2. 检查是否有标签过滤（确保选择"全部"）
3. 刷新页面

### Q: 控制台显示"Database not initialized"

**解决方案:**
1. 这个错误应该已经被修复了
2. 如果仍然出现，请刷新页面
3. 检查 App.tsx 中的 useEffect 是否正常执行

## 技术细节

### 修复前的问题

```typescript
// App.tsx - 缺少初始化
function App() {
  // ❌ 没有初始化 blockStore
}

// RightPanel.tsx - 没有检查初始化状态
const captureBlock = async (messageId: string) => {
  // ❌ 直接调用 saveBlock，可能 db 还未初始化
  await blockStore.saveBlock(block)
}
```

### 修复后的代码

```typescript
// App.tsx - 添加初始化
function App() {
  useEffect(() => {
    blockStore.init().catch(console.error)
  }, [])
}

// blockStore.ts - 添加检查方法
class BlockStore {
  isInitialized(): boolean {
    return this.db !== null
  }
}

// RightPanel.tsx - 添加初始化检查
const captureBlock = async (messageId: string) => {
  if (!blockStore.isInitialized()) {
    await blockStore.init()
  }
  await blockStore.saveBlock(block)
}
```

## 下一步

如果测试通过，可以继续测试其他功能：

1. 测试多次捕获不同的 AI 回复
2. 测试 Block 搜索功能
3. 测试标签过滤功能
4. 测试 Block 显示和排序

## 报告问题

如果测试失败，请提供以下信息：

1. 浏览器类型和版本
2. 控制台错误信息（完整的错误堆栈）
3. 操作步骤
4. 预期结果 vs 实际结果
