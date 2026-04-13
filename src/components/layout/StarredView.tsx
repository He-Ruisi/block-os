import { useState, useEffect } from 'react'
import { Star, Folder, FileText } from 'lucide-react'
import type { StarredItem } from '../../types/layout'
import type { Document } from '../../types/document'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'
import './StarredView.css'

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

  // 加载项目和文档名称
  useEffect(() => {
    const loadNames = async () => {
      const names: Record<string, string> = {}
      
      for (const item of starredItems) {
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
      }
      
      setItemNames(names)
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
    if (item.type === 'project') {
      onSelectProject(item.id)
    } else if (item.type === 'document') {
      const doc = await documentStore.getDocument(item.id)
      if (doc) {
        onOpenDocument(doc)
      }
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

  if (starredItems.length === 0) {
    return (
      <div className="starred-view">
        <div className="starred-empty">
          <Star size={32} className="starred-empty-icon" />
          <div className="starred-empty-text">还没有置顶项目</div>
          <div className="starred-empty-hint">在项目或文档上点击星标图标即可置顶</div>
        </div>
      </div>
    )
  }

  return (
    <div className="starred-view">
      <div className="starred-list">
        {starredItems.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className="starred-item"
            onClick={() => handleItemClick(item)}
          >
            {item.type === 'project' ? (
              <Folder size={16} className="starred-item-icon" />
            ) : (
              <FileText size={16} className="starred-item-icon" />
            )}
            <span className="starred-item-name">
              {itemNames[item.id] || item.name}
            </span>
            <button
              className="starred-item-unstar"
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
