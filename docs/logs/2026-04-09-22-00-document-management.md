# 文档管理功能实现

## 实现时间
2026-04-09 22:00

## 问题修复

### 1. 创建项目无反应 🐛

#### 问题诊断
- 添加详细的控制台日志
- 添加错误提示对话框
- 确保 projectStore 初始化检查

#### 修复内容
```typescript
// Sidebar.tsx - handleCreateProject
console.log('[Sidebar] Creating project:', newProjectName.trim())

// 确保 projectStore 已初始化
if (!projectStore.isInitialized()) {
  console.log('[Sidebar] Initializing projectStore...')
  await projectStore.init()
}

// 添加错误提示
catch (error) {
  console.error('[Sidebar] Failed to create project:', error)
  alert('创建项目失败：' + (error instanceof Error ? error.message : '未知错误'))
}
```

#### 测试步骤
1. 打开浏览器控制台（F12）
2. 点击"+ 新建项目"
3. 输入项目名称
4. 点击"创建"按钮
5. 查看控制台日志：
   - `[Sidebar] Creating project: xxx`
   - `[Sidebar] Project created: xxx`
6. 如果失败，会显示错误对话框

## 功能实现

### 2. 文档管理系统 ✅

#### 核心概念
- **项目**：作为文件夹/容器，包含多个文档
- **文档**：实际的编辑内容，可以归属到项目
- **今日**：特殊视图，显示今天创建或修改的所有文档

#### 数据模型扩展

**Document 模型**：
```typescript
interface Document {
  id: string
  title: string
  content: string
  blocks: DocumentBlock[]
  projectId?: string  // 新增：所属项目 ID
  metadata: {
    createdAt: Date
    updatedAt: Date
  }
}
```

#### 新增方法

**documentStore.ts**：
```typescript
// 创建文档（支持项目关联）
async createDocument(title: string, projectId?: string): Promise<Document>

// 获取项目下的所有文档
async getDocumentsByProject(projectId: string): Promise<Document[]>

// 获取今日文档
async getTodayDocuments(): Promise<Document[]>

// 更新文档的项目归属
async updateDocumentProject(documentId: string, projectId?: string): Promise<void>
```

#### 工作流程

**创建文档**：
1. 用户点击"+ 新建标签页"按钮
2. 系统检查当前所在位置（今日 or 项目）
3. 如果在项目中，创建文档并关联到项目
4. 如果在今日，创建独立文档（不关联项目）
5. 更新项目的文档列表
6. 在新标签页中打开文档

**文档归属**：
```typescript
// App.tsx - handleNewTab
const projectId = currentProjectId && currentProjectId !== 'today' 
  ? currentProjectId 
  : undefined

const doc = await documentStore.createDocument('新文档', projectId)

if (projectId) {
  await projectStore.addDocumentToProject(projectId, doc.id)
}
```

## 使用场景

### 场景 1：在项目中创建文档

1. 点击左侧边栏的项目名称（例如："我的项目"）
2. 项目在新标签页中打开
3. 点击标签栏的 **+** 按钮
4. 创建新文档，自动关联到"我的项目"
5. 文档保存在项目文件夹下

### 场景 2：在今日创建文档

1. 点击左侧边栏的 **📅 今日**
2. 今日视图在标签页中打开
3. 点击标签栏的 **+** 按钮
4. 创建新文档，不关联到任何项目
5. 文档独立存在

### 场景 3：查看项目文档

1. 点击项目名称
2. 系统加载该项目下的所有文档
3. 在编辑器中显示文档列表（待实现）
4. 点击文档名称打开编辑

## 技术实现

### 文件变更

**修改文件**：
- `src/lib/documentStore.ts` - 扩展 Document 模型，添加项目关联方法
- `src/components/Sidebar.tsx` - 添加详细日志和错误处理
- `src/App.tsx` - 实现文档创建逻辑，关联项目

### 数据流

