# Block 捕获功能测试文档

## 测试目的
验证 Block 捕获功能的完整流程，定位并修复捕获按钮无响应的问题。

---

## 完整流程图

```
用户操作
  ↓
1. 点击"捕获为Block"按钮
  ↓
RightPanel.openCaptureDialog(messageId)
  ↓
2. 设置状态
  - setCaptureContent(content)
  - setCaptureMessageId(messageId)
  - setShowCaptureDialog(true)
  ↓
3. 渲染 BlockCaptureDialog 组件
  ↓
用户填写表单
  - 输入标题（可选）
  - 添加标签（可选）
  ↓
4. 点击"捕获"按钮
  ↓
BlockCaptureDialog.handleCaptureClick(e)
  ↓
5. 事件处理
  - e.preventDefault()
  - e.stopPropagation()
  - console.log('Capture button clicked')
  ↓
BlockCaptureDialog.handleCapture()
  ↓
6. 调用回调
  - onCapture(title, tags)
  ↓
RightPanel.handleCaptureBlock(title, tags)
  ↓
7. 创建 Block 对象
  - id: generateUUID()
  - content: captureContent
  - type: 'ai-generated'
  - source: { type: 'ai', aiMessageId, capturedAt }
  - metadata: { title, tags, createdAt, updatedAt }
  ↓
8. 保存到 IndexedDB
  - await blockStore.saveBlock(block)
  ↓
9. 关闭对话框
  - setShowCaptureDialog(false)
  ↓
10. 切换标签页
  - setActiveTab('blocks')
  ↓
完成 ✓
```

---

## 测试步骤

### 测试 1: 基础捕获流程

**步骤**：
1. 打开应用
2. 在 AI 对话中发送消息
3. 等待 AI 回复
4. 点击"◆ 捕获为Block"按钮
5. 观察对话框是否弹出

**预期结果**：
- ✅ 对话框正常弹出
- ✅ 显示 AI 回复内容预览
- ✅ 标题输入框为空
- ✅ 标签列表为空

**实际结果**：
- [ ] 通过 / [ ] 失败
- 失败原因：___________

---

### 测试 2: 只填写标题

**步骤**：
1. 在对话框中输入标题："测试标题"
2. 不添加标签
3. 点击"捕获"按钮
4. 打开浏览器控制台查看日志

**预期结果**：
- ✅ 控制台输出：`Capture button clicked { title: '测试标题', tags: [] }`
- ✅ 控制台输出：`handleCapture called { title: '测试标题', tags: [] }`
- ✅ 对话框关闭
- ✅ 自动切换到"Block空间"标签页
- ✅ Block 列表中显示新捕获的 Block

**实际结果**：
- [ ] 通过 / [ ] 失败
- 失败原因：___________

---

### 测试 3: 填写标题和标签

**步骤**：
1. 输入标题："产品特点"
2. 在标签输入框输入"技术"
3. 按 Enter 键添加标签
4. 再输入"AI"
5. 点击"+ 添加标签"按钮
6. 点击"捕获"按钮

**预期结果**：
- ✅ 标签列表显示：#技术 #AI
- ✅ 控制台输出：`Capture button clicked { title: '产品特点', tags: ['技术', 'AI'] }`
- ✅ 对话框关闭
- ✅ Block 保存成功
- ✅ Block 空间显示新 Block，包含标题和标签

**实际结果**：
- [ ] 通过 / [ ] 失败
- 失败原因：___________

---

### 测试 4: 标签输入框有内容时点击捕获

**步骤**：
1. 输入标题："测试"
2. 在标签输入框输入"未完成"（不按 Enter）
3. 直接点击"捕获"按钮

**预期结果**：
- ✅ 捕获按钮立即响应
- ✅ 对话框关闭
- ✅ Block 保存成功
- ✅ 标签列表不包含"未完成"（因为未添加）

**实际结果**：
- [ ] 通过 / [ ] 失败
- 失败原因：___________

---

### 测试 5: 快速连续点击

**步骤**：
1. 打开捕获对话框
2. 快速连续点击"捕获"按钮 3 次

**预期结果**：
- ✅ 只保存一个 Block
- ✅ 对话框关闭
- ✅ 没有重复保存

**实际结果**：
- [ ] 通过 / [ ] 失败
- 失败原因：___________

---

## 调试检查清单

