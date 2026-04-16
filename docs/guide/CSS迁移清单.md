# CSS 迁移到 Tailwind 清单

## 📊 总览

**总计**：28 个 CSS 文件
- ✅ 已完成：12 个（43%）
- 🟡 明日完成：8 个（中风险）
- 🟢 未来完成：8 个（低优先级或高风险）

---

## ✅ 已完成（15个）

| 文件 | 组件 | 完成时间 |
|------|------|---------|
| src/components/ai/ChatLayout.css | ChatLayout | 2026-04-15 18:10 |
| src/components/ai/ChatHeader.css | ChatHeader | 2026-04-15 18:10 |
| src/components/ai/ChatInput.css | ChatInput | 2026-04-15 18:10 |
| src/components/ai/MessageContent.css | MessageContent | 2026-04-15 18:10 |
| src/components/ai/AIImmersivePanel.css | AIImmersivePanel | 2026-04-15 18:10 |
| src/components/layout/ExplorerView.css | ExplorerView | 2026-04-15 22:50 |
| src/components/layout/StarredView.css | StarredView | 2026-04-15 23:00 |
| src/components/layout/SearchView.css | SearchView | 2026-04-15 23:05 |
| src/components/layout/OutlineView.css | OutlineView | 2026-04-15 23:10 |
| src/components/layout/ExtensionsView.css | ExtensionsView | 2026-04-15 23:15 |
| src/components/layout/ActivityBar.css | ActivityBar | 2026-04-15 23:30 |
| src/components/layout/StatusBar.css | StatusBar | 2026-04-15 23:35 |
| src/components/layout/ResizeHandle.css | ResizeHandle | 2026-04-15 23:40 |
| src/components/shared/Toast.css | Toast | 2026-04-15 23:45 |
| src/components/shared/MarkdownRenderer.css | MarkdownRenderer | 2026-04-15 23:50 |
| src/components/shared/SyncStatusIndicator.css | SyncStatusIndicator | 2026-04-15 23:55 |
| src/components/layout/TabBar.css | TabBar | 2026-04-16 16:30 |
| src/components/panel/RightPanel.css | RightPanel | 2026-04-16 17:30 |
| src/components/panel/PreviewPanel.css | PreviewPanel | 2026-04-16 18:00 |

---

## 🎉 今日完成（6个）- 低风险组件

### 布局组件（3个）- P1 优先级
| 文件 | 组件 | 风险 | 状态 |
|------|------|------|------|
| src/components/layout/ActivityBar.css | ActivityBar | 🟢 低 | ✅ 完成 |
| src/components/layout/StatusBar.css | StatusBar | 🟢 低 | ✅ 完成 |
| src/components/layout/ResizeHandle.css | ResizeHandle | 🟢 低 | ✅ 完成 |

### 反馈组件（1个）- P1 优先级
| 文件 | 组件 | 风险 | 状态 |
|------|------|------|------|
| src/components/shared/Toast.css | Toast | 🟢 低 | ✅ 完成 |

### 展示组件（2个）- P1 优先级
| 文件 | 组件 | 风险 | 状态 |
|------|------|------|------|
| src/components/shared/MarkdownRenderer.css | MarkdownRenderer | 🟢 低 | ✅ 完成 |
| src/components/shared/SyncStatusIndicator.css | SyncStatusIndicator | 🟢 低 | ✅ 完成 |

**今日总计**：6个组件，约 1小时35分钟

---

## 🔴 已删除（不再需要完成）

### 左侧边栏组件（4个）- 已在前期完成
| 文件 | 组件 | 状态 |
|------|------|------|
| src/components/layout/StarredView.css | StarredView | ✅ 已完成 |
| src/components/layout/SearchView.css | SearchView | ✅ 已完成 |
| src/components/layout/OutlineView.css | OutlineView | ✅ 已完成 |
| src/components/layout/ExtensionsView.css | ExtensionsView | ✅ 已完成 |

---

## 🟡 明日完成（8个）- 中风险

