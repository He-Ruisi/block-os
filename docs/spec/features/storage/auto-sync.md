# Supabase 自动同步功能

## 概述

实现了完整的 Supabase 云端自动同步功能，包括：
- 数据自动同步（本地操作后自动上传）
- 首次登录从云端拉取数据
- 离线模式支持（断网时使用本地数据）

## 功能特性

### 1. 自动同步机制

#### 工作原理
- 所有本地数据操作（Project/Document/Block 的创建、更新）会自动标记为"待同步"
- 后台定时任务每 30 秒检查一次待同步项
- 如果有待同步项且网络在线，自动上传到 Supabase
- 同步成功后清除待同步标记

#### 触发时机
- 创建新项目 → 标记项目待同步
- 更新项目信息 → 标记项目待同步
- 保存文档 → 标记文档待同步
- 保存 Block → 标记 Block 待同步

#### 实现细节
```typescript
// 在 storage 层自动标记变更
await documentStore.saveDocument(doc)
// ↓ 内部自动调用
autoSyncService.markDocumentChanged(doc.id)
```

### 2. 首次登录数据拉取

#### 工作流程
1. 用户输入用户名密码登录
2. 认证成功后，显示"正在同步云端数据..."
3. 从 Supabase 拉取所有 Projects/Documents/Blocks
4. 合并到本地 IndexedDB（云端数据覆盖本地）
5. 拉取完成，进入应用主界面

#### 使用场景
- 新设备首次登录
- 清空浏览器数据后重新登录
- 多设备协作（在设备 A 创建的数据，在设备 B 登录后自动拉取）

### 3. 离线模式支持

#### 网络状态监控
- 自动监听浏览器 `online`/`offline` 事件
- 网络状态变化时更新 UI 提示

#### 离线行为
- **离线时**：所有操作正常进行，数据保存到本地 IndexedDB
- **待同步队列**：离线期间的所有变更累积在待同步队列中
- **恢复在线**：检测到网络恢复后，立即同步所有待处理变更

#### UI 提示
- 离线状态：显示 "⚠️ 离线模式 - X 项待同步"
- 同步中：显示 "🔄 同步中..."
- 已同步：显示 "✓ 已同步"
- 待同步：显示 "⏳ X 项待同步"

## 技术实现

### 核心服务：`autoSyncService`

```typescript
// src/services/autoSyncService.ts

class AutoSyncService {
  // 状态管理
  private state: SyncState = {
    isSyncing: boolean
    lastSyncTime: Date | null
    pendingChanges: {
      projects: Set<string>
      documents: Set<string>
      blocks: Set<string>
    }
    isOnline: boolean
  }

  // 启动自动同步（登录后调用）
  startAutoSync(userId: string): void

  // 停止自动同步（登出后调用）
  stopAutoSync(): void

  // 同步待处理的变更
  syncPendingChanges(userId: string): Promise<void>

  // 首次登录拉取数据
  pullFromCloud(userId: string): Promise<{
    projects: number
    documents: number
    blocks: number
  }>

  // 标记变更
  markProjectChanged(projectId: string): void
  markDocumentChanged(documentId: string): void
  markBlockChanged(blockId: string): void
}
```

### React Hook：`useAutoSync`

```typescript
// src/hooks/useAutoSync.ts

export function useAutoSync() {
  return {
    isSyncing: boolean          // 是否正在同步
    isOnline: boolean            // 网络是否在线
    lastSyncTime: Date | null    // 上次同步时间
    pendingChangesCount: number  // 待同步项数量
    hasPendingChanges: boolean   // 是否有待同步项
    isOffline: boolean           // 是否离线
  }
}
```

### UI 组件：`SyncStatusIndicator`

```typescript
// src/components/shared/SyncStatusIndicator.tsx

export function SyncStatusIndicator() {
  const { isSyncing, isOffline, lastSyncTime, pendingChangesCount } = useAutoSync()
  
  // 根据状态显示不同的图标和文字
  // 离线：⚠️ 离线模式
  // 同步中：🔄 同步中...
  // 待同步：⏳ X 项待同步
  // 已同步：✓ 已同步
}
```

