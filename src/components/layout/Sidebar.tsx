import type { SidebarView } from '../../types/layout'
import type { Document } from '../../types/document'
import { ExplorerView } from './ExplorerView'
import { SearchView } from './SearchView'
import { StarredView } from './StarredView'
import { OutlineView } from './OutlineView'
import { ExtensionsView } from './ExtensionsView'
import { SyncStatusIndicator } from '../shared/SyncStatusIndicator'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import { useViewport } from '../../hooks/useViewport'
import './Sidebar.css'

interface SidebarProps {
  activeView: SidebarView
  collapsed: boolean
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
  documentId: string | null
  onClose?: () => void
}

const VIEW_TITLES: Record<SidebarView, string> = {
  explorer: '资源管理器',
  search: '搜索',
  starred: '置顶',
  outline: '大纲',
  extensions: '插件',
}

export function Sidebar({
  activeView,
  collapsed,
  onSelectToday,
  onSelectProject,
  onOpenDocument,
  currentProjectId,
  documentId,
  onClose,
}: SidebarProps) {
  const viewport = useViewport()
  
  // 滑动手势：向左滑动关闭侧边栏
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if ((viewport.isTablet || viewport.isMobile) && onClose) {
        onClose()
      }
    },
  })

  return (
    <>
      {/* 响应式遮罩层 - 仅在平板/手机模式显示 */}
      {!collapsed && (
        <div 
          className={`sidebar-overlay ${!collapsed ? 'visible' : ''}`}
          onClick={onClose}
        />
      )}
      
      <div 
        className={`sidebar-panel ${!collapsed ? 'expanded' : ''}`}
        style={{ display: collapsed ? 'none' : 'flex' }}
        {...((viewport.isTablet || viewport.isMobile) ? swipeHandlers : {})}
      >
        <div className="sidebar-panel-header">
          {VIEW_TITLES[activeView]}
        </div>

        <div className="sidebar-panel-content">
          {activeView === 'explorer' && (
            <ExplorerView
              onSelectToday={onSelectToday}
              onSelectProject={onSelectProject}
              onOpenDocument={onOpenDocument}
              currentProjectId={currentProjectId}
            />
          )}
          {activeView === 'search' && (
            <SearchView onOpenBlock={(blockId) => {
              window.dispatchEvent(new CustomEvent('openBlockDetail', { detail: blockId }))
            }} />
          )}
          {activeView === 'starred' && (
            <StarredView
              onSelectProject={onSelectProject}
              onOpenDocument={onOpenDocument}
            />
          )}
          {activeView === 'outline' && (
            <OutlineView documentId={documentId} />
          )}
          {activeView === 'extensions' && (
            <ExtensionsView />
          )}
        </div>

        <div className="sidebar-panel-footer">
          <SyncStatusIndicator />
        </div>
      </div>
    </>
  )
}
