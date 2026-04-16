"use client"

import { FileText, FileJson, SlidersHorizontal, RotateCw, Copy, Download, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export function TextEditor() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">解析模型</span>
          <Button variant="outline" className="h-8 gap-2 text-sm">
            PaddleOCR-VL-1.5
            <Badge className="bg-[#D9323D] text-[10px] font-medium text-white hover:bg-[#D9323D]">
              NEW
            </Badge>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 标签页和操作按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="h-9 gap-2 text-sm font-medium text-[#35AB67] hover:bg-[#35AB67]/10 hover:text-[#35AB67]"
          >
            <FileText className="h-4 w-4" />
            文档解析
          </Button>
          <Button variant="ghost" className="h-9 gap-2 text-sm text-muted-foreground">
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* 第一段文本 */}
          <p className="text-sm leading-relaxed text-foreground">
            PS I:\Code\project_ink&gt; pio --version PlatformIO Core, version 6.1.19
          </p>

          <p className="text-sm leading-relaxed text-foreground">
            PS I:\Code\project_ink&gt; pio device monitor
          </p>

          {/* 可编辑文本框 */}
          <div className="space-y-2">
            <Badge className="bg-[#35AB67] text-xs font-medium text-white hover:bg-[#35AB67]">
              文本
            </Badge>
            <Textarea
              defaultValue="If you like PlatformIO, please:"
              className="min-h-[60px] resize-none border-[#35AB67]/30 bg-[#35AB67]/5 text-sm focus-visible:ring-[#35AB67]/50"
            />
          </div>

          {/* 列表项 */}
          <ul className="space-y-4 pl-4">
            <li className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">star it on GitHub</span> &gt;{" "}
              <a href="#" className="text-[#35AB67] hover:underline">
                https://github.com/platformio/platformio-core
              </a>
            </li>
            <li className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">follow us on LinkedIn</span> to stay up-to-date on the latest project news &gt;{" "}
              <a href="#" className="text-[#35AB67] hover:underline">
                https://www.linkedin.com/company/platformio/
              </a>
            </li>
            <li className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">try PlatformIO IDE</span> for embedded development &gt;{" "}
              <a href="#" className="text-[#35AB67] hover:underline">
                https://platformio.org/platformio-ide
              </a>
            </li>
          </ul>

          {/* 终端信息 */}
          <div className="space-y-2 pt-4">
            <p className="text-sm leading-relaxed text-foreground">
              --- Terminal on COM9 | 9600 8-N-1
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              --- Available filters and text transformations: debug, default, direct, hexplify, log2file, nocontrol, printable, send_on_enter, time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
