"use client"

import { Plus, Settings, Search, Download, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileItem {
  id: string
  name: string
  date: string
  isActive?: boolean
}

const recentFiles: FileItem[] = [
  { id: "1", name: "ink-1.png", date: "04-15 15:27", isActive: true },
  { id: "2", name: "176794287562026522….jpg", date: "01-09 15:14" },
  { id: "3", name: "小票测试.jpg", date: "2025-12-31" },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-background">
      {/* 新解析按钮 */}
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          新解析
        </Button>
      </div>

      {/* 系统设置 */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          系统设置
        </Button>
      </div>

      {/* 分隔线 */}
      <div className="mx-3 border-t border-border" />

      {/* 最近上传 / 我的收藏 */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">最近上传</span>
          <span className="text-sm text-muted-foreground">我的收藏</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto px-2">
        {recentFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted",
              file.isActive && "bg-muted"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#35AB67]/10">
              <FileImage className="h-4 w-4 text-[#35AB67]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.date}</p>
            </div>
          </div>
        ))}

        {/* 没有更多了 */}
        <div className="py-6 text-center text-sm text-muted-foreground">
          没有更多啦
        </div>
      </div>
    </aside>
  )
}
