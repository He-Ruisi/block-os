# IndexedDB 版本冲突修复

## 问题描述

用户报告：点击"捕获为Block"按钮后显示错误：
```
Block 捕获失败: An attempt was made to open a database using a lower version than the existing version
```

## 根本原因

**IndexedDB 版本冲突**：

- `blockStore.ts`: version = **1**
- `documentStore.ts`: version = **2**

两个 store 使用同一个数据库名 `'blockos-db'`，但版本号不同。

### 问题场景

1. Editor 组件先初始化 → 调用 `documentStore.init()` → 打开 `blockos-db` version 2
2. 用户点击"捕获为Block" → 调用 `blockStore.init()` → 尝试打开 `blockos-db` version 1
3. **错误**：IndexedDB 不允许用更低的版本打开已存在的数据库

### 为什么会有版本差异？

查看 Git 历史，`documentStore.ts` 在后期添加时将版本升级到 2，但 `blockStore.ts` 仍然是 version 1。

## 解决方案

### 1. 统一版本号

将 `blockStore.ts` 的版本号从 1 升级到 2：

```typescript
// blockStore.ts
export class BlockStore {
  private dbName = 'blockos-db'
  private storeName = 'blocks'
  private version = 2 // ✅ 统一版本号
  private db: IDBDatabase | null = null
}
```

### 2. 确保两个 store 都能创建对方的 objectStore

**blockStore.ts** 的 `onupgradeneeded`：

```typescript
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result

  // 创建 blocks store（如果不存在）
  if (!db.objectStoreNames.contains('blocks')) {
    const store = db.createObjectStore('blocks', { keyPath: 'id' })
    store.createIndex('tags', 'metadata.tags', { multiEntry: true })
    store.createIndex('createdAt', 'metadata.createdAt', { unique: false })
    store.createIndex('type', 'type', { unique: false })
  }

  // 创建 documents store（如果不存在）- 确保与 documentStore 兼容
  if (!db.objectStoreNames.contains('documents')) {
    const docStore = db.createObjectStore('documents', { keyPath: 'id' })
    docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
  }
}
```

**documentStore.ts** 的 `onupgradeneeded`：

```typescript
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result

  // 创建 blocks store（如果不存在）- 确保与 blockStore 兼容
  if (!db.objectStoreNames.contains('blocks')) {
    const blockStore = db.createObjectStore('blocks', { keyPath: 'id' })
    blockStore.createIndex('tags', 'metadata.tags', { multiEntry: true })
    blockStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
    blockStore.createIndex('type', 'type', { unique: false })
  }

  // 创建 documents store（如果不存在）
  if (!db.objectStoreNames.contains('documents')) {
    const store = db.createObjectStore('documents', { keyPath: 'id' })
    store.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
  }
}
```

### 3. 为什么这样做？

- **统一版本号**：避免版本冲突
- **互相创建 objectStore**：无论哪个 store 先初始化，都能确保两个 objectStore 都存在
- **向后兼容**：如果用户已经有 version 1 的数据库，升级到 version 2 时会自动创建 documents store

## 测试步骤

### 1. 清除旧数据库（推荐）

在浏览器控制台执行：

```javascript
// 删除旧数据库
indexedDB.deleteDatabase('blockos-db').onsuccess = () => {
  console.log('✅ 旧数据库已删除，请刷新页面');
};
```

然后刷新页面（Cmd+R 或 Ctrl+R）。

### 2. 验证数据库版本

```javascript
indexedDB.databases().then(dbs => {
  const db = dbs.find(d => d.name === 'blockos-db');
  console.log('数据库版本:', db?.version); // 应该显示 2
});
```

### 3. 测试 Block 捕获

1. 在对话框中发送消息给 AI
2. 等待 AI 回复
3. 点击"◆ 捕获为Block"按钮
4. 应该显示"Block 捕获成功！"

### 4. 验证数据

```javascript
const request = indexedDB.open('blockos-db', 2);
request.onsuccess = (e) => {
  const db = e.target.result;
  console.log('Object Stores:', Array.from(db.objectStoreNames));
  // 应该显示: ["blocks", "documents"]
  
  // 读取 blocks
  const tx = db.transaction(['blocks'], 'readonly');
  const store = tx.objectStore('blocks');
  store.getAll().onsuccess = (e) => {
    console.log('Blocks 数量:', e.target.result.length);
    console.log('Blocks:', e.target.result);
  };
  
  db.close();
};
```

## 预期结果

- ✅ 数据库版本统一为 2
- ✅ 同时存在 blocks 和 documents 两个 objectStore
- ✅ Block 捕获成功，无错误
- ✅ Block 空间显示新捕获的 Block

## 技术说明

### IndexedDB 版本管理规则

1. **版本号必须递增**：不能用更低的版本打开数据库
2. **onupgradeneeded 只在版本升级时触发**：从 version 1 → 2 时触发
3. **objectStore 只能在 onupgradeneeded 中创建**：不能在普通事务中创建

### 最佳实践

1. **统一版本号**：同一个数据库的所有 store 类应该使用相同的版本号
2. **集中管理**：考虑创建一个统一的数据库管理类
3. **版本迁移**：每次升级版本时，应该有明确的迁移逻辑

### 未来改进建议

创建一个统一的数据库管理类：

```typescript
// db.ts
export class Database {
  private static instance: Database
  private dbName = 'blockos-db'
  private version = 2
  private db: IDBDatabase | null = null

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async init(): Promise<void> {
    // 统一初始化逻辑
  }

  getDB(): IDBDatabase {
    if (!this.db) throw new Error('Database not initialized')
    return this.db
  }
}

// blockStore.ts 和 documentStore.ts 都使用这个单例
const db = Database.getInstance()
```

## 文件变更

- 修改：`src/lib/blockStore.ts` - 版本号改为 2，添加 documents store 创建逻辑
- 修改：`src/lib/documentStore.ts` - 添加 blocks store 创建逻辑

## 类型检查

✅ 通过 TypeScript 类型检查，无错误

---

**修复时间**: 2026-04-09 21:20  
**问题类型**: IndexedDB 版本冲突  
**严重程度**: 🔴 严重（阻塞核心功能）  
**修复状态**: ✅ 已修复
