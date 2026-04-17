import type { Editor as TiptapEditor } from '@tiptap/react'
import type { AIToolbarMode } from '../types'

export interface AnnotationPreviewViewModel {
  text: string
  mode: 'explain' | 'translate'
}

export interface EditorViewProps {
  editor: TiptapEditor | null
  documentTitle: string
  documentTags: string[]
  lastEditedLabel: string
  aiLoading: AIToolbarMode | null
  annotationPreview: AnnotationPreviewViewModel | null
  onAiLoadingChange: (mode: AIToolbarMode | null) => void
  onAnnotationPreviewChange: (preview: AnnotationPreviewViewModel | null) => void
  onDismissAnnotation: () => void
}
