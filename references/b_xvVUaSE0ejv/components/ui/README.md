# V0.dev UI 组件库分类

本文档说明了 v0.dev 生成的 Shadcn/UI 组件的分类组织结构。

## 📁 目录结构

```
ui/
├── ai_immerse/          # AI 沉浸模式组件（6 个）
├── layout/              # 布局组件（5 个）
├── navigation/          # 导航组件（5 个）
├── form/                # 表单组件（13 个）
├── button/              # 按钮组件（4 个）
├── overlay/             # 弹出层组件（9 个）
├── feedback/            # 反馈组件（7 个）
├── display/             # 展示组件（10 个）
├── utility/             # 工具组件（2 个）
└── hooks/               # React Hooks（2 个）
```

## 🎨 组件分类详情

### 1. AI 沉浸模式（ai_immerse/）- 6 个组件

专为 AI 对话界面设计的组件集合。

| 组件 | 说明 | 用途 |
|------|------|------|
| `ai-header.tsx` | 顶部导航栏 | 显示标题、操作按钮 |
| `ai-input.tsx` | 底部输入框 | 用户输入消息 |
| `ai-message.tsx` | 消息内容区 | 显示对话消息 |
| `ai-sidebar.tsx` | 右侧边栏 | 历史记录、设置 |
| `ai-immerse.tsx` | 主容器 | 整合所有子组件 |
| `index.ts` | 导出文件 | 统一导出接口 |

**设计特点**：
- Notion/Roam 风格
- 流式响应支持
- 响应式布局（桌面/平板/手机）
- 完整的 Tailwind CSS 样式

---

### 2. 布局组件（layout/）- 5 个组件

用于页面布局和容器的基础组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `sidebar.tsx` | 侧边栏系统 | 完整的侧边栏解决方案（20+ 子组件） |
| `resizable.tsx` | 可调整大小 | 拖拽调整面板大小 |
| `separator.tsx` | 分隔线 | 水平/垂直分隔 |
| `scroll-area.tsx` | 滚动区域 | 自定义滚动条样式 |
| `sheet.tsx` | 抽屉面板 | 从边缘滑入的面板 |

**核心组件**：
- **sidebar.tsx**：包含 SidebarProvider、SidebarContent、SidebarHeader、SidebarFooter、SidebarMenu、SidebarMenuItem、SidebarMenuButton 等 20+ 子组件

---

### 3. 导航组件（navigation/）- 5 个组件

用于页面导航和路由的组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `navigation-menu.tsx` | 导航菜单 | 多级导航菜单 |
| `menubar.tsx` | 菜单栏 | 顶部菜单栏 |
| `breadcrumb.tsx` | 面包屑 | 路径导航 |
| `tabs.tsx` | 标签页 | 内容切换 |
| `pagination.tsx` | 分页 | 数据分页 |

---

### 4. 表单组件（form/）- 13 个组件

用于用户输入和数据收集的组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `input.tsx` | 输入框 | 文本输入 |
| `textarea.tsx` | 多行文本框 | 长文本输入 |
| `select.tsx` | 下拉选择 | 单选/多选 |
| `checkbox.tsx` | 复选框 | 多选项 |
| `radio-group.tsx` | 单选按钮组 | 单选项 |
| `switch.tsx` | 开关 | 布尔值切换 |
| `slider.tsx` | 滑块 | 数值范围选择 |
| `calendar.tsx` | 日历 | 日期选择 |
| `input-otp.tsx` | OTP 输入 | 验证码输入 |
| `input-group.tsx` | 输入组 | 组合输入框 |
| `label.tsx` | 标签 | 表单标签 |
| `field.tsx` | 表单字段 | 字段容器 |
| `form.tsx` | 表单 | 表单容器 |

---

### 5. 按钮组件（button/）- 4 个组件

