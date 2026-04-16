"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ImagePreview } from "./image-preview"
import { TextEditor } from "./text-editor"
import { MobileHeader } from "./mobile-header"
import { cn } from "@/lib/utils"

export function OcrLayout() {
  const [activeTab, setActiveTab] = useState<"sidebar" | "image" | "editor">("editor")

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 移动端头部导航 */}
      <MobileHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 - 桌面端始终显示，平板隐藏，手机端通过标签切换 */}
        <div
          className={cn(
            "h-full w-64 shrink-0 border-r border-border",
            // 桌面端显示
            "hidden lg:block",
            // 手机端根据标签显示
            activeTab === "sidebar" && "block lg:block"
          )}
        >
          <Sidebar />
        </div>

        {/* 中间图片预览区 - 桌面端和平板端显示，手机端通过标签切换 */}
        <div
          className={cn(
            "h-full flex-1 border-r border-border",
            // 平板和桌面端显示
            "hidden md:block",
            // 手机端根据标签显示
            activeTab === "image" && "block md:block"
          )}
        >
          <ImagePreview />
        </div>

        {/* 右侧编辑区 - 始终可见，手机端默认显示 */}
        <div
          className={cn(
            "h-full w-full md:w-[420px] lg:w-[480px] shrink-0",
            // 手机端根据标签显示
            "hidden md:block",
            activeTab === "editor" && "block md:block"
          )}
        >
          <TextEditor />
        </div>
      </div>
    </div>
  )
}
