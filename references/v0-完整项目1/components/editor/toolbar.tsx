"use client"

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image,
  Table,
  Minus,
  MoreHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToolbarProps {
  className?: string
}

const toolbarGroups = [
  {
    label: "文本格式",
    tools: [
      { icon: Bold, label: "粗体", shortcut: "⌘B" },
      { icon: Italic, label: "斜体", shortcut: "⌘I" },
      { icon: Underline, label: "下划线", shortcut: "⌘U" },
      { icon: Strikethrough, label: "删除线", shortcut: "⌘⇧S" },
      { icon: Code, label: "行内代码", shortcut: "⌘E" },
    ],
  },
  {
    label: "标题",
    tools: [
      { icon: Heading1, label: "一级标题", shortcut: "⌘⌥1" },
      { icon: Heading2, label: "二级标题", shortcut: "⌘⌥2" },
      { icon: Heading3, label: "三级标题", shortcut: "⌘⌥3" },
    ],
  },
  {
    label: "列表",
    tools: [
      { icon: List, label: "无序列表", shortcut: "⌘⇧8" },
      { icon: ListOrdered, label: "有序列表", shortcut: "⌘⇧7" },
      { icon: CheckSquare, label: "任务列表", shortcut: "⌘⇧9" },
    ],
  },
  {
    label: "对齐",
    tools: [
      { icon: AlignLeft, label: "左对齐" },
      { icon: AlignCenter, label: "居中" },
      { icon: AlignRight, label: "右对齐" },
    ],
  },
  {
    label: "插入",
    tools: [
      { icon: Link, label: "链接", shortcut: "⌘K" },
      { icon: Image, label: "图片" },
      { icon: Quote, label: "引用", shortcut: "⌘⇧." },
      { icon: Table, label: "表格" },
      { icon: Minus, label: "分割线" },
    ],
  },
]

export function Toolbar({ className }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1 p-2 bg-card border-b border-border overflow-x-auto scrollbar-hide",
          className
        )}
      >
        {toolbarGroups.map((group, groupIndex) => (
          <div key={group.label} className="flex items-center">
            {groupIndex > 0 && <div className="w-px h-6 bg-border mx-1.5" />}
            <div className="flex items-center gap-0.5">
              {group.tools.map((tool) => (
                <Tooltip key={tool.label}>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                      aria-label={tool.label}
                    >
                      <tool.icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="flex items-center gap-2">
                    <span>{tool.label}</span>
                    {tool.shortcut && (
                      <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">{tool.shortcut}</kbd>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}

        <div className="ml-auto flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                aria-label="更多选项"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">更多选项</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
