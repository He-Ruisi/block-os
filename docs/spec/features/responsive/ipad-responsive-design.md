# iPad 响应式设计

**状态**: 进行中  
**优先级**: P1  
**开始日期**: 2026-04-13

## 概述

为 BlockOS 添加完整的 iPad 和移动设备响应式支持，优化触摸交互体验，保持 default 和 newsprint 两套主题的完整适配。

## 设计目标

### 核心体验优化
- **触摸友好**: 所有可点击元素触摸目标 ≥ 44px
- **自适应布局**: 支持竖屏/横屏自动调整
- **优化字号**: iPad 上字号 16-17px，提升可读性
- **手势支持**: 滑动开关侧边栏、长按菜单
- **主题适配**: default 和 newsprint 主题完整响应式支持

### 响应式断点

```css
--breakpoint-mobile: 768px;    /* 手机 */
--breakpoint-tablet: 1024px;   /* iPad 竖屏 */
--breakpoint-desktop: 1280px;  /* iPad 横屏 + 桌面 */
```

## 实施阶段

### Phase 1: 基础响应式 ✅

**完成内容**:
- 创建 `src/styles/responsive.css` 响应式样式文件
- 创建 `src/hooks/useViewport.ts` 视口检测 Hook
- ActivityBar 响应式适配（平板 56px，手机底部导航栏）
- Sidebar 浮层模式（平板/手机点击遮罩层关闭）
- Editor Area 全宽布局（平板/手机）
- Toolbar 触摸友好按钮（40px）
- TabBar 增加标签高度（44px）
- RightPanel 浮层模式 + 关闭按钮
- StatusBar 响应式高度调整
- ResizeHandle 在平板/手机隐藏
- Newsprint 主题响应式适配
- iOS Safe Area 支持

**文件变更**:
- `src/styles/responsive.css` - 新建
- `src/hooks/useViewport.ts` - 新建
- `src/main.tsx` - 引入响应式样式
- `src/App.tsx` - 集成 useViewport Hook
- `src/components/layout/Sidebar.tsx` - 添加遮罩层和 onClose
- `src/components/layout/Sidebar.css` - 添加遮罩层样式
- `src/components/panel/RightPanel.tsx` - 添加关闭按钮

### Phase 2: 触摸优化 (待实施)

**计划内容**:
- 增加所有按钮尺寸到 ≥ 44px
- 优化字号和行距（iPad 16-17px）
- 添加触摸反馈动画（:active 状态）
- 测试触摸目标可达性
- 优化长按交互

### Phase 3: 手势交互 (待实施)

**计划内容**:
- 实现 `useSwipeGesture` Hook
- 侧边栏滑动开关
- 标签页滑动切换
- 长按菜单替代右键
- 捏合缩放支持（编辑器）

### Phase 4: 主题适配 (待实施)

**计划内容**:
- Newsprint 主题响应式微调
- 确保硬阴影在小屏幕正常显示
- 测试两套主题切换流畅性

### Phase 5: 测试优化 (待实施)

**计划内容**:
- iPad Mini / iPad / iPad Pro 测试
- Safari 浏览器兼容性
- 横竖屏切换流畅性
- 性能优化（减少重排）

## 技术实现

### 响应式布局策略

**桌面模式 (≥ 1280px)**:
- ActivityBar 固定 48px
- Sidebar 固定 240px，可折叠
- Editor Area 可调整宽度（400-1200px）
- RightPanel 固定 360px
- ResizeHandle 可拖拽

**平板模式 (768px - 1024px)**:
- ActivityBar 增加到 56px
- Sidebar 改为浮层（280px），点击遮罩层关闭
- Editor Area 全宽
- RightPanel 改为浮层（400px），带关闭按钮
- ResizeHandle 隐藏

**手机模式 (< 768px)**:
- ActivityBar 改为底部导航栏（60px）
- Sidebar 全宽浮层（85vw，最大 320px）
- Editor Area 全宽
- RightPanel 全屏浮层
- StatusBar 固定在底部导航栏上方

### 触摸交互增强

```typescript
// 触摸目标最小尺寸
@media (hover: none) and (pointer: coarse) {
  button, .toolbar-btn, .tab {
    min-height: 44px;
    min-width: 44px;
  }
}

// 触摸反馈
button:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

### 主题适配

**Default 主题**:
- 保持现有 CSS 变量系统
- 响应式字号调整
- 触摸目标尺寸优化

**Newsprint 主题**:
- 保持硬阴影风格（3px/5px/6px）
- 保持粗边框（2px）
- 字号调整（17px）
- 行高调整（1.7）

## 验收标准

- [ ] iPad 竖屏（768px）布局正常
- [ ] iPad 横屏（1024px+）布局正常
- [ ] 所有按钮触摸目标 ≥ 44px
- [ ] 字号在 iPad 上清晰可读（16-17px）
- [ ] 侧边栏滑动手势流畅
- [ ] 右侧面板可通过手势关闭
- [ ] Default 和 Newsprint 主题完整适配
- [ ] 横竖屏切换无布局错乱
- [ ] Safari 浏览器无兼容性问题
- [ ] 性能流畅（60fps）

## 架构约束

- 遵循 CLAUDE.md 规范（单一职责、类型安全、无循环依赖）
- 使用 CSS 变量保持主题一致性
- 响应式样式独立文件（`responsive.css`）
- Hook 层提供视口状态（`useViewport`）
- 组件层响应式逻辑最小化

## 相关文档

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - 架构概览
- [CLAUDE.md](../../../../CLAUDE.md) - 项目规范
- [todo.md](../../../todo.md) - 待办事项

