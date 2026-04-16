"use client"

import { useState } from "react"
import {
  FileText,
  Search,
  Settings,
  Plus,
  ChevronRight,
  Star,
  Clock,
  Trash2,
  FolderOpen,
  Hash,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const pages = [
  { id: 1, title: "欢迎使用", icon: FileText, starred: true },
  { id: 2, title: "项目计划", icon: FileText, starred: false },
  { id: 3, title: "读书笔记", icon: FileText, starred: true },
  { id: 4, title: "周报总结", icon: FileText, starred: false },
]

const folders = [
  { id: 1, title: "工作", count: 12 },
  { id: 2, title: "学习", count: 8 },
  { id: 3, title: "生活", count: 5 },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [expandedFolder, setExpandedFolder] = useState<number | null>(1)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">MarkNote</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-muted-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm">搜索笔记...</span>
            <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 pb-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
            <Plus className="w-4 h-4 text-emerald" />
            <span className="text-sm font-medium">新建页面</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {/* Starred */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Star className="w-3 h-3" />
              收藏
            </div>
            <ul className="mt-1 space-y-0.5">
              {pages
                .filter((p) => p.starred)
                .map((page) => (
                  <li key={page.id}>
                    <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors">
                      <FileText className="w-4 h-4 text-emerald" />
                      {page.title}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Recent */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              最近
            </div>
            <ul className="mt-1 space-y-0.5">
              {pages.slice(0, 3).map((page) => (
                <li key={page.id}>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {page.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Folders */}
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <FolderOpen className="w-3 h-3" />
              文件夹
            </div>
            <ul className="mt-1 space-y-0.5">
              {folders.map((folder) => (
                <li key={folder.id}>
                  <button
                    onClick={() => setExpandedFolder(expandedFolder === folder.id ? null : folder.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        expandedFolder === folder.id && "rotate-90"
                      )}
                    />
                    {folder.title}
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {folder.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Hash className="w-3 h-3" />
              标签
            </div>
            <div className="mt-2 px-2 flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald/10 text-emerald">工作</span>
              <span className="text-xs px-2 py-1 rounded-full bg-coral/10 text-coral">紧急</span>
              <span className="text-xs px-2 py-1 rounded-full bg-forest/20 text-forest">创意</span>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
              回收站
            </button>
            <button className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-30 p-2 rounded-lg bg-card border border-border shadow-sm lg:hidden",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
    </>
  )
}
