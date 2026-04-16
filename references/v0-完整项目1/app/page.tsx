"use client"

import { useState } from "react"
import { Sidebar } from "@/components/editor/sidebar"
import { Toolbar } from "@/components/editor/toolbar"
import { EditorArea } from "@/components/editor/editor-area"
import { OutlinePanel } from "@/components/editor/outline-panel"

export default function MarkdownEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [outlinePanelOpen, setOutlinePanelOpen] = useState(true)

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <Toolbar />

        {/* Editor + Outline */}
        <div className="flex-1 flex min-h-0">
          <EditorArea />
          <OutlinePanel
            isOpen={outlinePanelOpen}
            onToggle={() => setOutlinePanelOpen(!outlinePanelOpen)}
          />
        </div>
      </main>
    </div>
  )
}
