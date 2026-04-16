"use client"

import { useState } from "react"
import {
  MessageSquare,
  LayoutGrid,
  FileOutput,
  PanelRightClose,
  PanelRight,
  Search,
  Send,
  Bot,
  User,
  Clock,
  Link2,
  Tag,
  ChevronDown,
  Eye,
  FileCheck,
  FileText,
  FileCode,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for AI chat
const mockChatMessages = [
  {
    id: 1,
    role: "user" as const,
    content: "请帮我优化这段代码的性能",
  },
  {
    id: 2,
    role: "assistant" as const,
    content: "好的，我来分析一下您的代码。首先，我注意到有几个可以优化的地方：\n\n1. 减少不必要的循环\n2. 使用更高效的数据结构\n3. 避免重复计算",
  },
  {
    id: 3,
    role: "user" as const,
    content: "具体应该怎么修改？",
  },
  {
    id: 4,
    role: "assistant" as const,
    content: "针对您的代码，我建议进行以下修改：使用 Map 替代 Object 进行频繁的查找操作，这可以将时间复杂度从 O(n) 降低到 O(1)。",
  },
]

// Mock data for Block Space
const mockBlocks = [
  {
    id: 1,
    title: "项目架构设计",
    content: "本项目采用微服务架构，主要分为用户服务、订单服务、支付服务和通知服务四个核心模块。每个服务独立部署，通过 API 网关进行统一管理和路由。数据库采用 PostgreSQL 作为主数据库，Redis 作为缓存层。",
    tags: ["架构", "设计文档"],
    versions: [
      { version: "v1.2", date: "2024-01-15", summary: "添加了支付服务的详细设计" },
      { version: "v1.1", date: "2024-01-10", summary: "更新了用户服务的接口定义" },
      { version: "v1.0", date: "2024-01-05", summary: "初始版本，包含基础架构设计" },
    ],
    references: ["API 设计规范", "数据库设计文档"],
  },
  {
    id: 2,
    title: "用户认证流程",
    content: "用户认证采用 JWT + Refresh Token 的双 Token 机制。Access Token 有效期为 15 分钟，Refresh Token 有效期为 7 天。支持多种登录方式：账号密码、手机验证码、第三方 OAuth。所有敏感操作需要二次验证。",
    tags: ["安全", "认证"],
    versions: [
      { version: "v2.0", date: "2024-01-12", summary: "增加了多因素认证支持" },
      { version: "v1.0", date: "2024-01-01", summary: "基础认证流程" },
    ],
    references: ["安全设计文档", "OAuth 集成指南"],
  },
  {
    id: 3,
    title: "数据库性能优化",
    content: "针对高并发场景，我们实施了以下优化策略：读写分离、分库分表、索引优化、查询缓存。通过这些措施，系统 QPS 从 1000 提升到了 10000，响应时间降低了 80%。",
    tags: ["数据库", "性能"],
    versions: [
      { version: "v1.1", date: "2024-01-08", summary: "添加了分库分表方案" },
      { version: "v1.0", date: "2024-01-02", summary: "基础优化方案" },
    ],
    references: ["MySQL 优化手册", "Redis 使用指南"],
  },
  {
    id: 4,
    title: "API 接口规范",
    content: "所有 API 遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。统一的响应格式包含 code、message、data 三个字段。错误码采用四位数字，前两位表示模块，后两位表示具体错误。",
    tags: ["API", "规范"],
    versions: [
      { version: "v3.0", date: "2024-01-14", summary: "新增了 GraphQL 支持" },
      { version: "v2.0", date: "2024-01-06", summary: "统一了错误码规范" },
      { version: "v1.0", date: "2024-01-01", summary: "初始 API 规范" },
    ],
    references: ["RESTful 设计指南"],
  },
]

const allTags = ["全部", "架构", "设计文档", "安全", "认证", "数据库", "性能", "API", "规范"]

// Mock preview content
const mockPreviewContent = `# 项目技术文档

## 1. 项目概述

本项目是一个现代化的企业级应用平台，采用微服务架构设计，旨在提供高可用、高性能的服务能力。

## 2. 技术栈

- **前端**: React 18, TypeScript, Tailwind CSS
- **后端**: Node.js, Express, PostgreSQL
- **部署**: Docker, Kubernetes, AWS

## 3. 核心功能

### 3.1 用户管理
- 用户注册与登录
- 权限管理
- 角色分配

### 3.2 数据处理
- 实时数据同步
- 批量数据导入导出
- 数据分析与报表

## 4. 部署说明

请参考部署文档进行环境配置和服务部署。
`

export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")
  const [chatInput, setChatInput] = useState("")
  const [blockSearch, setBlockSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("全部")
  const [selectedBlock, setSelectedBlock] = useState<typeof mockBlocks[0] | null>(null)
  const [previewMode, setPreviewMode] = useState("preview")
  const [exportTemplate, setExportTemplate] = useState("blog")
  const [exportFormat, setExportFormat] = useState("md")

  const filteredBlocks = mockBlocks.filter((block) => {
    const matchesSearch = block.title.toLowerCase().includes(blockSearch.toLowerCase()) ||
      block.content.toLowerCase().includes(blockSearch.toLowerCase())
    const matchesTag = selectedTag === "全部" || block.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-4 z-50 bg-card border border-border hover:bg-accent"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full bg-card border-l border-border transition-all duration-300 ease-in-out z-40 flex flex-col",
          isOpen ? "w-full sm:w-96 md:w-[420px] lg:w-[480px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">工具栏</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="hover:bg-accent"
          >
            <PanelRightClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-secondary p-1 mx-4 mt-4 shrink-0" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white text-xs sm:text-sm"
            >
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">AI 对话</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger
              value="blocks"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white text-xs sm:text-sm"
            >
              <LayoutGrid className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Block</span>
              <span className="sm:hidden">Block</span>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-accent-green data-[state=active]:text-white text-xs sm:text-sm"
            >
              <FileOutput className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">预览导出</span>
              <span className="sm:hidden">导出</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-4 min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {mockChatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                        message.role === "user"
                          ? "bg-accent-green text-white"
                          : "bg-secondary text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-accent-green-dark flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-4 shrink-0">
              <Input
                placeholder="输入消息..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-input border-border"
              />
              <Button size="icon" className="bg-accent-green hover:bg-accent-green/90 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Block Space Tab */}
          <TabsContent value="blocks" className="flex-1 flex flex-col m-0 p-4 min-h-0">
            {selectedBlock ? (
              // Block Detail View
              <div className="flex flex-col h-full">
                <Button
                  variant="ghost"
                  className="self-start mb-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedBlock(null)}
                >
                  ← 返回列表
                </Button>
                <ScrollArea className="flex-1">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {selectedBlock.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedBlock.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-accent-green/20 text-accent-green border-accent-green/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedBlock.content}
                      </p>
                    </div>

                    {/* Version History */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent-green" />
                        版本历史
                      </h4>
                      <div className="space-y-2">
                        {selectedBlock.versions.map((version, index) => (
                          <div
                            key={version.version}
                            className="group p-3 rounded-lg bg-secondary hover:bg-accent transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {version.version}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {version.date}
                              </span>
                            </div>
                            <p className={cn(
                              "text-xs text-muted-foreground transition-all",
                              index < 3 ? "line-clamp-1 group-hover:line-clamp-none" : "line-clamp-1 group-hover:line-clamp-none"
                            )}>
                              {version.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* References */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-accent-green" />
                        引用记录
                      </h4>
                      <div className="space-y-2">
                        {selectedBlock.references.map((ref) => (
                          <div
                            key={ref}
                            className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-accent transition-colors cursor-pointer"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{ref}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // Block List View
              <div className="flex flex-col h-full">
                {/* Search */}
                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索 Block..."
                    value={blockSearch}
                    onChange={(e) => setBlockSearch(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>

                {/* Tag Filter */}
                <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                  {allTags.slice(0, 6).map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTag === tag
                          ? "bg-accent-green text-white hover:bg-accent-green/90"
                          : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 6 && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-secondary text-muted-foreground hover:bg-accent"
                    >
                      更多 <ChevronDown className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>

                {/* Block Cards (Bento Grid) */}
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBlocks.map((block) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className="p-4 rounded-lg bg-secondary hover:bg-accent border border-border hover:border-accent-green/50 transition-all cursor-pointer group"
                      >
                        <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-1 group-hover:text-accent-green transition-colors">
                          {block.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                          {block.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {block.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-accent-green/30 text-accent-green"
                            >
                              <Tag className="h-2.5 w-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Preview & Export Tab */}
          <TabsContent value="export" className="flex-1 flex flex-col m-0 p-4 min-h-0">
            {/* Settings */}
            <div className="space-y-4 mb-4 shrink-0">
              {/* Mode Selection */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground shrink-0">模式:</span>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === "preview" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setPreviewMode("preview")}
                    className={cn(
                      previewMode === "preview" && "bg-accent-green hover:bg-accent-green/90 text-white"
                    )}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    预览
                  </Button>
                  <Button
                    variant={previewMode === "review" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setPreviewMode("review")}
                    className={cn(
                      previewMode === "review" && "bg-accent-green hover:bg-accent-green/90 text-white"
                    )}
                  >
                    <FileCheck className="h-4 w-4 mr-1" />
                    审阅
                  </Button>
                </div>
              </div>

              {/* Template Selection */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground shrink-0">模板:</span>
                <Select value={exportTemplate} onValueChange={setExportTemplate}>
                  <SelectTrigger className="flex-1 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novel">小说</SelectItem>
                    <SelectItem value="blog">博客</SelectItem>
                    <SelectItem value="outline">大纲</SelectItem>
                    <SelectItem value="report">报告</SelectItem>
                    <SelectItem value="academic">学术论文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground shrink-0">格式:</span>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="flex-1 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-accent-red" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="md">
                      <div className="flex items-center">
                        <FileCode className="h-4 w-4 mr-2 text-accent-green" />
                        Markdown
                      </div>
                    </SelectItem>
                    <SelectItem value="txt">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        纯文本
                      </div>
                    </SelectItem>
                    <SelectItem value="docx">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Word
                      </div>
                    </SelectItem>
                    <SelectItem value="html">
                      <div className="flex items-center">
                        <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                        HTML
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" className="bg-accent-green hover:bg-accent-green/90 text-white shrink-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 rounded-lg border border-border bg-secondary/50 overflow-hidden min-h-0">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 border-b border-border bg-secondary flex items-center justify-between shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {previewMode === "preview" ? "预览模式" : "审阅模式"} · {exportTemplate === "novel" ? "小说" : exportTemplate === "blog" ? "博客" : exportTemplate === "outline" ? "大纲" : exportTemplate === "report" ? "报告" : "学术论文"}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-accent-green/30 text-accent-green">
                    .{exportFormat}
                  </Badge>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className={cn(
                    "prose prose-invert prose-sm max-w-none",
                    previewMode === "review" && "bg-yellow-500/5 rounded p-2"
                  )}>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {mockPreviewContent}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  )
}