```
用户点击 + 按钮
    ↓
App.handleNewTab()
    ↓
检查当前位置（今日 or 项目）
    ↓
documentStore.createDocument(title, projectId?)
    ↓
创建 Document 对象
    ↓
保存到 IndexedDB (documents store)
    ↓
如果有 projectId
    ↓
projectStore.addDocumentToProject(projectId, docId)
    ↓
更新 Project.documents 数组
    ↓
创建新标签页
    ↓
在编辑器中打开文档
```

### 数据库结构

**IndexedDB: blockos-db (version 2)**
- `blocks` store - Block 数据
- `documents` store - 文档数据（包含 projectId 字段）
- `projects` store - 项目数据（包含 documents 数组）

### 关系维护

**项目 ↔ 文档**：
- Project.documents: string[] - 项目包含的文档 ID 列表
- Document.projectId?: string - 文档所属的项目 ID

**双向关系**：
- 创建文档时：更新 Document.projectId 和 Project.documents
- 删除文档时：从 Project.documents 中移除（待实现）
- 移动文档时：更新两个项目的 documents 数组（待实现）

## 测试步骤

### 1. 测试项目创建

1. 刷新浏览器页面
2. 打开控制台（F12）
3. 点击"+ 新建项目"
4. 输入项目名称："测试项目"
5. 点击"创建"按钮
6. 查看控制台日志
7. 确认项目出现在左侧边栏

### 2. 测试在项目中创建文档

1. 点击刚创建的"测试项目"
2. 项目在新标签页中打开
3. 点击标签栏的 **+** 按钮
4. 查看控制台日志：
   ```
   [App] Created new document: xxx projectId: xxx
   ```
5. 确认新标签页打开，标题为"新文档"

### 3. 测试在今日创建文档

1. 点击左侧边栏的 **📅 今日**
2. 点击标签栏的 **+** 按钮
3. 查看控制台日志：
   ```
   [App] Created new document: xxx projectId: undefined
   ```
4. 确认新标签页打开，文档不关联项目

### 4. 验证数据库

在控制台执行：
```javascript
// 查看所有文档
const request = indexedDB.open('blockos-db', 2);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['documents'], 'readonly');
  const store = tx.objectStore('documents');
  store.getAll().onsuccess = (e) => {
    console.log('所有文档:', e.target.result);
    e.target.result.forEach(doc => {
      console.log(`- ${doc.title} (projectId: ${doc.projectId || '无'})`);
    });
  };
  db.close();
};

// 查看所有项目
const request2 = indexedDB.open('blockos-db', 2);
request2.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['projects'], 'readonly');
  const store = tx.objectStore('projects');
  store.getAll().onsuccess = (e) => {
    console.log('所有项目:', e.target.result);
    e.target.result.forEach(proj => {
      console.log(`- ${proj.name} (${proj.documents.length} 个文档)`);
    });
  };
  db.close();
};
```

## 待实现功能

### P0 - 核心功能
- [ ] 项目视图显示文档列表
- [ ] 点击文档名称打开编辑
- [ ] 文档重命名
- [ ] 文档删除
- [ ] 文档在项目间移动

### P1 - 增强功能
- [ ] 文档搜索
- [ ] 文档排序（按名称、时间）
- [ ] 文档标签
- [ ] 文档收藏

### P2 - 高级功能
- [ ] 文档模板
- [ ] 文档导入/导出
- [ ] 文档版本历史
- [ ] 文档协作

## 已知问题

### 待修复
- 项目视图中还没有显示文档列表（需要实现文档列表组件）
- 标签页标题还不能编辑（需要实现标题编辑功能）

### 待优化
- 文档创建后应该自动聚焦到编辑器
- 标签页应该显示文档的保存状态
- 项目应该显示文档数量

## 技术亮点

1. **清晰的数据模型**：Document 和 Project 的关系明确
2. **双向关系维护**：自动更新项目的文档列表
3. **灵活的归属**：文档可以独立存在或归属到项目
4. **今日视图**：特殊的时间维度视图
5. **详细的日志**：便于调试和问题定位

---

**实现状态**: ✅ 完成  
**测试状态**: ⏳ 待测试  
**文档状态**: ✅ 完成
