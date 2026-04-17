# Shell 组件 API 文档

本文档定义所有 Shell 组件的 TypeScript 接口和使用规范。

## 核心原则

### 回调统一传值（不传 Event）
所有 Shell 组件的回调函数必须传递处理后的值，而不是原生 Event 对象。

**✅ 正确示例**：
```typescript
onChange: (value: string) => void
onSelect: (id: string) => void
onToggle: (checked: boolean) => void
```

**❌ 错误示例**：
```typescript
onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
onClick: (event: React.MouseEvent) => void
```

**原因**：
1. View 层不应处理 Event 对象
2. 简化 Container 层的事件处理逻辑
3. 提高组件的可测试性

---

## PanelShell

面板容器壳组件，用于右侧面板的统一容器。

### TypeScript 接口

```typescript
interface PanelShellProps {
  children: React.ReactNode;
  className?: string;
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| children | React.ReactNode | ✅ | - | 面板内容 |
| className | string | ❌ | - | 自定义类名 |

### 使用示例

```tsx
<PanelShell>
  <PanelHeader title="标题" />
  <div className="p-4">内容</div>
</PanelShell>
```

---

## PanelHeader

面板头部壳组件，包含标题、关闭按钮和可选的操作按钮。

### TypeScript 接口

```typescript
interface PanelHeaderProps {
  title: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | ✅ | - | 面板标题 |
| onClose | () => void | ❌ | - | 关闭回调（不传 Event） |
| actions | React.ReactNode | ❌ | - | 操作按钮 |
| className | string | ❌ | - | 自定义类名 |

### 使用示例

```tsx
<PanelHeader
  title="Block 空间"
  onClose={() => setShowPanel(false)}
  actions={
    <Button variant="ghost" size="icon">
      <Settings size={16} />
    </Button>
  }
/>
```

---

## SearchInput

搜索输入框壳组件，带搜索图标和清除按钮。

### TypeScript 接口

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;  // 注意：传 string，不传 Event
  placeholder?: string;
  className?: string;
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| value | string | ✅ | - | 输入值 |
| onChange | (value: string) => void | ✅ | - | 值变化回调（传 string，不传 Event） |
| placeholder | string | ❌ | - | 占位符文本 |
| className | string | ❌ | - | 自定义类名 |

### 使用示例

```tsx
// ✅ 正确：Container 直接接收 string
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}  // (value: string) => void
  placeholder="搜索 Block..."
/>

// ❌ 错误：不要这样写
<SearchInput
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}  // 不要传 Event
/>
```

### 内部实现参考

```tsx
export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}  // 内部处理 Event，对外传 string
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
```

---

## BlockCardShell

Block 卡片壳组件，用于展示 Block 的卡片容器。

### TypeScript 接口

```typescript
interface BlockCardShellProps {
  title?: string;
  tags?: string[];
  children: React.ReactNode;
  onClick?: () => void;
  onDragStart?: () => void;
  isActive?: boolean;
  draggable?: boolean;
  className?: string;
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | ❌ | - | 卡片标题 |
| tags | string[] | ❌ | - | 标签列表 |
| children | React.ReactNode | ✅ | - | 卡片内容 |
| onClick | () => void | ❌ | - | 点击回调（不传 Event） |
| onDragStart | () => void | ❌ | - | 拖拽开始回调（不传 Event） |
| isActive | boolean | ❌ | false | 是否激活状态 |
| draggable | boolean | ❌ | false | 是否可拖拽 |
| className | string | ❌ | - | 自定义类名 |

### 使用示例

```tsx
<BlockCardShell
  title="Block 标题"
  tags={['标签1', '标签2']}
  onClick={() => handleBlockClick(block.id)}
  onDragStart={() => handleDragStart(block.id)}
  isActive={selectedBlockId === block.id}
  draggable
>
  <p className="text-sm text-muted-foreground">Block 内容预览...</p>
</BlockCardShell>
```

---

## EmptyState

空状态壳组件，用于展示空状态的占位组件。

### TypeScript 接口

```typescript
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;  // 不传 Event
  };
  className?: string;
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| icon | LucideIcon | ❌ | - | 图标组件（来自 lucide-react） |
| title | string | ✅ | - | 标题 |
| description | string | ❌ | - | 描述文本 |
| action | { label: string; onClick: () => void } | ❌ | - | 操作按钮（onClick 不传 Event） |
| className | string | ❌ | - | 自定义类名 |

### 使用示例

