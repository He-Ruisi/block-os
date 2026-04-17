import { X } from 'lucide-react'
import { EditorBreadcrumb } from '../EditorBreadcrumb'
import { EditorToolbar } from '../EditorToolbar'
import { EditorContentArea } from '../EditorContentArea'
import { EditorBubbleMenu } from '../EditorBubbleMenu'
import type { EditorViewProps } from './types'

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''

export function EditorView({
  editor,
  documentTitle,
  documentTags,
  lastEditedLabel,
  aiLoading,
  annotationPreview,
  onAiLoadingChange,
  onAnnotationPreviewChange,
  onDismissAnnotation,
}: EditorViewProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <EditorBreadcrumb
        documentTitle={documentTitle}
        projectName="项目"
        lastEdited={lastEditedLabel}
      />
      <EditorToolbar editor={editor} />
      <EditorContentArea
        editor={editor}
        documentTitle={documentTitle}
        tags={documentTags}
      />
      {editor ? (
        <EditorBubbleMenu
          editor={editor}
          apiKey={MIMO_API_KEY}
          aiLoading={aiLoading}
          setAiLoading={onAiLoadingChange}
          setAnnotationPreview={onAnnotationPreviewChange}
        />
      ) : null}
      {annotationPreview ? (
        <div className="sticky bottom-3 z-10 mx-12 flex items-start gap-2 rounded-lg border border-l-primary bg-background p-3 shadow-md">
          <span className="whitespace-nowrap pt-0.5 text-xs font-semibold text-primary">
            {annotationPreview.mode === 'explain' ? '解释' : '翻译'}
          </span>
          <span className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {annotationPreview.text}
          </span>
          <button
            className="bg-transparent text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={onDismissAnnotation}
            title="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
