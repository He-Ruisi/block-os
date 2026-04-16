"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Editor } from "@/components/editor"

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Breadcrumb Navigation */}
        <BreadcrumbNav
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Editor Area */}
        <Editor />
      </div>
    </div>
  )
}
