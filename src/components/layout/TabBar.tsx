import { useState, useRef, useEffect, useCallback } from 'react'
import type { Tab } from '../../types/project'
import { Button } from '@/components/ui/button'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onCloseOtherTabs: (tabId: string) => void
  onCloseTabsToRight: (tabId: string) => void
  onReorderTabs: (fromIndex: number, toIndex: number) => void
  onNewTab: () => void
  onToggleFullscreen: () => void
  onSaveTab: (tabId: string) => void
  isFullscreen: boolean
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  tabId: string
  tabIndex: number
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
  onReorderTabs,
  onNewTab,
  onToggleFullscreen,
  onSaveTab,
  isFullscreen,
}: TabBarProps) {
  // ---- 拖拽状态 ----
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  // ---- 右键菜单 ----
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, tabId: '', tabIndex: -1,
  })
  const ctxMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    if (!ctxMenu.visible) return
    const handleClick = (e: MouseEvent) => {
      if (ctxMenuRef.current && !ctxMenuRef.current.contains(e.target as Node)) {
        setCtxMenu(prev => ({ ...prev, visible: false }))
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ctxMenu.visible])

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string, index: number) => {
    e.preventDefault()
    setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, tabId, tabIndex: index })
  }, [])

  // ---- 拖拽处理 ----
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      onReorderTabs(dragIndex, dropIndex)
    }
    setDragIndex(null)
    setDropIndex(null)
  }, [dragIndex, dropIndex, onReorderTabs])

  const handleDragLeave = useCallback(() => {
    setDropIndex(null)
  }, [])

  return (
    <div className="flex h-11 flex-shrink-0 items-center justify-between border-b border-border bg-secondary px-2">
      {/* 标签页列表 */}
      <div className="flex flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`
              relative flex max-w-[200px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-md px-3 py-2 transition-colors select-none
              ${tab.id === activeTabId 
                ? 'bg-background shadow-sm' 
                : 'bg-transparent hover:bg-muted'
              }
              ${dragIndex === index ? 'opacity-40' : ''}
              ${dropIndex === index && dragIndex !== index ? 'border-l-2 border-purple-600' : ''}
            `}
            onClick={() => onSelectTab(tab.id)}
            onContextMenu={e => handleContextMenu(e, tab.id, index)}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
          >
            <span className="flex items-center gap-1.5 overflow-hidden text-ellipsis text-sm text-foreground">
              {tab.isDirty && <span className="text-xs text-blue-500">●</span>}
              {tab.type === 'today' && <span className="text-xs flex-shrink-0">📅</span>}
              {tab.type === 'project' && <span className="text-xs flex-shrink-0">📁</span>}
              {tab.type === 'document' && <span className="text-xs flex-shrink-0">📄</span>}
              {tab.title}
            </span>
            <button
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-muted-foreground/20 group-hover:opacity-100"
              onClick={e => { e.stopPropagation(); onCloseTab(tab.id) }}
              title="关闭"
            >
              <span className="text-lg text-muted-foreground hover:text-foreground">×</span>
            </button>
          </div>
        ))}

        {/* 新建标签按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={onNewTab}
          title="新建标签页 (⌘T)"
        >
          <span className="text-lg">+</span>
        </Button>
      </div>

      {/* 操作按钮 */}
      <div className="ml-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          <span className="text-lg">{isFullscreen ? '⊡' : '⛶'}</span>
        </Button>
      </div>

      {/* 右键菜单 */}
      {ctxMenu.visible && (
        <div
          ref={ctxMenuRef}
          className="fixed z-[1000] min-w-[140px] animate-in fade-in-0 zoom-in-95 rounded-md border border-border bg-background p-1 shadow-lg"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          <button
            className="flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => { onSaveTab(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
          >
            💾 保存
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            className="flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => { onCloseTab(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
          >
            关闭
          </button>
          <button
            className="flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => { onCloseOtherTabs(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
            disabled={tabs.length <= 1}
          >
            关闭其他
          </button>
          <button
            className="flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            onClick={() => { onCloseTabsToRight(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
            disabled={ctxMenu.tabIndex >= tabs.length - 1}
          >
            关闭右侧
          </button>
        </div>
      )}
    </div>
  )
}
