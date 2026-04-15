"use client"

import { ChevronRight, Home, FileText, MoreHorizontal, Star, MessageSquare, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

interface BreadcrumbNavProps {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const breadcrumbItems = [
  { label: "Workspace", icon: Home },
  { label: "Projects", icon: null },
  { label: "Documentation", icon: FileText },
]

export function BreadcrumbNav({ isSidebarCollapsed, onToggleSidebar }: BreadcrumbNavProps) {
  return (
    <header className="flex h-11 items-center justify-between border-b border-neutral-200 bg-white px-3">
      {/* Left Side - Breadcrumb */}
      <div className="flex items-center gap-1">
        {/* Sidebar Toggle (visible when collapsed) */}
        {isSidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="mr-2 rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Breadcrumb Items */}
        <nav className="flex items-center">
          {breadcrumbItems.map((item, index) => (
            <div key={item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-1 h-4 w-4 text-neutral-400" />
              )}
              <button className="flex items-center gap-1.5 rounded px-1.5 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-1">
        {/* AI Immerse Mode Entry */}
        <Link
          href="/ai"
          className="mr-1 flex items-center gap-1.5 rounded-md bg-gradient-to-r from-violet-600 to-blue-600 px-2.5 py-1 text-sm font-medium text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-md hover:shadow-violet-500/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI</span>
        </Link>
        <button className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <Clock className="h-4 w-4" />
        </button>
        <button className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <Star className="h-4 w-4" />
        </button>
        <button className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button className="ml-2 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Share
        </button>
      </div>
    </header>
  )
}
