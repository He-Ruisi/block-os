"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  FileText,
  Star,
  Clock,
  Folder,
  MoreHorizontal,
  Hash,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const recentDocuments = [
  { id: 1, title: "Project Roadmap", icon: FileText, isFavorite: true },
  { id: 2, title: "Meeting Notes", icon: FileText, isFavorite: false },
  { id: 3, title: "Design System", icon: Folder, isFavorite: true },
  { id: 4, title: "API Documentation", icon: FileText, isFavorite: false },
  { id: 5, title: "Sprint Planning", icon: FileText, isFavorite: false },
]

const workspaces = [
  { id: 1, title: "Personal", icon: Hash },
  { id: 2, title: "Work", icon: Hash },
  { id: 3, title: "Archive", icon: Folder },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent")

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-0" : "w-60"
      )}
      style={{ backgroundColor: "#202020" }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-3 z-50 flex h-6 w-6 items-center justify-center rounded-sm bg-neutral-700 text-neutral-400 transition-all hover:bg-neutral-600 hover:text-neutral-200",
          isCollapsed ? "left-3" : "-right-3"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar Content */}
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden transition-opacity duration-200",
          isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
              W
            </div>
            <span className="text-sm font-medium text-neutral-200">
              Workspace
            </span>
          </div>
          <button className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pb-2">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-700/50 hover:text-neutral-200">
            <Search className="h-4 w-4" />
            <span>Search</span>
            <kbd className="ml-auto rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-neutral-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* New Document Button */}
        <div className="px-2 pb-2">
          <button className="flex w-full items-center gap-2 rounded-md bg-neutral-700/50 px-2 py-1.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-600/50">
            <Plus className="h-4 w-4" />
            <span>New Page</span>
          </button>
        </div>

        {/* AI Immerse Mode Entry */}
        <div className="px-2 pb-2">
          <Link
            href="/ai"
            className="flex w-full items-center gap-2 rounded-md bg-gradient-to-r from-violet-600/80 to-blue-600/80 px-2 py-1.5 text-sm font-medium text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-lg hover:shadow-violet-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Immerse</span>
            <kbd className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-xs">
              ⌘I
            </kbd>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700 px-2">
          <button
            onClick={() => setActiveTab("recent")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === "recent"
                ? "border-neutral-400 text-neutral-200"
                : "border-transparent text-neutral-500 hover:text-neutral-400"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            Recent
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === "favorites"
                ? "border-neutral-400 text-neutral-200"
                : "border-transparent text-neutral-500 hover:text-neutral-400"
            )}
          >
            <Star className="h-3.5 w-3.5" />
            Favorites
          </button>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            {recentDocuments
              .filter((doc) =>
                activeTab === "favorites" ? doc.isFavorite : true
              )
              .map((doc) => (
                <button
                  key={doc.id}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-700/50"
                >
                  <doc.icon className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span className="truncate">{doc.title}</span>
                  {doc.isFavorite && (
                    <Star className="ml-auto h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              ))}
          </div>

          {/* Workspaces Section */}
          <div className="mt-4">
            <div className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Workspaces
            </div>
            <div className="space-y-0.5">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-700/50"
                >
                  <workspace.icon className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span className="truncate">{workspace.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-700 px-2 py-2">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-700/50 hover:text-neutral-200">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