### 1. 事件传播检查
- [ ] 对话框 overlay 的 onClick 是否阻止了事件冒泡？
- [ ] dialog-content 的 stopPropagation 是否正确？
- [ ] 按钮的 onClick 是否被其他元素遮挡？

### 2. CSS 层级检查
- [ ] 按钮的 z-index 是否足够高？
- [ ] 是否有其他元素覆盖在按钮上？
- [ ] pointer-events 是否被禁用？

### 3. 状态检查
- [ ] showCaptureDialog 状态是否正确？
- [ ] captureContent 是否有值？
- [ ] onCapture 回调是否正确传递？

### 4. 控制台检查
- [ ] 是否有 JavaScript 错误？
- [ ] 是否有 React 警告？
- [ ] console.log 是否输出？

---

## 已知问题和修复

### 问题 1: onBlur 事件冲突 ✅ 已修复

**问题描述**：
标签输入框的 onBlur 事件在点击捕获按钮时先触发，导致焦点问题。

**修复方案**：
- 移除 onBlur 事件
- 添加独立的"+ 添加标签"按钮
- 保留 Enter 键快捷添加

**修复代码**：
```typescript
// 移除
onBlur={handleAddTag}

// 添加
{tagInput.trim() && (
  <button onClick={handleAddTag}>+ 添加标签</button>
)}
```

---

### 问题 2: 按钮类型未指定 ✅ 已修复

**问题描述**：
按钮没有指定 type="button"，可能被当作 submit 按钮。

**修复方案**：
```typescript
<button 
  type="button"  // 明确指定类型
  className="btn-primary" 
  onClick={handleCaptureClick}
>
  捕获
</button>
```

---

### 问题 3: 事件处理不完整 ✅ 已修复

**问题描述**：
没有阻止默认行为和事件冒泡。

**修复方案**：
```typescript
const handleCaptureClick = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('Capture button clicked', { title, tags })
  handleCapture()
}
```

---

## 代码审查要点

### BlockCaptureDialog.tsx

```typescript
// ✅ 正确的事件处理
const handleCaptureClick = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('Capture button clicked', { title, tags })
  handleCapture()
}

// ✅ 正确的按钮配置
<button 
  type="button"
  className="btn-primary" 
  onClick={handleCaptureClick}
>
  捕获
</button>
```

### RightPanel.tsx

```typescript
// ✅ 正确的回调处理
const handleCaptureBlock = async (title: string, tags: string[]) => {
  try {
    const block: Block = {
      id: generateUUID(),
      content: captureContent,
      type: 'ai-generated',
      source: {
        type: 'ai',
        aiMessageId: captureMessageId,
        capturedAt: new Date()
      },
      metadata: {
        title: title || undefined,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    await blockStore.saveBlock(block)
    setShowCaptureDialog(false)
    setActiveTab('blocks')
  } catch (error) {
    console.error('Failed to capture block:', error)
  }
}
```

---

## 性能测试

### 测试场景 1: 大量内容捕获
- 内容长度：5000 字符
- 预期时间：< 100ms
- 实际时间：_______

### 测试场景 2: 多标签捕获
- 标签数量：20 个
- 预期时间：< 50ms
- 实际时间：_______

### 测试场景 3: 连续捕获
- 捕获次数：10 次
- 预期时间：< 1s
- 实际时间：_______

---

## 浏览器兼容性

- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)

---

## 测试结论

### 通过的测试
- [ ] 测试 1: 基础捕获流程
- [ ] 测试 2: 只填写标题
- [ ] 测试 3: 填写标题和标签
- [ ] 测试 4: 标签输入框有内容时点击捕获
- [ ] 测试 5: 快速连续点击

### 失败的测试
- 测试编号：_______
- 失败原因：_______
- 修复方案：_______

### 总体评估
- 功能完整性：_____ / 5
- 用户体验：_____ / 5
- 性能表现：_____ / 5
- 代码质量：_____ / 5

---

## 后续改进建议

1. **添加加载状态**：捕获时显示 loading 动画
2. **添加成功提示**：捕获成功后显示 toast 提示
3. **添加错误处理**：捕获失败时显示错误信息
4. **添加撤销功能**：支持撤销最近的捕获操作
5. **添加批量捕获**：支持一次捕获多条消息

---

**测试日期**：2026-04-09  
**测试人员**：_______  
**测试版本**：v0.1.0  
**测试状态**：进行中

