import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PanelHeaderProps {
  title: string
  description?: string
  leading?: React.ReactNode
  onClose?: () => void
  actions?: React.ReactNode
  className?: string
}

/**
 * PanelHeader - 面板头部壳组件
 * 
 * 用于面板顶部的标题栏，包含标题、关闭按钮和可选的操作按钮。
 * 基于 Shadcn UI Button 组合而成，无业务逻辑。
 */
export function PanelHeader({
  title,
  description,
  leading,
  onClose,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between border-b border-border/80 bg-background/90 px-5 py-4 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading ? <div className="mt-0.5 text-muted-foreground">{leading}</div> : null}
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold leading-none tracking-[-0.01em]">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
