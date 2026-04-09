import { Tab } from '../lib/projectStore'
import './TabBar.css'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onNewTab: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onToggleFullscreen,
  isFullscreen
}: TabBarProps) {
  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className="tab-title">
              {tab.isDirty && <span className="tab-dirty-indicator">●</span>}
              {tab.title}
            </span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                onCloseTab(tab.id)
              }}
              title="关闭"
            >
              ×
            </button>
          </div>
        ))}
        
        <button className="tab-new" onClick={onNewTab} title="新建标签页">
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
    </div>
  )
}
