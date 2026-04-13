import type { SidebarView } from '../../types/layout'
import type { Document } from '../../types/document'
import { ExplorerView } from './ExplorerView'
import { SearchView } from './SearchView'
import { OutlineView } from './OutlineView'
import { ExtensionsView } from './ExtensionsView'
import { SyncStatusIndicator } from '../shared/SyncStatusIndicator'
import './Sidebar.css'

interface SidebarProps {
  activeView: SidebarView
  collapsed: boolean
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
  documentId: string | null
}

const VIEW_TITLES: Record<SidebarView, string> = {
  explorer: '资源管理器',
  search: '搜索',
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
}: SidebarProps) {
  if (collapsed) {
    return null
  }

  return (
    <div className="sidebar-panel">
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
          <SearchView onOpenDocument={(docId) => {
            // Search results are blocks, not documents — open by creating a notification
            console.log('Search result clicked:', docId)
          }} />
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
  )
}
