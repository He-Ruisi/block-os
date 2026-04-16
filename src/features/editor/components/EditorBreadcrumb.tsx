import { ChevronRight, Clock, Star, MessageSquare, Share2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditorBreadcrumbProps {
  documentTitle?: string
  projectName?: string
  lastEdited?: string
  className?: string
}

export function EditorBreadcrumb({
  documentTitle = '欢迎使用',
  projectName = '项目',
  lastEdited = '2 分钟前编辑',
  className,
}: EditorBreadcrumbProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-8 lg:px-16 py-4 border-b border-border bg-card/50",
      className
    )}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        <span className="hover:text-foreground cursor-pointer transition-colors">工作空间</span>
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <span className="hover:text-foreground cursor-pointer transition-colors">{projectName}</span>
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <span className="text-foreground font-medium whitespace-nowrap">{documentTitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">{lastEdited}</span>
          <span className="sm:hidden">2分钟前</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Star className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
