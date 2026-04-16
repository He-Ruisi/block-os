import { RightSidebar } from "@/components/right-sidebar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Main content area */}
      <div className="p-6 sm:p-8 lg:p-12 sm:pr-[400px] md:pr-[440px] lg:pr-[500px] transition-all duration-300">
        <div className="max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              工作区
            </h1>
            <p className="text-muted-foreground">
              这是您的主要工作区域，右侧工具栏提供 AI 对话、Block 空间和预览导出功能。
            </p>
          </header>

          {/* Demo content */}
          <div className="space-y-6">
            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">功能说明</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center shrink-0">
                    <span className="text-accent-green font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">AI 对话</h3>
                    <p>与 AI 助手进行实时对话，获取智能建议和帮助。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center shrink-0">
                    <span className="text-accent-green font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Block 空间</h3>
                    <p>管理和浏览您的内容块，支持搜索、标签筛选和版本历史查看。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center shrink-0">
                    <span className="text-accent-green font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">预览导出</h3>
                    <p>预览内容并导出为多种格式，包括 PDF、Markdown、纯文本等。</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">开始使用</h2>
              <p className="text-sm text-muted-foreground mb-4">
                点击右侧工具栏的标签页切换不同功能。工具栏可以通过点击关闭按钮隐藏，隐藏后可以通过右上角的按钮重新打开。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green">
                  响应式设计
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-green-dark/30 text-emerald-400">
                  深色主题
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-red/20 text-accent-red">
                  可隐藏侧边栏
                </span>
              </div>
            </section>

            {/* Placeholder cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-xl bg-card border border-border hover:border-accent-green/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-secondary mb-4" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary/50 rounded w-full mb-1" />
                  <div className="h-3 bg-secondary/50 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </main>
  )
}