用于用户交互的按钮组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `button.tsx` | 按钮 | 基础按钮（多种变体） |
| `button-group.tsx` | 按钮组 | 按钮组合 |
| `toggle.tsx` | 切换按钮 | 状态切换 |
| `toggle-group.tsx` | 切换按钮组 | 多个切换按钮 |

**按钮变体**：
- default、destructive、outline、secondary、ghost、link

---

### 6. 弹出层组件（overlay/）- 9 个组件

用于显示浮层内容的组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `dialog.tsx` | 对话框 | 模态对话框 |
| `alert-dialog.tsx` | 警告对话框 | 确认/警告对话框 |
| `drawer.tsx` | 抽屉 | 从边缘滑入 |
| `popover.tsx` | 弹出框 | 浮动内容 |
| `tooltip.tsx` | 提示框 | 悬停提示 |
| `hover-card.tsx` | 悬停卡片 | 悬停显示详情 |
| `context-menu.tsx` | 右键菜单 | 上下文菜单 |
| `dropdown-menu.tsx` | 下拉菜单 | 下拉选项 |
| `command.tsx` | 命令面板 | 快捷命令（Cmd+K） |

---

### 7. 反馈组件（feedback/）- 7 个组件

用于向用户提供反馈的组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `alert.tsx` | 警告提示 | 静态提示信息 |
| `toast.tsx` | 吐司通知 | 临时通知 |
| `toaster.tsx` | 吐司容器 | Toast 容器 |
| `sonner.tsx` | Sonner 通知 | 高级通知系统 |
| `progress.tsx` | 进度条 | 进度显示 |
| `spinner.tsx` | 加载动画 | 加载状态 |
| `skeleton.tsx` | 骨架屏 | 内容占位 |

---

### 8. 展示组件（display/）- 10 个组件

用于展示内容和数据的组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `card.tsx` | 卡片 | 内容容器 |
| `table.tsx` | 表格 | 数据表格 |
| `avatar.tsx` | 头像 | 用户头像 |
| `badge.tsx` | 徽章 | 标签/徽章 |
| `chart.tsx` | 图表 | 数据可视化 |
| `carousel.tsx` | 轮播图 | 内容轮播 |
| `aspect-ratio.tsx` | 宽高比 | 保持宽高比 |
| `empty.tsx` | 空状态 | 无数据提示 |
| `item.tsx` | 列表项 | 通用列表项 |
| `kbd.tsx` | 键盘按键 | 快捷键显示 |

---

### 9. 工具组件（utility/）- 2 个组件

提供特定功能的工具组件。

| 组件 | 说明 | 用途 |
|------|------|------|
| `accordion.tsx` | 手风琴 | 折叠面板 |
| `collapsible.tsx` | 可折叠 | 展开/收起内容 |

---

### 10. React Hooks（hooks/）- 2 个

自定义 React Hooks。

| Hook | 说明 | 用途 |
|------|------|------|
| `use-mobile.tsx` | 移动端检测 | 检测是否为移动设备 |
| `use-toast.ts` | Toast Hook | Toast 通知管理 |

---

## 🎯 使用建议

### 1. 按需引入
```tsx
// 从分类文件夹引入
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/form/input'
import { Card } from '@/components/ui/display/card'
```

### 2. 组合使用
```tsx
// 表单组合
<form>
  <Input />
  <Textarea />
  <Select />
  <Button>提交</Button>
</form>

// 布局组合
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuItem />
    </SidebarMenu>
  </SidebarContent>
  <SidebarFooter />
</Sidebar>
```

### 3. 主题定制
所有组件使用 CSS 变量，可通过修改 `globals.css` 中的变量来定制主题：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... 更多变量 */
}
```

---

## 📚 参考资源

- **Shadcn/UI 官网**：https://ui.shadcn.com/
- **Tailwind CSS**：https://tailwindcss.com/
- **Radix UI**：https://www.radix-ui.com/
- **Lucide Icons**：https://lucide.dev/

---

## 📝 更新日志

- **2026-04-15**：初始分类整理，创建 10 个分类文件夹，整理 63 个组件
