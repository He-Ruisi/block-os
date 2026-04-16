
# 右侧边栏重构任务列表（混合模式）

### 📋 任务概览
将 V0 右侧边栏的现代化设计和交互模式融入 BlockOS，同时保持项目现有的架构约束和样式组织方式。

---

### 🎯 第一阶段：设计变量提取与样式系统升级（30分钟）

**目标**：从 V0 的 Tailwind 配置中提取设计变量，整合到 BlockOS 的 design-tokens.css

**具体任务**：
1. **提取 V0 的颜色系统**
   - 从 `globals.css` 提取 oklch 颜色定义
   - 映射到 BlockOS 现有的 CSS 变量命名规范
   - 新增：`--accent-green`（#35AB67）、`--accent-green-dark`（#00362F）
   - 保留现有的 `--color-purple` 作为主品牌色

2. **提取交互状态变量**
   - 新增：`--color-hover`、`--color-active`、`--color-focus-ring`
   - 统一卡片、按钮、输入框的交互反馈

3. **提取间距和圆角系统**
   - 新增：`--spacing-xs`、`--spacing-sm`、`--spacing-md`、`--spacing-lg`
   - 统一：`--radius-sm`、`--radius-md`、`--radius-lg`

4. **提取阴影系统**
   - 优化现有的 `--shadow-sm/md/lg`
   - 新增：`--shadow-card`（卡片专用）、`--shadow-panel`（面板专用）

**输出文件**：
- 更新 `src/styles/global/design-tokens.css`
- 新增变量映射注释（V0 → BlockOS）

---

### 🏗️ 第二阶段：公共组件模式抽取（45分钟）

**目标**：识别 V0 中的重复视觉模式，抽取为 BlockOS 的公共样式类

**具体任务**：

#### 2.1 卡片系统（Card Pattern）
- **V0 模式**：`bg-secondary hover:bg-accent border border-border hover:border-accent-green/50`
- **BlockOS 抽取**：
  ```css
  .card-base { /* 基础卡片 */ }
  .card-interactive { /* 可交互卡片 */ }
  .card-highlighted { /* 高亮卡片 */ }
  ```
- **应用到**：BlockSpacePanel、DocumentBlocksPanel、BlockDetailPanel

#### 2.2 标签系统（Badge Pattern）
- **V0 模式**：多种 Badge 变体（default/secondary/outline）
- **BlockOS 抽取**：
  ```css
  .badge-base { /* 基础标签 */ }
  .badge-primary { /* 主色标签 */ }
  .badge-outline { /* 轮廓标签 */ }
  .badge-tag { /* 标签专用 */ }
  ```
- **应用到**：所有 Block 面板的标签显示

#### 2.3 输入框系统（Input Pattern）
- **V0 模式**：`bg-input border-border focus:ring-ring`
- **BlockOS 抽取**：
  ```css
  .input-base { /* 基础输入框 */ }
  .input-search { /* 搜索框（带图标） */ }
  ```
- **应用到**：BlockSpacePanel 搜索、AI 对话输入

#### 2.4 滚动区域（ScrollArea Pattern）
- **V0 模式**：自定义滚动条样式
- **BlockOS 抽取**：
  ```css
  .scroll-area { /* 统一滚动条样式 */ }
  ```
- **应用到**：所有面板的内容区域

#### 2.5 空状态（Empty State Pattern）
- **V0 模式**：居中图标 + 文字 + 提示
- **BlockOS 抽取**：
  ```css
  .empty-state { /* 空状态容器 */ }
  .empty-state__icon { /* 图标 */ }
  .empty-state__text { /* 主文字 */ }
  .empty-state__hint { /* 提示文字 */ }
  ```
- **应用到**：所有面板的空状态

**输出文件**：
- 新增 `src/styles/modules/common-patterns.css`
- 更新 `src/styles/modules/blocks.css`（应用新模式）
- 更新 `src/styles/modules/panels.css`（应用新模式）

---

### 🧹 第三阶段：组件命名清洗与结构优化（60分钟）

**目标**：重构现有组件，应用语义化命名和新样式系统

#### 3.1 DocumentBlocksPanel 重构
**当前问题**：
- 类名过长：`.document-blocks-panel__empty-icon`
- 结构嵌套：多层 div 包裹

**重构方案**：
```tsx
// 之前
<div className="document-blocks-panel__empty">
  <div className="document-blocks-panel__empty-icon">⏳</div>
  <div className="document-blocks-panel__empty-text">加载中...</div>
</div>

// 之后（应用公共模式）
<div className="empty-state">
  <span className="empty-state__icon">⏳</span>
  <p className="empty-state__text">加载中...</p>
</div>
```

