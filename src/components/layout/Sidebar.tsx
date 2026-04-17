import type { SidebarView } from '../../types/common/layout'
import type { Document } from '../../types/models/document'
import { Explorer } from '@/features/sidebar/explorer'
import { Search } from '@/features/sidebar/search'
import { Outline } from '@/features/sidebar/outline'
import { Extensions } from '@/features/sidebar/extensions'
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
      {(viewport.isTablet || viewport.isMobile) && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-in fade-in-0 duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-background/95 backdrop-blur-sm lg:relative lg:z-0 lg:translate-x-0',
          'transition-transform duration-200 ease-linear',
          (viewport.isTablet || viewport.isMobile) && 'animate-in slide-in-from-left-full duration-200'
        )}
        {...((viewport.isTablet || viewport.isMobile) ? swipeHandlers : {})}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-4 shrink-0">
          <div className="section-label px-3 py-1.5">
            <span className="section-label__dot" />
            <span className="section-label__text">{VIEW_TITLES[activeView]}</span>
          </div>

          {(viewport.isTablet || viewport.isMobile) && onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">关闭侧边栏</span>
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3">
            {activeView === 'explorer' && (
              <Explorer
                onSelectToday={onSelectToday}
                onSelectProject={onSelectProject}
                onOpenDocument={onOpenDocument}
                currentProjectId={currentProjectId}
              />
            )}
            {activeView === 'search' && (
              <Search
                onOpenBlock={blockId => {
                  window.dispatchEvent(new CustomEvent('openBlockDetail', { detail: blockId }))
                }}
              />
            )}
            {activeView === 'outline' && <Outline documentId={documentId} />}
            {activeView === 'extensions' && (
              <Extensions
                onOpenPlugin={onOpenPlugin}
                onOpenPluginSettings={onOpenPluginSettings}
              />
            )}
          </div>
        </ScrollArea>

        <div className="flex h-12 items-center border-t border-border/80 px-3 shrink-0 bg-secondary/40">
          <SyncStatusIndicator />
        </div>
      </aside>
    </>
  )
}
