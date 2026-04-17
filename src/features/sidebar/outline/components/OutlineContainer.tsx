import { useOutline } from '../hooks/useOutline'
import { OutlineView } from './OutlineView'
import { toOutlineItemViewModels } from './mappers'

interface OutlineContainerProps {
  documentId: string | null
}

export function OutlineContainer({ documentId }: OutlineContainerProps) {
  const { outline, documentTitle } = useOutline(documentId)

  const outlineViewModels = toOutlineItemViewModels(outline)

  const handleHeadingClick = (item: { text: string; level: number }) => {
    // 通过自定义事件通知编辑器跳转
    window.dispatchEvent(
      new CustomEvent('navigateToHeading', {
        detail: { text: item.text, level: item.level },
      })
    )
  }

  return (
    <OutlineView
      documentId={documentId}
      outline={outlineViewModels}
      documentTitle={documentTitle}
      onHeadingClick={handleHeadingClick}
    />
  )
}
