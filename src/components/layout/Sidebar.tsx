import type { SidebarView } from '../../types/common/layout'
import type { Document } from '../../types/models/document'
import { ExplorerView } from './ExplorerView'
import { SearchView } from './SearchView'
import { StarredView } from './StarredView'
import { OutlineView } from './OutlineView'
import { ExtensionsView } from './ExtensionsView'
import { SyncStatusIndicator } from '../shared/SyncStatusIndicator'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import { useViewport } from '../../hooks/useViewport'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps {
  activeView: SidebarView
  collapsed: boolean
  onOpenPlugin: (pluginId: string) => void
  onOpenPluginSettings: (pluginId: string) => void
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
  onOpenPlugin,
  onOpenPluginSettings,
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

  if (collapsed) {
    return null
  }

  return (
    <>
      {/* 响应式遮罩层 - 仅在平板/手机模式显示 */}
      {(viewport.isTablet || viewport.isMobile) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in-0 duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-0",
          "w-60 bg-background border-r border-border",
          "flex flex-col",
          "transition-transform duration-200 ease-linear",
          "lg:translate-x-0",
          (viewport.isTablet || viewport.isMobile) && "animate-in slide-in-from-left-full duration-200"
        )}
        {...((viewport.isTablet || viewport.isMobile) ? swipeHandlers : {})}
      >
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {VIEW_TITLES[activeView]}
          </h2>
          
          {/* 移动端关闭按钮 */}
          {(viewport.isTablet || viewport.isMobile) && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">关闭侧边栏</span>
            </Button>
          )}
        </div>

        {/* Content - 使用 ScrollArea */}
        <ScrollArea className="flex-1">
          <div className="p-2">
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
              <ExtensionsView
                onOpenPlugin={onOpenPlugin}
                onOpenPluginSettings={onOpenPluginSettings}
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="h-10 flex items-center px-3 border-t border-border shrink-0 bg-muted/30">
          <SyncStatusIndicator />
        </div>
      </aside>
    </>
  )
}
