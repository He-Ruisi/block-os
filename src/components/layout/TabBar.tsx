import { useState, useRef, useEffect, useCallback } from 'react'
import type { Tab } from '../../types/project'
import './TabBar.css'

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
    // 设置一个透明的拖拽图像（用 CSS 控制视觉）
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
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={[
              'tab',
              tab.id === activeTabId ? 'active' : '',
              dragIndex === index ? 'dragging' : '',
              dropIndex === index && dragIndex !== index ? 'drop-target' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelectTab(tab.id)}
            onContextMenu={e => handleContextMenu(e, tab.id, index)}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
          >
            <span className="tab-title">
              {tab.isDirty && <span className="tab-dirty-indicator">●</span>}
              {tab.type === 'today' && <span className="tab-type-icon">📅</span>}
              {tab.type === 'project' && <span className="tab-type-icon">📁</span>}
              {tab.type === 'document' && <span className="tab-type-icon">📄</span>}
              {tab.title}
            </span>
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); onCloseTab(tab.id) }}
              title="关闭"
            >
              ×
            </button>
          </div>
        ))}

        <button className="tab-new" onClick={onNewTab} title="新建标签页 (⌘T)">
          +
        </button>
      </div>

      <div className="tab-actions">
        <button
          className="tab-action-button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? '⊡' : '⛶'}
        </button>
      </div>

      {/* 右键菜单 */}
      {ctxMenu.visible && (
        <div
          ref={ctxMenuRef}
          className="tab-context-menu"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          <button
            className="ctx-menu-item"
            onClick={() => { onCloseTab(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
          >
            关闭
          </button>
          <button
            className="ctx-menu-item"
            onClick={() => { onCloseOtherTabs(ctxMenu.tabId); setCtxMenu(p => ({ ...p, visible: false })) }}
            disabled={tabs.length <= 1}
          >
            关闭其他
          </button>
          <button
            className="ctx-menu-item"
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
