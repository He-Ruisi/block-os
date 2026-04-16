"use client"

import { useState } from "react"
import {
  Sparkles,
  Wand2,
  Languages,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  PenLine,
  Copy,
  X,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AIToolbarProps {
  isVisible: boolean
  position: { x: number; y: number }
  onClose: () => void
}

const aiActions = [
  {
    icon: Wand2,
    label: "优化文本",
    description: "让文字更清晰流畅",
    color: "text-emerald",
    bgColor: "bg-emerald/10",
  },
  {
    icon: PenLine,
    label: "续写",
    description: "AI自动续写内容",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
  {
    icon: Languages,
    label: "翻译",
    description: "翻译成其他语言",
    color: "text-coral",
    bgColor: "bg-coral/10",
  },
  {
    icon: CheckCircle,
    label: "修正语法",
    description: "检查并修正错误",
    color: "text-emerald",
    bgColor: "bg-emerald/10",
  },
  {
    icon: Lightbulb,
    label: "简化",
    description: "让内容更简洁",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
  {
    icon: MessageSquare,
    label: "解释",
    description: "详细解释选中内容",
    color: "text-coral",
    bgColor: "bg-coral/10",
  },
]

const quickActions = [
  { icon: Copy, label: "复制" },
  { icon: ArrowRight, label: "移动" },
]

export function AIToolbar({ isVisible, position, onClose }: AIToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) return null

  return (
    <div
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden min-w-[280px] max-w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald/5 to-forest/5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald/10">
              <Sparkles className="w-4 h-4 text-emerald" />
            </div>
            <span className="text-sm font-medium text-foreground">AI 助手</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 p-2 border-b border-border">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isExpanded
                ? "bg-emerald/10 text-emerald"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 功能
            <ChevronDown
              className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")}
            />
          </button>
        </div>

        {/* AI Actions Grid */}
        <div
          className={cn(
            "grid grid-cols-2 gap-1.5 p-2 transition-all duration-200",
            isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 overflow-hidden p-0"
          )}
        >
          {aiActions.map((action) => (
            <button
              key={action.label}
              className="group flex flex-col items-start gap-1 p-3 rounded-lg hover:bg-accent text-left transition-colors"
            >
              <div
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  action.bgColor,
                  "group-hover:scale-110 transition-transform"
                )}
              >
                <action.icon className={cn("w-4 h-4", action.color)} />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{action.description}</span>
            </button>
          ))}
        </div>

        {/* Custom Prompt Input */}
        <div className="p-2 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 focus-within:ring-2 focus-within:ring-emerald/50 transition-all">
            <Sparkles className="w-4 h-4 text-emerald flex-shrink-0" />
            <input
              type="text"
              placeholder="输入自定义指令..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="p-1 rounded-md bg-emerald text-white hover:bg-emerald/90 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