## 集成点

### 1. 认证流程集成

```typescript
// src/hooks/useAuth.ts

const handleSignIn = async (username: string, password: string) => {
  const user = await signIn(username, password)
  
  // 登录成功后拉取云端数据
  await autoSyncService.pullFromCloud(user.id)
  
  // 启动自动同步
  autoSyncService.startAutoSync(user.id)
}

const handleSignOut = async () => {
  // 停止自动同步
  autoSyncService.stopAutoSync()
  await signOut()
}
```

### 2. Storage 层集成

所有 store 的保存操作都自动标记变更：

```typescript
// src/storage/documentStore.ts
async saveDocument(doc: Document): Promise<string> {
  // ... 保存到 IndexedDB
  
  // 自动标记变更
  import('../services/autoSyncService').then(({ autoSyncService }) => {
    autoSyncService.markDocumentChanged(doc.id)
  })
}
```

### 3. UI 显示集成

```typescript
// src/components/layout/Sidebar.tsx
<div className="sidebar-panel-footer">
  <SyncStatusIndicator />
</div>
```

## 配置说明

### 同步间隔

默认 30 秒检查一次待同步项，可在 `autoSyncService.ts` 中修改：

```typescript
private readonly SYNC_INTERVAL_MS = 30000 // 30 秒
```

### Supabase 可选配置

如果 `.env` 中未配置 Supabase，自动同步功能会静默跳过：

```typescript
if (!isSupabaseEnabled) {
  console.log('[AutoSync] Supabase 未启用，跳过自动同步')
  return
}
```

## 使用场景

### 场景 1：单设备使用（本地模式）
- 不配置 Supabase
- 所有数据保存在本地 IndexedDB
- 同步功能不启用

### 场景 2：多设备协作（云同步模式）
- 配置 Supabase URL 和 Key
- 登录后自动拉取云端数据
- 本地操作自动同步到云端
- 其他设备登录后看到最新数据

### 场景 3：离线工作
- 在线时正常同步
- 断网后继续本地工作
- 恢复网络后自动同步所有变更

## 注意事项

### 1. 冲突处理
当前实现采用"最后写入胜出"策略：
- 云端数据覆盖本地数据（首次登录拉取时）
- 本地变更覆盖云端数据（自动同步时）
- 未来可考虑实现更复杂的冲突解决策略

### 2. 性能考虑
- 待同步队列使用 `Set` 去重，避免重复同步
- 同步过程中跳过新的同步请求，避免并发冲突
- 仅同步有变更的项，不做全量同步

### 3. 错误处理
- 单个项同步失败不影响其他项
- 同步失败的项保留在待同步队列中
- 下次同步时会重试

## 未来改进

- [ ] 增量同步（仅同步变更字段）
- [ ] 冲突检测和解决 UI
- [ ] 同步历史记录
- [ ] 手动触发同步按钮
- [ ] 同步进度详情（显示正在同步哪些项）
- [ ] 同步失败重试策略（指数退避）
- [ ] 批量同步优化（合并多个请求）

## 相关文件

### 核心服务
- `src/services/autoSyncService.ts` - 自动同步服务
- `src/services/syncService.ts` - Supabase 同步 API 封装

### React Hooks
- `src/hooks/useAutoSync.ts` - 同步状态 Hook
- `src/hooks/useAuth.ts` - 认证 Hook（集成同步）

### UI 组件
- `src/components/shared/SyncStatusIndicator.tsx` - 同步状态指示器
- `src/components/auth/AuthPage.tsx` - 登录页（显示数据拉取状态）

### Storage 层
- `src/storage/documentStore.ts` - 文档存储（集成同步标记）
- `src/storage/projectStore.ts` - 项目存储（集成同步标记）
- `src/storage/blockStore.ts` - Block 存储（集成同步标记）

---

**更新时间**: 2026-04-13  
**状态**: ✅ 已完成  
**版本**: v1.0.0
