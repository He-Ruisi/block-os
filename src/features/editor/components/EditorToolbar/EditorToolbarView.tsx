import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EditorToolbarViewProps } from './types'

export function EditorToolbarView({
  topSections,
  bottomSections,
  shortcutHint,
  className,
}: EditorToolbarViewProps) {
  const renderSection = (section: EditorToolbarViewProps['topSections'][number]) => (
    <div key={section.id} className="flex items-center gap-0.5">
      {section.buttons.map((button) => (
        <Button
          key={button.id}
          variant="ghost"
          size="sm"
          className={cn(
            button.label ? 'h-7 px-2 text-xs' : 'h-7 w-7 p-0',
            button.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
            button.className,
          )}
          onClick={button.onClick}
          disabled={button.disabled}
          title={button.title}
        >
          {button.icon ? <button.icon className="h-4 w-4" /> : button.label}
        </Button>
      ))}
    </div>
  )

  return (
    <div className={cn('flex shrink-0 flex-col border-b bg-background', className)}>
      <div className="flex min-h-9 items-center gap-1 overflow-x-auto border-b px-3 py-1.5">
        {topSections.map((section, index) => (
          <div key={section.id} className="flex items-center">
            {renderSection(section)}
            {index < topSections.length - 1 ? <div className="mx-1 h-4 w-px bg-border" /> : null}
          </div>
        ))}
      </div>
      <div className="flex min-h-9 items-center gap-1 overflow-x-auto px-3 py-1.5">
        {bottomSections.map((section, index) => (
          <div key={section.id} className="flex items-center">
            {renderSection(section)}
            {index < bottomSections.length - 1 ? <div className="mx-1 h-4 w-px bg-border" /> : null}
          </div>
        ))}
        <div className="flex-1" />
        <span className="whitespace-nowrap text-xs text-muted-foreground">{shortcutHint}</span>
      </div>
    </div>
  )
}
