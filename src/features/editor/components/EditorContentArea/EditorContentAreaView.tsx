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
    <div className={cn('flex-1 overflow-x-hidden overflow-y-auto bg-[#f6f2ea]', className)}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mb-3 h-12 w-12 rounded-2xl border border-[#35AB67]/20 bg-[#35AB67]/10 text-3xl text-[#00362F] hover:bg-[#35AB67]/15 sm:h-14 sm:w-14"
          >
            📘
          </Button>
          <h1 className="text-3xl font-bold leading-tight text-[#00362F] sm:text-4xl lg:text-5xl">
            {documentTitle}
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Hash className="h-4 w-4 text-[#35AB67]" />
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border border-[#35AB67]/20 bg-[#35AB67]/10 text-[#00362F]"
            >
              {tag}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-[#00362F]/70 hover:text-[#00362F]"
          >
            <Plus className="h-3.5 w-3.5" />
            添加标签
          </Button>
        </div>

        <Card className="editor-content-surface overflow-hidden rounded-[28px] border border-[#00362F]/10 bg-[#fffdf9] shadow-[0_24px_60px_rgba(0,54,47,0.06)]">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn('min-h-[200px] px-6 py-8 text-[15px] leading-relaxed text-foreground sm:px-10 sm:py-10')}
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