```tsx
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="还没有 Block"
  description="创建你的第一个 Block 开始使用"
  action={{
    label: '创建 Block',
    onClick: () => handleCreateBlock(),  // 不传 Event
  }}
/>
```

---

## 创建新 Shell 组件的规范

### 1. 回调函数命名规范

| 事件类型 | 回调名称 | 参数类型 | 示例 |
|---------|---------|---------|------|
| 点击 | onClick | () => void | onClick={() => handleClick()} |
| 值变化 | onChange | (value: T) => void | onChange={(value) => setValue(value)} |
| 选择 | onSelect | (id: string) => void | onSelect={(id) => handleSelect(id)} |
| 切换 | onToggle | (checked: boolean) => void | onToggle={(checked) => setChecked(checked)} |
| 拖拽开始 | onDragStart | () => void | onDragStart={() => handleDrag()} |
| 拖拽结束 | onDragEnd | () => void | onDragEnd={() => handleDrop()} |

### 2. Props 接口定义模板

```typescript
interface MyShellComponentProps {
  // 必填 props（数据）
  value: string;
  
  // 必填 props（回调）
  onChange: (value: string) => void;  // 传值，不传 Event
  
  // 可选 props（数据）
  placeholder?: string;
  disabled?: boolean;
  
  // 可选 props（回调）
  onFocus?: () => void;
  onBlur?: () => void;
  
  // 可选 props（样式）
  className?: string;
  
  // 可选 props（子元素）
  children?: React.ReactNode;
}
```

### 3. 内部 Event 处理模板

```typescript
export function MyShellComponent({ value, onChange, ...props }: MyShellComponentProps) {
  // ✅ 正确：内部处理 Event，对外传值
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);  // 提取值后传递
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();  // 不传 Event
  };
  
  return (
    <Input
      value={value}
      onChange={handleChange}  // 内部处理
      onClick={handleClick}    // 内部处理
      {...props}
    />
  );
}
```

---

## 类型导出

所有 Shell 组件的 Props 接口必须导出，供 Container 和 View 使用。

```typescript
// src/components/shells/SearchInput.tsx
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput(props: SearchInputProps) {
  // ...
}
```

```typescript
// 使用时可以引用类型
import { SearchInput, type SearchInputProps } from '@/components/shells';

// 在 View 的 Props 中复用
interface MyViewProps {
  searchProps: SearchInputProps;
}
```

---

## 测试规范

### 单元测试示例

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('should call onChange with string value, not Event', () => {
    const handleChange = jest.fn();
    render(
      <SearchInput
        value=""
        onChange={handleChange}
        placeholder="搜索..."
      />
    );
    
    const input = screen.getByPlaceholderText('搜索...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // ✅ 验证传递的是 string，不是 Event
    expect(handleChange).toHaveBeenCalledWith('test');
    expect(handleChange).not.toHaveBeenCalledWith(expect.objectContaining({ target: expect.anything() }));
  });
});
```

---

## 常见问题

### Q: 为什么回调不传 Event？

**A**: 
1. **关注点分离**：View 层只负责渲染，不应处理 Event 细节
2. **简化 Container**：Container 直接接收值，无需 `e.target.value`
3. **提高可测试性**：测试时只需验证值，不需要 mock Event 对象
4. **类型安全**：避免 Event 类型不匹配的问题

### Q: 如果需要 Event 的其他信息怎么办？

**A**: 提取需要的信息后传递：

```typescript
// ❌ 不要传整个 Event
onKeyDown: (e: React.KeyboardEvent) => void

// ✅ 提取需要的信息
onKeyDown: (key: string, ctrlKey: boolean) => void

// 内部实现
const handleKeyDown = (e: React.KeyboardEvent) => {
  onKeyDown?.(e.key, e.ctrlKey);
};
```

### Q: 如何处理复杂的交互？

**A**: 将复杂逻辑封装在 Shell 内部，对外提供简单接口：

```typescript
// ✅ 正确：内部处理复杂逻辑
interface FileUploadShellProps {
  onFileSelect: (file: File) => void;  // 简单接口
  accept?: string;
}

export function FileUploadShell({ onFileSelect, accept }: FileUploadShellProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);  // 提取 File 对象后传递
    }
  };
  
  return <input type="file" accept={accept} onChange={handleChange} />;
}
```

---

## 参考资源

- [Shadcn UI 文档](https://ui.shadcn.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Container/View 模式 Skill](.kiro/skills/container-view-pattern.md)
