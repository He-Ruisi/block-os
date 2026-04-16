"use client"

import { Menu, Image, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileHeaderProps {
  activeTab: "sidebar" | "image" | "editor"
  onTabChange: (tab: "sidebar" | "image" | "editor") => void
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
      <h1 className="text-lg font-semibold text-[#00362F]">OCR 工具</h1>
      <div className="flex items-center gap-1">
        <Button
          variant={activeTab === "sidebar" ? "default" : "ghost"}
          size="icon"
          className={`h-9 w-9 ${activeTab === "sidebar" ? "bg-[#00362F] text-white hover:bg-[#00362F]/90" : "text-muted-foreground"}`}
          onClick={() => onTabChange("sidebar")}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTab === "image" ? "default" : "ghost"}
          size="icon"
          className={`h-9 w-9 ${activeTab === "image" ? "bg-[#00362F] text-white hover:bg-[#00362F]/90" : "text-muted-foreground"}`}
          onClick={() => onTabChange("image")}
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTab === "editor" ? "default" : "ghost"}
          size="icon"
          className={`h-9 w-9 ${activeTab === "editor" ? "bg-[#00362F] text-white hover:bg-[#00362F]/90" : "text-muted-foreground"}`}
          onClick={() => onTabChange("editor")}
        >
          <FileText className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
