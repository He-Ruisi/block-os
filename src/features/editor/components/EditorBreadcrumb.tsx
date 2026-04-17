import { ChevronRight, Clock, MessageSquare, MoreHorizontal, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EditorBreadcrumbViewProps } from './EditorBreadcrumb/types'

export function EditorBreadcrumb({
  documentTitle = '欢迎使用',
  projectName = '项目',
  lastEdited = '2 分钟前编辑',
  className,
}: EditorBreadcrumbViewProps) {
  return (
    <div className={cn('flex flex-col justify-between gap-3 border-b bg-card/50 px-4 py-4 sm:flex-row sm:items-center sm:px-8 lg:px-16', className)}>
      <div className="flex items-center gap-1 overflow-x-auto text-sm text-muted-foreground">
        <span className="cursor-pointer transition-colors hover:text-foreground">工作空间</span>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <span className="cursor-pointer transition-colors hover:text-foreground">{projectName}</span>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
        <span className="whitespace-nowrap font-medium text-foreground">{documentTitle}</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="mr-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{lastEdited}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Star className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}
