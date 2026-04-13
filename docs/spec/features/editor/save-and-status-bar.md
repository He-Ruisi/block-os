# 保存逻辑增强与底部状态栏

## 概述

增强文档保存逻辑，添加右键标签页保存功能和 Toast 提示。实现 VSCode 风格的底部状态栏，实时显示同步状态、自动保存状态、字数统计和引用块信息。

## 功能特性

### 1. 右键标签页保存

#### 功能入口
- **位置**：标签页右键菜单
- **菜单项**：💾 保存（置顶位置）
- **分隔线**：保存选项下方添加分隔线，与关闭选项分组

#### 保存逻辑
```typescript
const handleSaveDocument = async (tabId: string) => {
  if (!editor) return
  
  const tab = tabs.find(t => t.id === tabId)
  if (!tab || !tab.documentId) return
  
  setAutoSaveStatus('saving')
  try {
    await documentStore.updateDocumentBlocks(tab.documentId, editor.getJSON())
    setAutoSaveStatus('saved')
    setLastSaved(new Date())
    showToast('文档已保存', 'success')
  } catch (error) {
    showToast('保存失败', 'error')
    setAutoSaveStatus('unsaved')
  }
}
```

#### Toast 提示
- **成功**：绿色 ✓ "文档已保存"
- **失败**：红色 ✕ "保存失败"
- **位置**：右上角
- **持续时间**：3 秒
- **动画**：淡入淡出

### 2. 底部状态栏

#### 布局结构
```
┌─────────────────────────────────────────────────────────┐
│ [同步状态]        [自动保存状态]        [文档统计]      │
└─────────────────────────────────────────────────────────┘
```

#### 左侧：同步状态
实时显示云端同步状态（集成 `useAutoSync` Hook）

**4 种状态**：
1. **离线**：⛅ 离线（橙色）
2. **同步中**：☁️ 同步中（蓝色，旋转动画）
3. **待同步**：☁️ X 项待同步（紫色）
4. **已同步**：☁️ 已同步（绿色）

#### 中间：自动保存状态
显示文档保存状态

**3 种状态**：
1. **保存中**：💾 保存中...（蓝色，旋转动画）
2. **未保存**：💾 未保存（橙色）
3. **已保存**：💾 刚刚保存 / X 秒前保存 / X 分钟前保存（绿色）

**时间格式化**：
- < 5 秒：刚刚保存
- < 60 秒：X 秒前保存
- < 60 分钟：X 分钟前保存
- >= 60 分钟：HH:mm

#### 右侧：文档统计
显示当前文档的统计信息

**统计项**：
1. **字数**：📄 X,XXX 字（中文字符数）
2. **引用块**：🔗 X 块（SourceBlock 数量）
3. **双向链接**：🔗 X 链接（BlockLink 数量，可选显示）

### 3. 实时统计更新

#### 监听编辑器更新
```typescript
useEffect(() => {
  if (!editor) return
  
  const updateStats = () => {
    // 字数统计（中文字符）
    const text = editor.getText()
    const words = text.replace(/\s+/g, '').length
    setWordCount(words)
    
    // 统计 SourceBlock 和 BlockLink
    let blocks = 0
    let links = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'sourceBlock') blocks++
      if (node.type.name === 'blockLink') links++
    })
    setBlockCount(blocks)
    setLinkCount(links)
    
    // 标记为未保存
    if (autoSaveStatus === 'saved') {
      setAutoSaveStatus('unsaved')
    }
  }
  
  editor.on('update', updateStats)
  updateStats() // 初始统计
  
  return () => editor.off('update', updateStats)
}, [editor, autoSaveStatus])
```

## 技术实现

### 组件结构

#### StatusBar 组件
```typescript
// src/components/layout/StatusBar.tsx

interface StatusBarProps {
  wordCount: number
  blockCount: number
  linkCount: number
  autoSaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSaved: Date | null
}

export function StatusBar({
  wordCount,
  blockCount,
  linkCount,
  autoSaveStatus,
  lastSaved,
}: StatusBarProps)
```

#### useToast Hook
```typescript
// src/hooks/useToast.ts

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  const showToast = (message: string, type = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }
  
  return { toasts, showToast, removeToast }
}
```

### 样式设计

#### 状态栏样式
- **高度**：24px（紧凑设计）
- **背景**：`var(--color-bg-secondary)`
- **边框**：顶部 1px 边框
- **字体**：12px
- **布局**：Flexbox 三栏布局

