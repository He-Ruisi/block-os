import { Hash, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SuggestionMenu } from '../SuggestionMenu'
import type { EditorContentAreaViewProps } from './types'

export function EditorContentAreaView({
  documentTitle,
  tags,
  className,
  editorContent,
  onDrop,
  onDragOver,
  suggestion,
}: EditorContentAreaViewProps) {
  return (
    <div className={cn('flex-1 overflow-x-hidden overflow-y-auto', className)}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="icon" className="mb-3 h-12 w-12 text-3xl sm:h-14 sm:w-14">
            📘
          </Button>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {documentTitle}
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            添加标签
          </Button>
        </div>

        <Card className="border-0 bg-transparent shadow-none">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn('min-h-[200px] text-[15px] leading-relaxed text-foreground')}
          >
            {editorContent}
          </div>
        </Card>
      </div>

      {suggestion.visible ? (
        <SuggestionMenu
          items={suggestion.items}
          onSelect={suggestion.onSelect}
          onClose={suggestion.onClose}
          position={suggestion.position}
        />
      ) : null}
    </div>
  )
}
