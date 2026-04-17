import { ArrowRight, Bookmark, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EditorBubbleMenuViewProps } from './types'

export function EditorBubbleMenuView({
  aiLoading,
  customPrompt,
  onCustomPromptChange,
  onCustomPromptSubmit,
  paragraphButtons,
  formatButtons,
  aiActions,
  onOpenAIChat,
  onAIAction,
  onCapture,
}: EditorBubbleMenuViewProps) {
  const renderButtons = (buttons: typeof paragraphButtons) =>
    buttons.map((button) => (
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
        title={button.title}
      >
        {button.icon ? <button.icon className="h-4 w-4" /> : button.label}
      </Button>
    ))

  return (
    <div className="flex min-w-[320px] flex-col gap-1 rounded-xl border bg-popover p-1.5 shadow-lg">
      <div className="flex items-center gap-1">
        {renderButtons(paragraphButtons)}
        <div className="mx-1 h-4 w-px bg-border" />
        {renderButtons(formatButtons)}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
          onClick={onOpenAIChat}
          title="AI 对话"
        >
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          AI
        </Button>
        <div className="mx-1 h-4 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" disabled={aiLoading !== null}>
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI 功能
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {aiActions.map((action) => (
              <DropdownMenuItem key={action.mode} onClick={() => onAIAction(action.mode)} disabled={aiLoading !== null}>
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCapture} disabled={aiLoading !== null}>
              <Bookmark className="mr-2 h-4 w-4" />
              <span>捕获为块</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onAIAction('continue')} disabled={aiLoading !== null}>
          {aiLoading === 'continue' ? '...' : '续写'}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onAIAction('rewrite')} disabled={aiLoading !== null}>
          {aiLoading === 'rewrite' ? '...' : '改写'}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onAIAction('translate')} disabled={aiLoading !== null}>
          {aiLoading === 'translate' ? '...' : '翻译'}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onAIAction('explain')} disabled={aiLoading !== null}>
          {aiLoading === 'explain' ? '...' : '解释'}
        </Button>
      </div>

      <div className="border-t px-1 pt-1">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <Input
            value={customPrompt}
            onChange={(event) => onCustomPromptChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onCustomPromptSubmit()}
            placeholder="输入自定义指令..."
            className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
          <Button variant="default" size="icon" className="h-5 w-5" onClick={onCustomPromptSubmit} disabled={!customPrompt.trim()}>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
