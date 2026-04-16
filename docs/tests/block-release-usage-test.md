# Block 发布版本和引用记录测试指南

## 修复内容

已修复 Block 发布版本和引用记录的两个问题：

### 问题 1：编辑区域的 block 编辑后点击"发布版本"无响应
**原因：** 发布成功后没有更新节点的 `releaseVersion` 属性，导致重复发布时条件判断失败

**修复：** 在 `sourceBlock.ts` 中，发布成功后立即更新节点的 `releaseVersion` 和 `sourceLabel` 属性

### 问题 2：block 空间的引用记录一直为 0
**原因：** 发布新版本后没有调用 `recordBlockUsage` 记录引用

**修复：** 移除了条件判断 `if (currentReleaseVersion !== release.version)`，改为每次发布都调用 `recordBlockUsage`

## 快速测试步骤

### 准备工作

1. 启动开发服务器：
```bash
cd block-os
bun run dev
```

2. 打开浏览器访问 `http://localhost:5173`

3. 打开开发者工具（F12）查看控制台

### 测试场景 1：发布新版本后版本数增加

#### 步骤：

1. **创建一个 Block**
   - 在 AI 对话中输入："请写一段关于春天的描述"
   - 等待 AI 回复
   - 点击"◆ 捕获为Block"按钮

2. **将 Block 插入到编辑器**
   - 切换到"Block空间"标签页
   - 找到刚才捕获的 Block
   - 点击 Block 卡片进入详情面板
   - 点击"v1 · 原始版本"
   - 点击"插入到编辑器"按钮

3. **编辑 Block 内容**
   - 在编辑器中找到插入的 SourceBlock（带有"📦 v1 · 原始版本"标签）
   - 修改 Block 内容，例如添加一些文字或修改语气

4. **发布新版本**
   - 鼠标悬停在 SourceBlock 上，显示操作栏
   - 点击"📦 发布版本"按钮
   - 在弹出的输入框中输入版本标题，例如："更诗意的版本"
   - 点击"发布"按钮

#### 预期结果：

✅ **标签立即更新**
- SourceBlock 的标签从"📦 v1 · 原始版本"变为"📦 v2 · 更诗意的版本"

✅ **Block 空间版本数增加**
- 切换到"Block空间"标签页
- 找到该 Block 的卡片
- 版本数从"1 个版本"变为"2 个版本"

✅ **详情面板显示新版本**
- 点击 Block 卡片进入详情面板
- 在"版本历史"部分看到两个版本：
  - v2 · 更诗意的版本（最新）
  - v1 · 原始版本

✅ **控制台无错误**
- 控制台没有报错信息

### 测试场景 2：引用记录正确统计

#### 步骤：

1. **使用上面创建的 Block**
   - 确保已经发布了 v2 版本

2. **检查引用记录**
   - 在"Block空间"中点击该 Block 进入详情面板
   - 查看"引用记录"部分

#### 预期结果：

✅ **引用记录不为 0**
- 显示"2 次引用"（v1 和 v2 各一次）

✅ **引用详情正确**
- 引用记录中显示：
  - v1 · 原始版本 - 在文档"[当前文档名]"中
  - v2 · 更诗意的版本 - 在文档"[当前文档名]"中

### 测试场景 3：多次发布版本

#### 步骤：

1. **继续编辑和发布**
   - 再次修改 SourceBlock 内容
   - 点击"📦 发布版本"
   - 输入标题："第三版"
   - 点击"发布"

2. **重复多次**
   - 再发布 v4、v5...

#### 预期结果：

✅ **每次发布都成功**
- 标签每次都更新为最新版本号
- Block 空间的版本数持续增加
- 引用记录数量持续增加

✅ **版本号连续递增**
- v1 → v2 → v3 → v4 → v5...

### 测试场景 4：多个文档引用同一 Block

#### 步骤：

1. **创建新文档**
   - 点击"新建文档"按钮
   - 输入文档标题："测试文档2"

2. **插入同一个 Block**
   - 切换到"Block空间"
   - 找到之前创建的 Block
   - 点击进入详情面板
   - 选择某个版本（例如 v2）
   - 点击"插入到编辑器"

3. **检查引用记录**
   - 在详情面板查看"引用记录"

#### 预期结果：

✅ **引用记录包含多个文档**
- 显示该 Block 在不同文档中的引用
- 每条记录显示文档名称

