"use client"

import { useState, useRef, useEffect } from "react"
import {
  MoreHorizontal,
  MessageSquare,
  Share2,
  Star,
  Clock,
  Hash,
  ChevronRight,
} from "lucide-react"
import { AIToolbar } from "./ai-toolbar"
import { cn } from "@/lib/utils"

const sampleContent = `# 欢迎使用 MarkNote

这是一个类似 **Notion** 和 **Roam Research** 的现代化 Markdown 编辑器。

## 主要功能

- 📝 支持完整的 Markdown 语法
- 🎨 优雅的界面设计
- 🤖 内置 AI 写作助手
- 📱 完美适配多端设备

## 快速开始

> 选中任意文字，即可唤起 AI 工具栏，体验智能写作功能。

### 任务列表

- [x] 创建项目结构
- [x] 设计界面布局
- [ ] 实现核心功能
- [ ] 添加主题支持

### 代码示例

\`\`\`javascript
const greeting = "Hello, MarkNote!";
console.log(greeting);
\`\`\`

---

*开始你的创作之旅吧！*`

export function EditorArea() {
  const [aiToolbar, setAiToolbar] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
  })
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setAiToolbar({
          isVisible: true,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10,
          },
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      const selection = window.getSelection()
      if (!selection || selection.toString().trim().length === 0) {
        if (!(e.target as HTMLElement).closest(".ai-toolbar")) {
          setAiToolbar((prev) => ({ ...prev, isVisible: false }))
        }
      }
    }

    document.addEventListener("mouseup", handleSelection)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("mouseup", handleSelection)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-8 lg:px-16 py-4 border-b border-border bg-card/50">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
          <span className="hover:text-foreground cursor-pointer transition-colors">工作空间</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="hover:text-foreground cursor-pointer transition-colors">项目</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-foreground font-medium whitespace-nowrap">欢迎使用</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">2 分钟前编辑</span>
            <span className="sm:hidden">2分钟前</span>
          </div>
          <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          {/* Page Icon & Title */}
          <div className="mb-6">
            <button className="text-4xl sm:text-5xl mb-3 hover:scale-110 transition-transform">
              📝
            </button>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground outline-none leading-tight"
              contentEditable
              suppressContentEditableWarning
            >
              欢迎使用 MarkNote
            </h1>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs px-2 py-1 rounded-full bg-emerald/10 text-emerald">教程</span>
            <span className="text-xs px-2 py-1 rounded-full bg-forest/20 text-forest">入门</span>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              + 添加标签
            </button>
          </div>

          {/* Content */}
          <div
            ref={editorRef}
            className={cn(
              "prose prose-neutral dark:prose-invert max-w-none",
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground prose-p:leading-relaxed",
              "prose-a:text-emerald prose-a:no-underline hover:prose-a:underline",
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-code:text-coral prose-code:bg-coral/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
              "prose-pre:bg-forest/5 prose-pre:border prose-pre:border-border prose-pre:rounded-lg",
              "prose-blockquote:border-l-emerald prose-blockquote:bg-emerald/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic",
              "prose-li:text-foreground",
              "prose-hr:border-border",
              "selection:bg-emerald/20 selection:text-foreground"
            )}
          >
            {/* Rendered content preview */}
            <p className="text-muted-foreground mb-4">
              这是一个类似 <strong>Notion</strong> 和 <strong>Roam Research</strong> 的现代化 Markdown 编辑器。
            </p>

            <h2>主要功能</h2>
            <ul>
              <li>📝 支持完整的 Markdown 语法</li>
              <li>🎨 优雅的界面设计</li>
              <li>🤖 内置 AI 写作助手</li>
              <li>📱 完美适配多端设备</li>
            </ul>

            <h2>快速开始</h2>
            <blockquote>
              <p>选中任意文字，即可唤起 AI 工具栏，体验智能写作功能。</p>
            </blockquote>

            <h3>任务列表</h3>
            <ul className="list-none pl-0 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded border-2 border-emerald bg-emerald/20 flex items-center justify-center text-emerald text-xs">✓</span>
                <span className="line-through text-muted-foreground">创建项目结构</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded border-2 border-emerald bg-emerald/20 flex items-center justify-center text-emerald text-xs">✓</span>
                <span className="line-through text-muted-foreground">设计界面布局</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md border-2 border-border bg-background" />
                <span>实现核心功能</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md border-2 border-border bg-background" />
                <span>添加主题支持</span>
              </li>
            </ul>

            <h3>代码示例</h3>
            <pre className="text-sm">
              <code>{`const greeting = "Hello, MarkNote!";
console.log(greeting);`}</code>
            </pre>

            <hr />

            <p className="italic text-muted-foreground">开始你的创作之旅吧！</p>
          </div>

          {/* Backlinks */}
          <div className="mt-12 pt-8 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              关联笔记
            </h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground transition-colors">
                📚 Markdown 语法速查表
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground transition-colors">
                🎯 项目计划
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Toolbar */}
      <AIToolbar
        isVisible={aiToolbar.isVisible}
        position={aiToolbar.position}
        onClose={() => setAiToolbar((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
