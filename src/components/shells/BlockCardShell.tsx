import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BlockCardShellProps {
  title?: string
  tags?: string[]
  children: React.ReactNode
  onClick?: () => void
  isActive?: boolean
  className?: string
}

/**
 * BlockCardShell - Block 卡片壳组件
 * 
 * 用于展示 Block 的卡片容器，包含标题、标签和内容区域。
 * 基于 Shadcn UI Card 和 Badge 组合而成，无业务逻辑。
 */
export function BlockCardShell({
  title,
  tags,
  children,
  onClick,
  isActive,
  className,
}: BlockCardShellProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent',
        isActive && 'border-primary bg-accent',
        className
      )}
      onClick={onClick}
    >
      {(title || tags) && (
        <CardHeader className="pb-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !tags && 'pt-6')}>{children}</CardContent>
    </Card>
  )
}
