# BlockOS Bug 记录

> 记录所有已修复的 bug，便于查找相似问题和积累经验。每个记录控制在 400 字以内。

## 📊 统计
- **总计**: 1 个
- **本月**: 1 个
- **最近更新**: 2026-04-14

## 🔍 快速查找

### 按类型
- [编辑器相关](#编辑器相关)
- [AI 对话相关](#ai-对话相关)
- [Block 系统相关](#block-系统相关)
- [性能问题](#性能问题)
- [UI/样式问题](#ui样式问题)

### 按严重程度
- 🔴 严重：导致功能完全不可用
- 🟡 中等：影响部分功能
- 🟢 轻微：小问题或优化

---

## Bug 记录

### 编辑器相关

*暂无记录*

---

### AI 对话相关

*暂无记录*

---

### Block 系统相关

*暂无记录*

---

### 性能问题

*暂无记录*

---

### UI/样式问题

## #001 - 左侧边栏点击后闪一下不显示 (2026-04-14) 🔴

**问题描述**:
- 现象：点击 ActivityBar 上方的项目、大纲等按钮后，左侧边栏快速闪一下但不显示
- 触发：点击任意 ActivityBar 图标（资源管理器/搜索/置顶/大纲/插件）
- 影响：用户无法正常呼出左侧边栏，核心功能完全不可用

**根本原因**:
1. `handleSidebarViewChange` 使用 `toggleSidebar()` 切换状态，异步状态更新导致不一致
2. `Sidebar` 组件在 `collapsed=true` 时直接返回 `null`，导致重新挂载闪烁

**解决方案**:
- 修改文件：`src/App.tsx`, `src/components/layout/Sidebar.tsx`
- 核心改动：
  - App.tsx: 将 `toggleSidebar()` 改为直接设置 `setSidebarCollapsed(true/false)`
  - Sidebar.tsx: 移除 `if (collapsed) return null`，改用 `style={{ display: collapsed ? 'none' : 'flex' }}`
- 预防措施：避免使用 toggle 函数，直接设置状态更可靠；使用 CSS 控制显示避免重新挂载

**相关问题**: 无

**详细文档**: [bug-fix-sidebar-flash.md](./tests/bug-fix-sidebar-flash.md)

---

## 记录模板

```markdown
## #序号 - 简短标题 (YYYY-MM-DD) 🔴/🟡/🟢

**问题描述**:
- 现象：[用户看到的错误或异常行为]
- 触发：[什么操作导致的]
- 影响：[哪些功能受影响]

**根本原因**:
[技术层面的根本原因，1-2 句话说清楚]

**解决方案**:
- 修改文件：[文件路径]
- 核心改动：[关键代码变更]
- 预防措施：[如何避免再次发生]

**相关问题**: [如果有关联的 bug，标注 #序号]

---
```

## 使用说明

### 添加新记录
1. 确定 bug 类型，添加到对应分类下
2. 使用递增的编号（#001, #002...）
3. 严格控制在 400 字以内
4. 更新顶部统计信息

### 查找相似问题
```bash
# 搜索关键词
grep -i "editor" block-os/docs/bugs.md

# 查看最近 10 个 bug
tail -100 block-os/docs/bugs.md
```

### 引用 bug
在代码注释或文档中引用：
```typescript
// 修复 #001: 添加 editor 空值检查
if (!editor) return null
```

---

**维护者**: BlockOS Team  
**创建日期**: 2026-04-09  
**最后更新**: 2026-04-14
