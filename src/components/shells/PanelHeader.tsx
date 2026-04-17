import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PanelHeaderProps {
  title: string
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
export function PanelHeader({ title, onClose, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b bg-background px-4 py-3',
        className
      )}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {actions}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
