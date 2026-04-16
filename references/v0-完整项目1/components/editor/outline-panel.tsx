"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  List,
  Calendar,
  Users,
  Info,
  X,
  PanelRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OutlinePanelProps {
  isOpen: boolean
  onToggle: () => void
}

const outline = [
  { id: 1, title: "主要功能", level: 2 },
  { id: 2, title: "快速开始", level: 2 },
  { id: 3, title: "任务列表", level: 3 },
  { id: 4, title: "代码示例", level: 3 },
]

const pageInfo = {
  created: "2024年3月15日",
  modified: "2024年3月20日",
  wordCount: 156,
  readTime: "约 1 分钟",
  author: "用户",
}

export function OutlinePanel({ isOpen, onToggle }: OutlinePanelProps) {
  const [activeSection, setActiveSection] = useState<string>("outline")

  const sections = [
    { id: "outline", icon: List, label: "大纲" },
    { id: "info", icon: Info, label: "信息" },
    { id: "calendar", icon: Calendar, label: "历史" },
    { id: "collaborators", icon: Users, label: "协作" },
  ]

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 right-4 z-30 p-2 rounded-lg bg-card border border-border shadow-sm transition-opacity xl:hidden",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <PanelRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 xl:hidden"
          onClick={onToggle}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed xl:static inset-y-0 right-0 z-50 w-72 bg-card border-l border-border flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0 xl:w-0 xl:opacity-0 xl:overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  activeSection === section.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={section.label}
              >
                <section.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground xl:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === "outline" && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">目录</h3>
              <nav className="space-y-1">
                {outline.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                      item.level === 2
                        ? "text-foreground font-medium"
                        : "text-muted-foreground pl-4"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      {item.title}
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">图谱预览</h3>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald/10 via-forest/10 to-coral/10 border border-border flex items-center justify-center">
                  <div className="relative">
                    {/* Central node */}
                    <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center text-white text-xs font-medium shadow-lg">
                      当前
                    </div>
                    {/* Connected nodes */}
                    <div className="absolute -top-8 -left-4 w-8 h-8 rounded-full bg-forest/80 flex items-center justify-center text-white text-xs shadow">
                      1
                    </div>
                    <div className="absolute -top-6 left-12 w-8 h-8 rounded-full bg-coral/80 flex items-center justify-center text-white text-xs shadow">
                      2
                    </div>
                    <div className="absolute top-8 -right-6 w-8 h-8 rounded-full bg-emerald/80 flex items-center justify-center text-white text-xs shadow">
                      3
                    </div>
                    <div className="absolute top-10 -left-8 w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white text-xs shadow">
                      4
                    </div>
                    {/* Connection lines (simplified) */}
                    <svg
                      className="absolute inset-0 w-full h-full -z-10"
                      style={{ left: "-40px", top: "-40px", width: "120px", height: "120px" }}
                    >
                      <line x1="60" y1="60" x2="36" y2="32" stroke="currentColor" strokeOpacity="0.2" />
                      <line x1="60" y1="60" x2="92" y2="34" stroke="currentColor" strokeOpacity="0.2" />
                      <line x1="60" y1="60" x2="96" y2="88" stroke="currentColor" strokeOpacity="0.2" />
                      <line x1="60" y1="60" x2="28" y2="90" stroke="currentColor" strokeOpacity="0.2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "info" && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">页面信息</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground">创建时间</dt>
                  <dd className="text-sm text-foreground">{pageInfo.created}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">最后修改</dt>
                  <dd className="text-sm text-foreground">{pageInfo.modified}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">字数统计</dt>
                  <dd className="text-sm text-foreground">{pageInfo.wordCount} 字</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">阅读时间</dt>
                  <dd className="text-sm text-foreground">{pageInfo.readTime}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">作者</dt>
                  <dd className="text-sm text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald flex items-center justify-center text-white text-xs">
                      U
                    </span>
                    {pageInfo.author}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">统计</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-emerald/10 border border-emerald/20">
                    <div className="text-2xl font-bold text-emerald">12</div>
                    <div className="text-xs text-muted-foreground">反向链接</div>
                  </div>
                  <div className="p-3 rounded-lg bg-forest/10 border border-forest/20">
                    <div className="text-2xl font-bold text-forest">5</div>
                    <div className="text-xs text-muted-foreground">外部链接</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "calendar" && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">编辑历史</h3>
              <div className="space-y-3">
                {[
                  { time: "今天 14:30", action: "修改了标题", user: "你" },
                  { time: "今天 10:15", action: "添加了任务列表", user: "你" },
                  { time: "昨天 18:00", action: "创建了页面", user: "你" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                      {item.user.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "collaborators" && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-4">协作者</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald/5 border border-emerald/20">
                  <span className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center text-white text-sm font-medium">
                    U
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">用户</p>
                    <p className="text-xs text-muted-foreground">所有者</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald" title="在线" />
                </div>
              </div>
              <button className="w-full mt-4 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                + 邀请协作者
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