**命名清洗**：
- `.document-blocks-panel` → `.panel-blocks-document`
- `.document-blocks-panel__node` → `.block-node`
- `.document-blocks-panel__stats` → `.panel-footer-stats`

#### 3.2 BlockSpacePanel 重构
**当前问题**：
- 搜索框样式重复
- 卡片样式与 V0 不一致

**重构方案**：
- 应用 `.input-search` 公共类
- 应用 `.card-interactive` 公共类
- 统一标签样式为 `.badge-tag`

#### 3.3 BlockDetailPanel 重构
**当前问题**：
- 版本历史样式简陋
- 引用记录缺少图标

**重构方案**：
- 参考 V0 的版本历史卡片样式
- 添加图标系统（Clock、Link2、FileText）
- 应用 `.card-base` 公共类

#### 3.4 BlockDerivativeSelector 重构
**当前问题**：
- 模态框样式老旧
- 选项卡片缺少悬停效果

**重构方案**：
- 更新模态框阴影和圆角
- 应用 `.card-interactive` 公共类
- 添加选中状态的绿色强调（参考 V0）

**输出文件**：
- 更新所有 `src/features/blocks/components/*.tsx`
- 更新 `src/styles/modules/blocks.css`

---

### 🎨 第四阶段：生产级功能增强（45分钟）

**目标**：添加 V0 中的生产级交互细节

#### 4.1 响应式优化
- **V0 特性**：`sm:w-96 md:w-[420px] lg:w-[480px]`
- **BlockOS 应用**：
  - 移动端：全屏显示
  - 平板：420px 宽度
  - 桌面：480px 宽度

#### 4.2 动画过渡
- **V0 特性**：`transition-all duration-300 ease-in-out`
- **BlockOS 应用**：
  - 面板展开/收起动画
  - 卡片悬停动画
  - 标签切换动画

#### 4.3 键盘导航
- **V0 特性**：焦点管理、Tab 导航
- **BlockOS 应用**：
  - 搜索框自动聚焦
  - 卡片列表键盘导航
  - Esc 关闭模态框

#### 4.4 加载状态
- **V0 特性**：Skeleton 加载占位
- **BlockOS 应用**：
  - Block 列表加载骨架屏
  - AI 对话流式加载动画

#### 4.5 错误处理
- **V0 特性**：优雅的错误提示
- **BlockOS 应用**：
  - 搜索无结果提示
  - 网络错误重试按钮

**输出文件**：
- 更新 `src/styles/global/responsive.css`
- 新增 `src/styles/modules/animations.css`
- 更新所有组件的交互逻辑

---

### 📦 第五阶段：集成测试与文档（30分钟）

**目标**：确保重构后的系统稳定可用

#### 5.1 视觉回归测试
- 对比重构前后的截图
- 检查所有面板的显示效果
- 验证主题切换（默认 + Newsprint）

#### 5.2 交互测试
- 测试所有按钮和链接
- 测试搜索和过滤功能
- 测试模态框和面板切换

#### 5.3 性能测试
- 检查 CSS 文件大小
- 验证动画流畅度
- 测试大量 Block 的渲染性能

#### 5.4 文档更新
- 更新 `docs/spec/features/styles/css.md`
- 添加公共模式使用指南
- 更新组件命名规范文档

**输出文件**：
- 更新 `docs/spec/features/styles/css.md`
- 新增 `docs/guide/common-patterns-guide.md`

---

## 📊 任务总结

| 阶段 | 预计时间 | 主要产出 | 风险等级 |
|------|---------|---------|---------|
| 第一阶段 | 30分钟 | 设计变量系统 | 低 |
| 第二阶段 | 45分钟 | 公共样式模式 | 中 |
| 第三阶段 | 60分钟 | 组件重构 | 高 |
| 第四阶段 | 45分钟 | 生产级功能 | 中 |
| 第五阶段 | 30分钟 | 测试与文档 | 低 |
| **总计** | **3.5小时** | **完整重构** | **中** |

---

## ⚠️ 关键约束

1. **不引入新依赖**：不使用 shadcn/ui 组件库，仅提取样式模式
2. **保持架构**：遵循现有的 `src/styles/modules/` 组织方式
3. **向后兼容**：确保 Newsprint 主题正常工作
4. **类型安全**：所有组件保持 TypeScript 严格模式
5. **性能优先**：避免过度嵌套和冗余样式

---
