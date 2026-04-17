import type { Document } from '@/types/models/document'
import { projectStore } from '@/storage/projectStore'
import { documentStore } from '@/storage/documentStore'
import { useStarred } from '../hooks/useStarred'
import { StarredView } from './StarredView'
import { toStarredItemViewModels } from './mappers'

interface StarredContainerProps {
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
}

export function StarredContainer({ onSelectProject, onOpenDocument }: StarredContainerProps) {
  const {
    starredItems,
    itemNames,
    draggedItem,
    removeStaleItem,
    handleUnstar,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  } = useStarred()

  const starredViewModels = toStarredItemViewModels(starredItems, itemNames)

  const handleItemClick = async (item: { id: string; type: 'project' | 'document' }) => {
    try {
      if (item.type === 'project') {
        const project = await projectStore.getProject(item.id)
        if (project) {
          onSelectProject(item.id)
        } else {
          const staleItem = starredItems.find(i => i.id === item.id && i.type === item.type)
          if (staleItem) removeStaleItem(staleItem)
        }
      } else if (item.type === 'document') {
        const doc = await documentStore.getDocument(item.id)
        if (doc) {
          onOpenDocument(doc)
        } else {
          const staleItem = starredItems.find(i => i.id === item.id && i.type === item.type)
          if (staleItem) removeStaleItem(staleItem)
        }
      }
    } catch (error) {
      console.error('Failed to handle starred item click:', error)
    }
  }

  return (
    <StarredView
      items={starredViewModels}
      draggedItemId={draggedItem?.id || null}
      onItemClick={handleItemClick}
      onUnstar={handleUnstar}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    />
  )
}