### 右侧面板组件（7个）
| 文件 | 组件 | 风险 | 状态 | 说明 |
|------|------|------|------|------|
| src/components/layout/TabBar.css | TabBar | 🟡 中 | ✅ 完成 | 标签页栏 |
| src/components/panel/RightPanel.css | RightPanel | 🟡 中 | ✅ 完成 | 主面板容器 |
| src/components/panel/PreviewPanel.css | PreviewPanel | 🟡 中 | ✅ 完成 | 预览面板 |
| src/components/panel/BlockSpacePanel.css | BlockSpacePanel | 🟡 中 | ⏸️ 待开始 | Block 空间面板 |
| src/components/panel/BlockDetailPanel.css | BlockDetailPanel | 🟡 中 | ⏸️ 待开始 | Block 详情面板 |
| src/components/panel/BlockDerivativeSelector.css | BlockDerivativeSelector | 🟡 中 | ⏸️ 待开始 | Block 派生选择器 |
| src/components/panel/DocumentBlocksPanel.css | DocumentBlocksPanel | 🟡 中 | ⏸️ 待开始 | 文档 Block 面板 |
| src/components/panel/SessionHistoryPanel.css | SessionHistoryPanel | 🟡 中 | ⏸️ 待开始 | 会话历史面板 |

**明日总计**：约 3-4小时

---

## 🟢 未来完成（4个）- 低优先级或高风险

### 编辑器组件（2个）- 高风险
| 文件 | 组件 | 风险 | 说明 |
|------|------|------|------|
| src/components/editor/Editor.css | Editor | 🔴 高 | TipTap 编辑器核心（BubbleMenu 已迁移 ✅） |
| src/components/editor/SuggestionMenu.css | SuggestionMenu | 🟡 中 | 建议菜单 |

### 其他组件（2个）
| 文件 | 组件 | 风险 | 说明 |
|------|------|------|------|
| src/components/ai/AIFloatPanel.css | AIFloatPanel | 🟡 中 | AI 浮动面板 |
| src/components/auth/AuthPage.css | AuthPage | 🟢 低 | 认证页面（使用少） |

### 全局样式（2个）- 保留
| 文件 | 说明 | 处理方式 |
|------|------|---------|
| src/index.css | Design Token 系统 | ✅ 保留（已包含 Tailwind） |
| src/styles/responsive.css | 响应式样式 | ✅ 保留（全局响应式） |

### 插件样式（1个）- 保留
| 文件 | 说明 | 处理方式 |
|------|------|---------|
| src/plugins/ocr-plugin/OCRPanel.css | OCR 插件样式 | ✅ 保留（插件独立） |

### 废弃文件（2个）- 删除
| 文件 | 说明 | 处理方式 |
|------|------|---------|
| src/App.css | 旧的 App 样式 | 🗑️ 检查后删除 |
| src/styles/index.css | 旧的全局样式 | 🗑️ 检查后删除 |

---

## 📋 执行顺序

### ✅ 今晚已完成（2026-04-15）
```
1. ✅ ExplorerView      
2. ✅ StarredView       
3. ✅ SearchView        
4. ✅ OutlineView       
5. ✅ ExtensionsView    ← 完成左侧边栏里程碑
6. ✅ ActivityBar       
7. ✅ StatusBar         
8. ✅ ResizeHandle      
9. ✅ Toast             
10. ✅ MarkdownRenderer  
11. ✅ SyncStatusIndicator ← 今日结束（所有低风险组件完成！）
```

### 明天（2026-04-16）
```
1. TabBar
2. RightPanel
3. BlockSpacePanel
4. BlockDetailPanel
5. BlockDerivativeSelector
6. DocumentBlocksPanel
7. PreviewPanel
8. SessionHistoryPanel
```

### 未来
```
1. AIFloatPanel
2. SuggestionMenu
3. AuthPage
4. Editor（最后处理，风险最高）
```

---

## ✅ 验证清单

每个组件完成后：
- [ ] 移除 CSS 导入语句
- [ ] 删除 CSS 文件
- [ ] 运行 `bun run type-check`
- [ ] 手动测试功能
- [ ] Git 提交

全部完成后：
- [ ] 完整的功能回归测试
- [ ] 响应式测试（桌面/平板/手机）
- [ ] 主题切换测试（Default + Newsprint）
- [ ] 性能测试（页面加载速度）

---

**更新时间**：2026-04-16 18:20
**当前进度**：15/28 完成（54%）+ BubbleMenu 工具栏增强 ✅
**今日成果**：
- 完成 TabBar、RightPanel、PreviewPanel 组件迁移（Phase 4 进度：3/8 完成）
- 完成 BubbleMenu 工具栏增强（两行布局：Markdown 格式 + AI 操作）
**下一步**：安装 Badge、ScrollArea、Separator 组件，继续迁移剩余 5 个组件
