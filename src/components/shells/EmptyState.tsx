import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  compact?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * EmptyState - 空状态壳组件
 * 
 * 用于展示空状态的占位组件，包含图标、标题、描述和可选的操作按钮。
 * 基于 Shadcn UI Button 组合而成，无业务逻辑。
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  compact = false,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-3 py-8' : 'gap-5 py-12',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.05] text-primary shadow-[var(--shadow-sm)]',
            compact ? 'h-12 w-12' : 'h-16 w-16'
          )}
        >
          <Icon className={cn(compact ? 'h-6 w-6' : 'h-8 w-8')} />
        </div>
      )}
      <div className="space-y-2">
        <h3 className={cn('font-semibold tracking-[-0.01em]', compact ? 'text-sm' : 'text-lg')}>{title}</h3>
        {description && <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}
