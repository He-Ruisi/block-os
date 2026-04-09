# 关键问题修复

## 修复时间
2026-04-09 22:10

## 问题 1：创建项目失败 🐛

### 错误信息
```
Failed to execute 'transaction' on 'IDBDatabase': 
One of the specified object stores was not found.
```

### 根本原因
- 数据库已经是 version 2（由 blockStore 或 documentStore 创建）
- projectStore 也使用 version 2，但 `onupgradeneeded` 不会触发
- 导致 `projects` store 没有被创建
- 尝试访问不存在的 store 时报错

### 解决方案

**1. 升级数据库版本到 3**

所有 store 统一使用 version 3：
```typescript
// blockStore.ts
private version = 3

// documentStore.ts
private version = 3

// projectStore.ts
private version = 3
```

**2. 确保所有 store 都创建 projects**

在每个 store 的 `onupgradeneeded` 中都添加创建 projects store 的逻辑：

```typescript
// blockStore.ts, documentStore.ts, projectStore.ts
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result

  // 创建 blocks store（如果不存在）
  if (!db.objectStoreNames.contains('blocks')) {
    const blockStore = db.createObjectStore('blocks', { keyPath: 'id' })
    blockStore.createIndex('tags', 'metadata.tags', { multiEntry: true })
    blockStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
    blockStore.createIndex('type', 'type', { unique: false })
  }

  // 创建 documents store（如果不存在）
  if (!db.objectStoreNames.contains('documents')) {
    const docStore = db.createObjectStore('documents', { keyPath: 'id' })
    docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
  }

  // 创建 projects store（如果不存在）
  if (!db.objectStoreNames.contains('projects')) {
    const projStore = db.createObjectStore('projects', { keyPath: 'id' })
    projStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
    projStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
  }
}
```

### 为什么这样做？

**问题场景**：
1. 用户首次访问 → blockStore 初始化 → 创建 version 2 数据库 → 创建 blocks 和 documents stores
2. 用户点击创建项目 → projectStore 初始化 → 尝试打开 version 2 数据库
3. 数据库已经是 version 2 → `onupgradeneeded` 不触发 → projects store 未创建
4. 尝试访问 projects store → 报错

**解决方案**：
- 升级到 version 3 → 触发 `onupgradeneeded`
- 所有 store 都创建 projects → 无论谁先初始化都能确保 projects 存在

### 用户操作

**重要：需要清除旧数据库！**

在浏览器控制台执行：
```javascript
indexedDB.deleteDatabase('blockos-db').onsuccess = () => {
  console.log('✅ 旧数据库已删除，请刷新页面');
  location.reload();
};
```

或者手动刷新页面，系统会自动升级数据库。

## 问题 2：创建文档后不跳转到编辑区 🐛

### 问题描述
- 点击 + 按钮创建新文档
- 新标签页打开
- 但编辑器仍然显示旧内容，没有加载新文档

### 根本原因
- Editor 组件没有接收 documentId prop
- 无法知道应该加载哪个文档
- 始终显示默认内容

### 解决方案

**1. 扩展 EditorProps**

```typescript
interface EditorProps {
  onEditorReady?: (editor: TiptapEditor) => void
  onTextSelected?: (text: string) => void
  documentId?: string  // 新增：要加载的文档 ID
}
```

**2. 修改文档加载逻辑**

```typescript
useEffect(() => {
  const loadDocument = async () => {
    if (!editor) return

    let doc
    
    if (documentId) {
      // 加载指定的文档
      doc = await documentStore.getDocument(documentId)
      console.log('[Editor] Loading document:', documentId)
    } else {
      // 加载默认文档
      const docs = await documentStore.getAllDocuments()
      doc = docs[0]
    }
    
    // 加载文档内容到编辑器
    if (doc.content) {
      const content = JSON.parse(doc.content)
      editor.commands.setContent(content)
    } else {
      // 新文档，清空编辑器
      editor.commands.setContent('')
    }
  }

  loadDocument()
}, [editor, documentId])  // 监听 documentId 变化
```

**3. 在 App.tsx 中传递 documentId**

```typescript
<Editor 
  onEditorReady={setEditor}
  onTextSelected={handleTextSelected}
  documentId={tabs.find(t => t.id === activeTabId)?.documentId}
/>
```

### 工作流程

```
用户点击 + 按钮
    ↓
创建新文档（documentId: xxx）
    ↓
创建新标签页（documentId: xxx）
    ↓
设置为活动标签页
    ↓
App 传递 documentId 给 Editor
    ↓
Editor useEffect 监听到 documentId 变化
    ↓
加载文档内容
    ↓
如果是新文档（content 为空）
    ↓
清空编辑器，准备输入
    ↓
用户可以开始编辑
```

## 测试步骤

### 1. 清除旧数据库

在浏览器控制台执行：
```javascript
indexedDB.deleteDatabase('blockos-db').onsuccess = () => {
  console.log('✅ 数据库已清除');
  location.reload();
};
```

### 2. 测试创建项目

1. 刷新页面
2. 打开控制台（F12）
3. 点击"+ 新建项目"
4. 输入项目名称："测试项目"
5. 点击"创建"按钮
6. 查看控制台日志：
   ```
   [Sidebar] Creating project: 测试项目
   [Sidebar] Project created: xxx
   ```
7. 确认项目出现在左侧边栏

### 3. 测试创建文档并跳转

1. 点击刚创建的"测试项目"
2. 点击标签栏的 **+** 按钮
3. 查看控制台日志：
   ```
   [App] Created new document: xxx projectId: xxx
   [Editor] Loading document: xxx
   [Editor] New document, editor cleared
   ```
4. 确认编辑器清空，可以开始输入
5. 输入一些文字
6. 切换到其他标签页，再切换回来
7. 确认文字被保存并正确加载

### 4. 验证数据库结构

在控制台执行：
```javascript
const request = indexedDB.open('blockos-db', 3);
request.onsuccess = (e) => {
  const db = e.target.result;
  console.log('数据库版本:', db.version);
  console.log('Object Stores:', Array.from(db.objectStoreNames));
  // 应该显示: ["blocks", "documents", "projects"]
  db.close();
};
```

## 文件变更

### 修改文件
- `src/lib/blockStore.ts` - 版本升级到 3，添加 projects store 创建逻辑
- `src/lib/documentStore.ts` - 版本升级到 3，添加 projects store 创建逻辑
- `src/lib/projectStore.ts` - 版本升级到 3
- `src/components/Editor.tsx` - 添加 documentId prop，修改文档加载逻辑
- `src/App.tsx` - 传递 documentId 给 Editor

## 技术亮点

1. **统一版本管理**：所有 store 使用相同的版本号
2. **互相兼容**：每个 store 都能创建所有需要的 objectStores
3. **响应式加载**：Editor 监听 documentId 变化，自动加载文档
4. **清晰的日志**：便于调试和问题定位

## 已知问题

### 待优化
- 文档切换时可能有短暂的闪烁（可以添加加载状态）
- 新文档的标题还是"新文档"（需要实现标题编辑功能）

---

**修复状态**: ✅ 完成  
**测试状态**: ⏳ 待测试  
**严重程度**: 🔴 严重（阻塞核心功能）
