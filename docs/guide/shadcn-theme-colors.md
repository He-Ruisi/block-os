# Shadcn UI 主题颜色使用指南

## 文件位置

`src/styles/shadcn-theme.css` - Shadcn UI 主题颜色配置文件

## BlockOS 自定义强调色

### 1. 主绿色 - #35AB67
用于成功状态、积极操作、主要强调

```tsx
// Tailwind 类名（推荐）
<Button className="bg-accent-green text-white">保存</Button>
<div className="text-accent-green">成功提示</div>
<div className="border-accent-green">边框</div>

// HSL 格式（用于自定义场景）
<div className="bg-[hsl(var(--accent-green))]">背景</div>

// RGB 格式（用于透明度）
<div className="bg-[rgb(var(--accent-green-rgb)_/_0.1)]">半透明背景</div>
```

### 2. 深绿色 - #00362F
用于深色强调、次要绿色元素

```tsx
// Tailwind 类名（推荐）
<div className="bg-accent-green-dark text-white">深色背景</div>
<div className="text-accent-green-dark">深色文字</div>
<div className="border-accent-green-dark">深色边框</div>

// HSL 格式
<div className="bg-[hsl(var(--accent-green-dark))]">背景</div>

// RGB 格式（用于透明度）
<div className="shadow-[0_0_10px_rgb(var(--accent-green-dark-rgb)_/_0.3)]">阴影</div>
```

### 3. 强调红色 - #D9323D
用于错误状态、警告、删除操作

```tsx
// Tailwind 类名（推荐）
<Button className="bg-accent-red text-white">删除</Button>
<div className="text-accent-red">错误提示</div>
<div className="border-accent-red">警告边框</div>

// HSL 格式
<div className="bg-[hsl(var(--accent-red))]">背景</div>

// RGB 格式（用于透明度）
<div className="bg-[rgb(var(--accent-red-rgb)_/_0.1)]">半透明背景</div>
```

## 使用场景示例

### Block 卡片状态
```tsx
// 正常状态
<Card className="border-border">
  <CardContent>Block 内容</CardContent>
</Card>

// 高亮状态（主绿色）
<Card className="border-accent-green bg-accent-green/5">
  <CardContent>高亮 Block</CardContent>
</Card>

// 选中状态（深绿色）
<Card className="border-accent-green-dark bg-accent-green-dark/10">
  <CardContent>选中 Block</CardContent>
</Card>

// 错误状态（红色）
<Card className="border-accent-red bg-accent-red/5">
  <CardContent>错误 Block</CardContent>
</Card>
```

### 按钮状态
```tsx
// 主要操作（绿色）
<Button className="bg-accent-green hover:bg-accent-green/90">
  保存
</Button>

// 危险操作（红色）
<Button className="bg-accent-red hover:bg-accent-red/90">
  删除
</Button>

// 次要操作（深绿色）
<Button variant="outline" className="border-accent-green-dark text-accent-green-dark">
  取消
</Button>
```

### 标签/徽章
```tsx
// 成功标签
<Badge className="bg-accent-green text-white">
  已发布
</Badge>

// 警告标签
<Badge className="bg-accent-red text-white">
  已过期
</Badge>

// 信息标签
<Badge className="bg-accent-green-dark text-white">
  草稿
</Badge>
```

### 进度指示器
```tsx
// 进度条
<div className="h-2 bg-secondary rounded-full overflow-hidden">
  <div 
    className="h-full bg-accent-green transition-all"
    style={{ width: '60%' }}
  />
</div>

// 加载动画
<div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-green border-t-transparent" />
```

## 在 CSS 中使用

```css
/* HSL 格式 */
.my-success-button {
  background-color: hsl(var(--accent-green));
  color: white;
}

.my-success-button:hover {
  background-color: hsl(var(--accent-green) / 0.9);
}

/* HEX 格式 */
.my-error-text {
  color: var(--accent-red-hex);
}

/* RGB 格式（用于透明度）*/
.my-highlight {
  background-color: rgb(var(--accent-green-rgb) / 0.1);
  border: 1px solid rgb(var(--accent-green-rgb));
}
```

## 颜色变量对照表

| 颜色名称 | HEX | HSL | RGB | Tailwind 类 |
|---------|-----|-----|-----|------------|
| 主绿色 | #35AB67 | 145 52% 44% | 53 171 103 | `accent-green` |
| 深绿色 | #00362F | 170 100% 11% | 0 54 47 | `accent-green-dark` |
| 强调红色 | #D9323D | 356 63% 52% | 217 50 61 | `accent-red` |

## 暗色模式

暗色模式下，这三个强调色保持不变，确保在深色背景下也有良好的对比度和可读性。

```tsx
// 自动适配暗色模式
<div className="dark:bg-accent-green-dark dark:text-white">
  暗色模式下的深绿色背景
</div>
```

## 最佳实践

1. **优先使用 Tailwind 类名**：`bg-accent-green` 比 `bg-[hsl(var(--accent-green))]` 更简洁
2. **需要透明度时使用 RGB**：`bg-[rgb(var(--accent-green-rgb)_/_0.1)]`
3. **保持语义化**：
   - 绿色 → 成功、确认、积极
   - 深绿色 → 次要绿色元素、深色强调
   - 红色 → 错误、警告、删除
4. **注意对比度**：确保文字在背景上清晰可读
5. **一致性**：在整个应用中保持颜色使用的一致性

## 相关文件

- `src/styles/shadcn-theme.css` - 主题颜色定义
- `tailwind.config.js` - Tailwind 配置
- `src/styles/global/design-tokens.css` - 设计令牌（CSS 变量）
- `.kiro/steering/shadcn-ui-refactor.md` - Shadcn UI 重构规范
