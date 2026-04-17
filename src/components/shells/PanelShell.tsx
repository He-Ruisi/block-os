import { cn } from '@/lib/utils'

interface PanelShellProps {
  children: React.ReactNode
  className?: string
}

/**
 * PanelShell - 面板容器壳组件
 * 
 * 用于右侧面板的统一容器，提供一致的布局和样式。
 * 基于 Shadcn UI 组合而成，无业务逻辑。
 */
export function PanelShell({ children, className }: PanelShellProps) {
  return (
    <div
      className={cn(
        'surface-glow flex h-full flex-col bg-background/95',
        className
      )}
    >
      {children}
    </div>
  )
}