## 浏览器控制台快速验证

在控制台执行以下代码快速验证：

```javascript
// 1. 检查 usageStore 是否有数据
const db = await new Promise((resolve, reject) => {
  const req = indexedDB.open('blockos-db');
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const tx = db.transaction(['usages'], 'readonly');
const usages = await new Promise((resolve, reject) => {
  const req = tx.objectStore('usages').getAll();
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

console.log('所有引用记录:', usages);
console.log('引用记录数量:', usages.length);

// 2. 检查某个 Block 的版本数
const blockId = 'YOUR_BLOCK_ID'; // 替换为实际的 Block ID
const blockTx = db.transaction(['blocks'], 'readonly');
const block = await new Promise((resolve, reject) => {
  const req = blockTx.objectStore('blocks').get(blockId);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

console.log('Block 版本数:', block?.releases?.length || 0);
console.log('所有版本:', block?.releases);
```

## 常见问题

### Q: 点击"发布版本"后标签没有更新

**可能原因：**
1. 浏览器缓存了旧代码
2. 发布失败但没有显示错误

**解决方案：**
1. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 检查控制台是否有错误信息
3. 检查网络请求是否成功

### Q: 引用记录仍然为 0

**可能原因：**
1. `recordBlockUsage` 调用失败
2. `documentStore.getCurrentDocumentId()` 返回 null

**解决方案：**
1. 确保在文档中插入 Block（不是在空白编辑器）
2. 检查控制台错误信息
3. 验证 documentStore 是否正常工作

### Q: 版本号不连续

**可能原因：**
1. 多次快速点击"发布"按钮
2. 发布失败但版本号已递增

**解决方案：**
1. 等待上一次发布完成后再点击
2. 检查 `blockStore.createRelease` 的实现

## 技术细节

### 修复前的代码

```typescript
// sourceBlock.ts - 问题代码
confirmBtn.addEventListener('mousedown', async (e) => {
  const release = await publishBlockRelease(blockId, title, currentContent)
  
  // ❌ 更新节点属性
  if (typeof getPos === 'function') {
    // ...更新 releaseVersion
  }
  
  // ❌ 条件判断导致不记录 usage
  if (currentReleaseVersion !== release.version) {
    await recordBlockUsage(blockId, release.version)
  }
})
```

### 修复后的代码

```typescript
// sourceBlock.ts - 修复后
confirmBtn.addEventListener('mousedown', async (e) => {
  const release = await publishBlockRelease(blockId, title, currentContent)
  
  // ✅ 立即更新节点属性
  if (typeof getPos === 'function') {
    const pos = getPos()
    editor.chain().focus().command(({ tr }: { tr: any }) => {
      tr.setNodeMarkup(pos, undefined, {
        ...nodeAttrs,
        releaseVersion: release.version,
        sourceLabel: `📦 v${release.version} · ${release.title}`,
      })
      return true
    }).run()
  }
  
  // ✅ 每次发布都记录 usage
  await recordBlockUsage(blockId, release.version)
  
  // ✅ 更新 UI
  labelEl.textContent = `📦 v${release.version} · ${title}`
  form.remove()
  window.dispatchEvent(new Event('blockUpdated'))
})
```

### 关键改进

1. **移除条件判断**：不再检查 `currentReleaseVersion !== release.version`，每次发布都记录 usage
2. **立即更新节点**：在调用 `recordBlockUsage` 之前先更新节点的 `releaseVersion` 属性
3. **触发更新事件**：通过 `window.dispatchEvent(new Event('blockUpdated'))` 通知其他组件刷新

## 相关文件

- `src/editor/extensions/sourceBlock.ts` - SourceBlock 节点定义和发布逻辑
- `src/services/blockReleaseService.ts` - Block 版本发布和 usage 记录服务
- `src/storage/blockStore.ts` - Block 数据存储
- `src/storage/usageStore.ts` - Block 引用记录存储

## 下一步

如果测试通过，可以继续测试：

1. Block 派生系统
2. Block 版本对比
3. Block 导出功能
4. Block 搜索和过滤

## 报告问题

如果测试失败，请提供：

1. 浏览器类型和版本
2. 控制台完整错误信息
3. 操作步骤截图
4. IndexedDB 数据快照（使用上面的控制台代码）
