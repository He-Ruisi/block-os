# 右侧边栏重构需求文档

## 概述

参考 V0 右侧边栏设计，重构 BlockOS 右侧边栏（混合模式），提升视觉一致性和用户体验。

## 目标

1. 从 V0 的 Tailwind 类中提取设计变量
2. 添加生产级别功能（响应式、动画、键盘导航等）
3. 把 V0 的重复视觉样式抽成公共模式
4. 给 V0 输出的组件做"命名清洗"

## 参考资料

- **V0 右侧边栏**：`references/V0 右侧边栏/components/right-sidebar.tsx`
- **V0 全局样式**：`references/V0 右侧边栏/app/globals.css`
- **当前样式**：`src/styles/modules/blocks.css`, `src/styles/modules/panels.css`

## 实施计划

### 第一阶段：设计变量提取与样式系统升级（30分钟）✅

**目标**：从 V0 的 Tailwind 配置中提取设计变量，整合到 BlockOS 的 design-tokens.css

**完成内容**：
- ✅ 提取 V0 的颜色系统（accent-green: #35AB67, accent-green-dark: #00362F）
- ✅ 提取交互状态变量（hover, active, focus-ring）
- ✅ 提取间距和圆角系统（spacing-xs/sm/md/lg/xl, border-radius-sm/md/lg/xl）
- ✅ 提取阴影系统（shadow-card, shadow-panel）
- ✅ Newsprint 主题完整适配

**输出文件**：
- `src/styles/global/design-tokens.css` - 更新，新增 20+ 个设计变量

### 第二阶段：公共组件模式抽取（45分钟）✅

**目标**：识别 V0 中的重复视觉模式，抽取为 BlockOS 的公共样式类

**完成内容**：
- ✅ 卡片系统（card-base/interactive/highlighted）
- ✅ 标签系统（badge-base/primary/outline/tag/success）
- ✅ 输入框系统（input-base/search）
- ✅ 滚动区域（scroll-area + 自定义滚动条）
- ✅ 空状态（empty-state + icon/text/hint）
- ✅ 按钮系统（btn-base/primary/secondary/ghost）
- ✅ 分隔符（separator-horizontal/vertical）
- ✅ Newsprint 主题完整适配

**输出文件**：
- `src/styles/modules/common-patterns.css` - 新增，约 350 行

### 第三阶段：组件命名清洗与结构优化（60分钟）⏸️

**目标**：重构现有组件，应用语义化命名和新样式系统

#### 3.1 DocumentBlocksPanel 重构
- 应用 `.empty-state` 公共类
- 应用 `.card-base` 公共类
- 语义化命名：`.document-blocks-panel` → `.panel-blocks-document`

#### 3.2 BlockSpacePanel 重构
- 应用 `.input-search` 公共类
- 应用 `.card-interactive` 公共类
- 统一标签样式为 `.badge-tag`

#### 3.3 BlockDetailPanel 重构
- 参考 V0 的版本历史卡片样式
- 添加图标系统（Clock、Link2、FileText）
- 应用 `.card-base` 公共类

#### 3.4 BlockDerivativeSelector 重构
- 更新模态框阴影和圆角
- 应用 `.card-interactive` 公共类
- 添加选中状态的绿色强调

**输出文件**：
- 更新所有 `src/features/blocks/components/*.tsx`
- 更新 `src/styles/modules/blocks.css`

### 第四阶段：生产级功能增强（45分钟）⏸️

**目标**：添加 V0 中的生产级交互细节

#### 4.1 响应式优化
- 移动端：全屏显示
- 平板：420px 宽度
- 桌面：480px 宽度

#### 4.2 动画过渡
- 面板展开/收起动画（transition-all duration-300）
- 卡片悬停动画
- 标签切换动画

#### 4.3 键盘导航
- 搜索框自动聚焦
- 卡片列表键盘导航
- Esc 关闭模态框

#### 4.4 加载状态
- Block 列表加载骨架屏
- AI 对话流式加载动画

#### 4.5 错误处理
- 搜索无结果提示
- 网络错误重试按钮

**输出文件**：
- 更新 `src/styles/global/responsive.css`
- 新增 `src/styles/modules/animations.css`
- 更新所有组件的交互逻辑

### 第五阶段：集成测试与文档（30分钟）⏸️

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

## 关键约束

1. **不引入新依赖**：仅提取样式模式，不使用 shadcn/ui 组件库
2. **保持现有架构**：遵循 `src/styles/modules/` 组织方式
3. **向后兼容**：确保 Newsprint 主题正常工作
4. **类型安全**：所有组件保持 TypeScript 严格模式
5. **性能优先**：避免过度嵌套和冗余样式

## 预期效果

- 📁 目录结构更清晰，样式组织更规范
- 🔧 消除重复样式，减少维护成本
- 📦 公共模式可复用，提高开发效率
- 🎯 语义化命名，易于理解和维护
- 🎨 视觉一致性提升，用户体验更好

## 进度跟踪

- ✅ 第一阶段：设计变量提取（30分钟）- 完成
- ✅ 第二阶段：公共模式抽取（45分钟）- 完成
- ⏸️ 第三阶段：组件重构（60分钟）- 待开始
- ⏸️ 第四阶段：生产级功能（45分钟）- 待开始
- ⏸️ 第五阶段：测试与文档（30分钟）- 待开始

**总预计时间**：3.5 小时  
**已完成时间**：1.25 小时  
**剩余时间**：2.25 小时

## 相关文档

- [CSS 组织方案分析](./css.md)
- [任务列表](.kiro/specs/css-rightpanel/tasks.md)
- [V0 右侧边栏参考](../../references/V0 右侧边栏/)
