"use client"

import { FileImage, ZoomOut, ZoomIn, RotateCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ImagePreview() {
  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* 顶部标签栏 */}
      <div className="flex items-center border-b border-border bg-background px-4 py-2">
        <div className="inline-flex items-center rounded-md border border-[#D9323D] bg-[#D9323D]/5 px-3 py-1.5">
          <span className="text-sm font-medium text-[#D9323D]">源文件</span>
        </div>
      </div>

      {/* 文件信息 */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#35AB67]/10">
          <FileImage className="h-4 w-4 text-[#35AB67]" />
        </div>
        <span className="text-sm font-medium text-foreground">ink-1.png</span>
        <span className="text-sm text-muted-foreground">42.91KB</span>
      </div>

      {/* 图片展示区域 */}
      <div className="relative flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl">
          {/* 模拟终端界面图片 */}
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            {/* 终端标签栏 */}
            <div className="flex items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5 text-xs">
              <span className="text-muted-foreground">PROBLEMS</span>
              <span className="text-muted-foreground">OUTPUT</span>
              <span className="text-muted-foreground">DEBUG CONSOLE</span>
              <span className="border-b-2 border-[#35AB67] px-2 py-1 font-medium text-foreground">TERMINAL</span>
              <span className="text-muted-foreground">PORTS</span>
            </div>
            
            {/* 终端内容 */}
            <div className="bg-[#00362F] p-4 font-mono text-xs leading-relaxed text-green-100">
              <p className="text-blue-300">PS I:\Code\project_ink&gt; pio --version</p>
              <p>PlatformIO Core, version 6.1.19</p>
              <p className="mt-2 text-blue-300">PS I:\Code\project_ink&gt; pio device monitor</p>
              <p className="mt-2 text-yellow-300">
                **************************************************************************
              </p>
              <div className="mt-1">
                <span className="inline-block rounded bg-[#35AB67] px-2 py-0.5 text-white">文本</span>
                <span className="ml-2 bg-[#35AB67]/30 px-1">If you like PlatformIO, please:</span>
              </div>
              <p className="mt-1">- star it on GitHub &gt; https://github.com/platformio/platformio-core</p>
              <p>- follow us on LinkedIn to stay up-to-date on the latest project news &gt;</p>
              <p className="pl-2">https://www.linkedin.com/company/platformio/</p>
              <p>- try PlatformIO IDE for embedded development &gt; https://platformio.org/platformio-ide</p>
              <p className="mt-2 text-yellow-300">
                **************************************************************************
              </p>
              <p className="mt-2">--- Terminal on COM9 | 9600 8-N-1</p>
              <p>--- Available filters and text transformations: debug, default, direct, hexlify, log2file,</p>
              <p className="pl-4">nocontrol, printable, send_on_enter, time</p>
              <p>--- More details at https://bit.ly/pio-monitor-filters</p>
              <p>--- Quit: Ctrl+C | Menu: Ctrl+T | Help: Ctrl+T followed by Ctrl+H</p>
              <div className="mt-2 h-4 w-2 animate-pulse bg-green-400" />
            </div>

            {/* 底部工具栏 */}
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
              <span>Autocomplete</span>
              <span>Report Issue</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部分页控制 */}
      <div className="flex items-center justify-center gap-2 border-t border-border bg-background py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          defaultValue="1"
          className="h-8 w-12 text-center text-sm"
        />
        <span className="text-sm text-muted-foreground">/ 1</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="mx-2 h-4 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
