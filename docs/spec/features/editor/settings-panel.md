# 设置面板功能

## 概述

增强用户账号按钮，点击后弹出设置面板，提供账号信息查看和云端/本地同步配置管理。

## 功能特性

### 1. 入口优化

**位置**：ActivityBar 底部用户图标
- 原功能：仅显示用户名 tooltip
- 新功能：点击打开设置面板
- 视觉反馈：hover 时显示背景高亮

### 2. 设置面板结构

#### 面板布局
- **顶部标题栏**：标题 + 关闭按钮
- **标签页导航**：账号 / 同步
- **内容区域**：可滚动，显示当前标签页内容
- **响应式设计**：最大宽度 600px，最大高度 80vh

#### 动画效果
- 遮罩层淡入（0.2s）
- 面板从下向上滑入（0.3s）
- 点击遮罩层关闭

### 3. 账号标签页

#### 账号信息
- **用户名**：显示当前登录用户名
- **用户 ID**：显示用户唯一标识（等宽字体）

#### 账号操作
- **退出登录**：红色危险按钮
  - 点击后关闭设置面板
  - 调用 `auth.signOut()`
  - 停止自动同步服务

### 4. 同步标签页

#### 同步模式显示

**云端同步模式**（Supabase 已配置）
- 图标：☁️ Cloud（蓝色圆形背景）
- 标题：云端同步模式
- 描述：数据自动同步到 Supabase，支持多设备协作

**本地模式**（Supabase 未配置）
- 图标：💾 HardDrive（灰色圆形背景）
- 标题：本地模式
- 描述：数据仅保存在本地 IndexedDB，不同步到云端

#### 同步状态（仅云端模式）

实时显示 4 项状态：
1. **网络状态**：在线 / 离线
2. **同步状态**：同步中... / 空闲
3. **上次同步**：刚刚 / X 分钟前 / X 小时前 / 日期时间
4. **待同步项**：X 项（带颜色徽章）

#### 同步操作（仅云端模式）

**立即同步按钮**
- 主色调按钮，带旋转图标
- 禁用条件：离线 / 正在同步
- 点击后手动触发同步
- 提示：自动同步每 30 秒检查一次

#### 同步配置（仅云端模式）

显示当前配置：
- **自动同步间隔**：30 秒（只读）
- **离线模式**：已启用（网络离线）/ 未启用

#### 启用云端同步（仅本地模式）

显示配置指南：
- 说明文字：要启用云端同步，请在 `.env` 文件中配置 Supabase
- 代码示例：
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```
- 提示：配置后重启开发服务器即可启用

## 技术实现

### 组件结构

```typescript
// src/components/panel/SettingsPanel.tsx

interface SettingsPanelProps {
  username: string
  userId: string
  onClose: () => void
  onSignOut: () => void
}

export function SettingsPanel({ username, userId, onClose, onSignOut }: SettingsPanelProps)
```

### 状态管理

```typescript
const [activeTab, setActiveTab] = useState<'account' | 'sync'>('account')
const [isSyncing, setIsSyncing] = useState(false)
const syncState = useAutoSync() // 实时同步状态
```

### 手动同步

```typescript
const handleManualSync = async () => {
  if (!isSupabaseEnabled || syncState.isOffline) return
  
  setIsSyncing(true)
  try {
    await autoSyncService.syncNow(userId)
  } catch (error) {
    console.error('手动同步失败:', error)
  } finally {
    setIsSyncing(false)
  }
}
```

### 时间格式化

```typescript
const formatLastSyncTime = (time: Date | null): string => {
  if (!time) return '从未同步'
  const diff = now.getTime() - time.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  return time.toLocaleString('zh-CN', { ... })
}
```

## 样式设计

### 设计原则
- 遵循项目现有设计语言
- 支持 Newsprint 主题适配
- 使用 CSS 变量保持一致性
- 响应式布局，移动端友好

### 主题适配

**默认主题**
- 背景：`var(--color-bg-primary, #fff)`
- 边框：`var(--color-border-primary, #e0e0e0)`
- 文字：`var(--color-text-primary, #1a1a1a)`

**Newsprint 主题**
- 背景：`#f5f1e8`（纸张色）
- 边框：`#d4c5a9`（复古棕）
- 保持整体复古报纸风格

### 状态徽章颜色

- **在线**：绿色 `#4caf50`
- **离线**：橙色 `#ff9800`
- **同步中**：蓝色 `#2196f3`
- **空闲**：灰色 `#666`
- **待同步**：紫色 `#9c27b0`
- **已同步**：绿色 `#4caf50`

## 集成点

### 1. ActivityBar 组件

```typescript
// src/components/layout/ActivityBar.tsx

interface ActivityBarProps {
  // ... 其他 props
  onOpenSettings?: () => void
}

<div 
  className="activity-icon user-icon" 
  title={`${username} - 点击打开设置`}
  onClick={onOpenSettings}
>
  <User size={20} />
</div>
```

### 2. App.tsx 主应用

```typescript
// src/App.tsx

const [showSettings, setShowSettings] = useState(false)

<ActivityBar
  // ... 其他 props
  onOpenSettings={() => setShowSettings(true)}
/>

{showSettings && auth.user && (
  <SettingsPanel
    username={auth.user.username}
    userId={auth.user.id}
    onClose={() => setShowSettings(false)}
    onSignOut={() => {
      setShowSettings(false)
      auth.signOut()
    }}
  />
)}
```

## 用户体验

### 交互流程

1. **打开设置**
   - 点击 ActivityBar 底部用户图标
   - 面板从下向上滑入
   - 默认显示"账号"标签页

2. **查看账号信息**
   - 显示用户名和用户 ID
   - 提供退出登录按钮

3. **查看同步状态**
   - 切换到"同步"标签页
   - 实时显示网络和同步状态
   - 查看待同步项数量

4. **手动同步**
   - 点击"立即同步"按钮
   - 按钮显示旋转动画
   - 同步完成后更新状态

5. **关闭设置**
   - 点击关闭按钮
   - 点击遮罩层
   - 面板淡出消失

### 状态反馈

- **加载状态**：按钮显示"同步中..."，图标旋转
- **禁用状态**：离线或同步中时按钮禁用
- **成功状态**：同步完成后更新"上次同步"时间
- **错误处理**：同步失败在控制台输出错误

## 可访问性

- 所有按钮有明确的 `title` 属性
- 键盘可访问（Tab 导航）
- 点击遮罩层关闭（符合用户预期）
- 颜色对比度符合 WCAG 标准

## 未来改进

- [ ] 添加更多账号设置（头像、邮箱）
- [ ] 同步历史记录查看
- [ ] 同步冲突解决 UI
- [ ] 自定义同步间隔
- [ ] 选择性同步（仅同步特定项目）
- [ ] 导出/导入数据功能
- [ ] 主题切换（移到设置面板）
- [ ] 快捷键配置

## 相关文件

### 新增文件
- `src/components/panel/SettingsPanel.tsx` - 设置面板组件
- `src/components/panel/SettingsPanel.css` - 设置面板样式
- `docs/spec/features/editor/settings-panel.md` - 功能文档

### 修改文件
- `src/components/layout/ActivityBar.tsx` - 添加 `onOpenSettings` 回调
- `src/components/layout/ActivityBar.css` - 用户图标 hover 样式
- `src/App.tsx` - 集成设置面板状态和渲染

---

**更新时间**: 2026-04-13  
**状态**: ✅ 已完成  
**版本**: v1.1.0
