# Editor BubbleMenu 组件重构指南

## 概述

为了减小 `Editor.tsx` 文件的大小并提高代码可维护性，我们将 BubbleMenu 组件及其相关逻辑分离到了独立的文件中。

## 已完成的工作

✅ 创建了 `src/components/editor/EditorBubbleMenu.tsx` 组件文件
- 包含完整的 BubbleMenu UI 和所有 AI 操作逻辑
- 包含所有 AI 处理函数（续写、改写、缩写、扩写、翻译、解释、捕获）
- 使用 Tailwind CSS 样式（两行布局）

## 待完成的工作

需要在 `src/components/editor/Editor.tsx` 中进行以下修改：

### 1. 更新导入语句

**移除**：
```typescript
import { useEditor, EditorContent, BubbleMenu, Editor as TiptapEditor } from '@tiptap/react'
import {
  BlockLink, BlockReference, SourceBlock, searchBlocks,
  createInlineAIPlugin,
  startInlineAIReplace, updateInlineAIContent,
  confirmInlineAIReplace, discardInlineAIReplace,
  cancelActiveInlineAI, hasActiveInlineAI,
} from '../../editor/extensions'
import { sendInlineAIRequest } from '../../services/aiService'
import { captureSelectionAsBlock } from '../../services/blockCaptureService'
import { generateUUID } from '../../utils/uuid'
import { cn } from '../../lib/utils'
```

**替换为**：
```typescript
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import {
  BlockLink, BlockReference, SourceBlock, searchBlocks,
  createInlineAIPlugin,
  confirmInlineAIReplace, discardInlineAIReplace,
} from '../../editor/extensions'
import { EditorBubbleMenu } from './EditorBubbleMenu'
```

### 2. 移除 AI 处理函数

删除以下函数（约 200 行代码）：
- `getSelectionContext`
- `handleOpenAIChat`
- `handleContinue`
- `handleReplace`
- `handleExplain`
- `handleTranslate`
- `handleCapture`

这些函数已经移到 `EditorBubbleMenu.tsx` 中。

### 3. 替换 BubbleMenu JSX

**查找**（约第 733-989 行）：
```tsx
      {/* BubbleMenu — 两行工具栏：格式 + AI 操作 */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top-start' }}
          shouldShow={({ editor: ed, state }) => {
            const { from, to } = state.selection
            return from !== to && !hasActiveInlineAI(state) && !ed.isActive('sourceBlock', { pending: true })
          }}
        >
          <div className="flex flex-col gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-md">
            {/* ... 大量 JSX 代码 ... */}
          </div>
        </BubbleMenu>
      )}
```

**替换为**：
```tsx
      {/* BubbleMenu — 两行工具栏：格式 + AI 操作 */}
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          apiKey={MIMO_API_KEY}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
          setAnnotationPreview={setAnnotationPreview}
        />
      )}
```

## 预期效果

完成重构后：
- `Editor.tsx` 文件将减少约 450 行代码
- BubbleMenu 相关逻辑完全独立，易于维护和测试
- 保持所有现有功能不变
- TypeScript 类型检查通过

## 验证步骤

1. 运行类型检查：`bun run type-check`
2. 启动开发服务器：`bun run dev`
3. 测试 BubbleMenu 功能：
   - 选中文字，确认工具栏出现
   - 测试所有格式化按钮（粗体、斜体、标题等）
   - 测试所有 AI 操作（续写、改写、翻译等）
   - 确认激活状态正确显示（紫色高亮）

## 注意事项

- 不要删除 `aiLoading` 和 `annotationPreview` 状态，它们仍在 Editor.tsx 中使用
- 不要删除 `MIMO_API_KEY` 常量，它需要传递给 EditorBubbleMenu
- 确保 `EditorBubbleMenu.tsx` 文件已正确创建并包含所有必要的导入

## 相关文件

- `src/components/editor/EditorBubbleMenu.tsx` - 新创建的 BubbleMenu 组件
- `src/components/editor/Editor.tsx` - 需要修改的主编辑器文件
- `docs/logs/2026-04/2026-04-16.md` - 工作日志

---

**创建时间**：2026-04-16
**状态**：待完成
**优先级**：P2（代码优化，不影响功能）