#### 状态颜色
- **离线/未保存**：橙色 `#ff9800`
- **同步中/保存中**：蓝色 `#2196f3`
- **待同步**：紫色 `#9c27b0`
- **已同步/已保存**：绿色 `#4caf50`

#### 旋转动画
```css
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Newsprint 主题适配
```css
.theme-newsprint .status-bar {
  background: #ebe4d5;
  border-top-color: #d4c5a9;
}
```

## 集成点

### 1. App.tsx 主应用

```typescript
// 状态管理
const [wordCount, setWordCount] = useState(0)
const [blockCount, setBlockCount] = useState(0)
const [linkCount, setLinkCount] = useState(0)
const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
const [lastSaved, setLastSaved] = useState<Date | null>(null)
const { toasts, showToast, removeToast } = useToast()

// 保存文档
const handleSaveDocument = async (tabId: string) => { ... }

// 监听编辑器更新
useEffect(() => {
  if (!editor) return
  const updateStats = () => { ... }
  editor.on('update', updateStats)
  return () => editor.off('update', updateStats)
}, [editor, autoSaveStatus])

// 渲染状态栏
<StatusBar
  wordCount={wordCount}
  blockCount={blockCount}
  linkCount={linkCount}
  autoSaveStatus={autoSaveStatus}
  lastSaved={lastSaved}
/>

// 渲染 Toast
<div className="toast-container">
  {toasts.map(toast => (
    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
  ))}
</div>
```

### 2. TabBar 组件

```typescript
interface TabBarProps {
  // ... 其他 props
  onSaveTab: (tabId: string) => void
}

// 右键菜单
<div className="tab-context-menu">
  <button onClick={() => onSaveTab(ctxMenu.tabId)}>
    💾 保存
  </button>
  <div className="ctx-menu-separator" />
  <button onClick={() => onCloseTab(ctxMenu.tabId)}>
    关闭
  </button>
  {/* ... 其他选项 */}
</div>
```

### 3. Editor 区域布局

```
┌─────────────────────────────────┐
│ TabBar                          │
├─────────────────────────────────┤
│                                 │
│ Editor Content                  │
│                                 │
├─────────────────────────────────┤
│ StatusBar                       │
└─────────────────────────────────┘
```

## 用户体验

### 交互流程

1. **右键保存**
   - 右键点击标签页
   - 点击"💾 保存"
   - 状态栏显示"保存中..."
   - Toast 提示"文档已保存"
   - 状态栏更新为"刚刚保存"

2. **实时统计**
   - 用户输入文字
   - 状态栏实时更新字数
   - 插入 SourceBlock 时更新块数
   - 添加双向链接时更新链接数

3. **同步状态监控**
   - 网络离线时显示"离线"
   - 有待同步项时显示数量
   - 同步进行中显示旋转动画
   - 同步完成显示"已同步"

### 状态反馈

- **视觉反馈**：颜色区分不同状态
- **动画反馈**：旋转图标表示进行中
- **文字反馈**：清晰的状态描述
- **时间反馈**：智能时间格式化

## 性能优化

### 防抖处理
- 编辑器更新事件已有 500ms 防抖
- 统计计算在防抖后执行
- 避免频繁重新渲染

### 增量更新
- 仅在状态变化时更新 UI
- 使用 React.memo 优化组件
- 避免不必要的重新计算

## 可访问性

- 所有状态项有 `title` 属性
- 颜色对比度符合 WCAG 标准
- 支持键盘导航
- 屏幕阅读器友好

## 未来改进

- [ ] 自动保存功能（定时保存）
- [ ] 保存历史记录
- [ ] 撤销/重做次数显示
- [ ] 光标位置显示（行:列）
- [ ] 选中文字统计
- [ ] 导出进度显示
- [ ] 自定义状态栏项
- [ ] 状态栏右键菜单（隐藏/显示项）

## 相关文件

### 新增文件
- `src/hooks/useToast.ts` - Toast 管理 Hook
- `src/components/layout/StatusBar.tsx` - 底部状态栏组件
- `src/components/layout/StatusBar.css` - 状态栏样式
- `docs/spec/features/editor/save-and-status-bar.md` - 功能文档

### 修改文件
- `src/components/layout/TabBar.tsx` - 添加保存选项到右键菜单
- `src/components/layout/TabBar.css` - 添加菜单分隔线样式
- `src/App.tsx` - 集成状态栏和 Toast
- `src/App.css` - Toast 容器样式

---

**更新时间**: 2026-04-13  
**状态**: ✅ 已完成  
**版本**: v1.2.0
