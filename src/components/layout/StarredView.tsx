import { useState, useEffect } from 'react'
import { Star, Folder, FileText } from 'lucide-react'
import type { StarredItem } from '../../types/common/layout'
import type { Document } from '../../types/models/document'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'

interface StarredViewProps {
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
}

const STORAGE_KEY = 'blockos-starred-items'

function loadStarredItems(): StarredItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const items = JSON.parse(raw) as StarredItem[]
      return items.map(item => ({
        ...item,
        starredAt: new Date(item.starredAt),
      }))
    }
  } catch (error) {
    console.error('Failed to load starred items:', error)
  }
  return []
}

function saveStarredItems(items: StarredItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save starred items:', error)
  }
}

export function StarredView({ onSelectProject, onOpenDocument }: StarredViewProps) {
  const [starredItems, setStarredItems] = useState<StarredItem[]>(loadStarredItems)
  const [itemNames, setItemNames] = useState<Record<string, string>>({})
  const [draggedItem, setDraggedItem] = useState<StarredItem | null>(null)

  const removeStaleItem = (target: StarredItem) => {
    setStarredItems(prev => {
      const next = prev.filter(item => !(item.id === target.id && item.type === target.type))
      saveStarredItems(next)
      return next
    })
  }

  // 加载项目和文档名称
  useEffect(() => {
    if (starredItems.length === 0) {
      setItemNames({})
      return
    }

    const loadNames = async () => {
      try {
        const names: Record<string, string> = {}
        
        for (const item of starredItems) {
          try {
            if (item.type === 'project') {
              const project = await projectStore.getProject(item.id)
              if (project) {
                names[item.id] = project.name
              }
            } else if (item.type === 'document') {
              const doc = await documentStore.getDocument(item.id)
              if (doc) {
                names[item.id] = doc.title
              }
            }
          } catch (error) {
            console.error(`Failed to load name for ${item.type} ${item.id}:`, error)
            // 使用缓存的名称作为后备
            names[item.id] = item.name
          }
        }
        
        setItemNames(names)
      } catch (error) {
        console.error('Failed to load starred item names:', error)
      }
    }
    
    loadNames()
  }, [starredItems])

  // 监听全局置顶事件
  useEffect(() => {
    const handleToggleStar = (e: Event) => {
      const { id, type, name, projectId } = (e as CustomEvent<{
        id: string
        type: 'project' | 'document'
        name: string
        projectId?: string
      }>).detail
      
      setStarredItems(prev => {
        const exists = prev.find(item => item.id === id && item.type === type)
        let next: StarredItem[]
        
        if (exists) {
          // 取消置顶
          next = prev.filter(item => !(item.id === id && item.type === type))
        } else {
          // 添加置顶
          next = [
            ...prev,
            {
              id,
              type,
              name,
              projectId,
              starredAt: new Date(),
            },
          ]
        }
        
        saveStarredItems(next)
        return next
      })
    }
    
    window.addEventListener('toggleStar', handleToggleStar)
    return () => window.removeEventListener('toggleStar', handleToggleStar)
  }, [])

  const handleItemClick = async (item: StarredItem) => {
      try {
        if (item.type === 'project') {
          const project = await projectStore.getProject(item.id)
          if (project) {
            onSelectProject(item.id)
          } else {
            removeStaleItem(item)
          }
        } else if (item.type === 'document') {
          const doc = await documentStore.getDocument(item.id)
          if (doc) {
            onOpenDocument(doc)
          } else {
            removeStaleItem(item)
          }
        }
      } catch (error) {
      console.error('Failed to handle starred item click:', error)
    }
  }

  const handleUnstar = (e: React.MouseEvent, item: StarredItem) => {
    e.stopPropagation()
    
    setStarredItems(prev => {
      const next = prev.filter(i => !(i.id === item.id && i.type === item.type))
      saveStarredItems(next)
      return next
    })
    
    // 触发全局事件通知其他组件
    window.dispatchEvent(new CustomEvent('toggleStar', {
      detail: {
        id: item.id,
        type: item.type,
        name: item.name,
        projectId: item.projectId,
      },
    }))
  }

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, item: StarredItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // 放置
  const handleDrop = (e: React.DragEvent, targetItem: StarredItem) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null)
      return
    }

    setStarredItems(prev => {
      const draggedIndex = prev.findIndex(i => i.id === draggedItem.id && i.type === draggedItem.type)
      const targetIndex = prev.findIndex(i => i.id === targetItem.id && i.type === targetItem.type)
      
      if (draggedIndex === -1 || targetIndex === -1) return prev
      
      const next = [...prev]
      next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, draggedItem)
      
      saveStarredItems(next)
      return next
    })
    
    setDraggedItem(null)
  }

  if (starredItems.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
          <Star size={32} className="text-muted-foreground mb-3 opacity-50" />
          <div className="text-sm text-muted-foreground mb-1.5">还没有置顶项目</div>
          <div className="text-xs text-muted-foreground leading-relaxed">在项目或文档上点击星标图标即可置顶</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col gap-0.5">
        {starredItems.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all relative ${
              draggedItem?.id === item.id ? 'opacity-50 cursor-move' : 'hover:bg-muted'
            }`}
            onClick={() => handleItemClick(item)}
            draggable
            onDragStart={e => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, item)}
          >
            {item.type === 'project' ? (
              <Folder size={16} className="text-muted-foreground shrink-0" />
            ) : (
              <FileText size={16} className="text-muted-foreground shrink-0" />
            )}
            <span className="flex-1 text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {itemNames[item.id] || item.name}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 hover:opacity-100 bg-transparent border-none p-1 cursor-pointer text-yellow-500 rounded transition-all shrink-0 hover:bg-muted"
              onClick={e => handleUnstar(e, item)}
              title="取消置顶"
            >
              <Star size={14} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
