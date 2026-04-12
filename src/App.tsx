import { useState, useEffect, useCallback } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { ActivityBar } from './components/layout/ActivityBar'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { Editor } from './components/editor/Editor'
import { ResizeHandle } from './components/layout/ResizeHandle'
import { RightPanel } from './components/panel/RightPanel'
import { AIFloatPanel } from './components/ai/AIFloatPanel'
import type { AIMode } from './components/ai/AIFloatPanel'
import { AuthPage } from './components/auth/AuthPage'
import { initStorage } from './storage'
import { useAppLayout } from './hooks/useAppLayout'
import { useTabs } from './hooks/useTabs'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('blockos-theme') || 'default')

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'default' ? 'newsprint' : 'default'
      localStorage.setItem('blockos-theme', next)
      return next
    })
  }, [])

  const auth = useAuth()

  const {
    sidebarCollapsed,
    sidebarView,
    isFullscreen,
    editorWidth,
    toggleSidebar,
    toggleFullscreen,
    setEditorWidth,
    setSidebarView,
    minEditorWidth,
    maxEditorWidth,
  } = useAppLayout()

  const {
    tabs,
    activeTabId,
    currentProjectId,
    selectTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    reorderTabs,
    selectToday,
    selectProject,
    openDocument,
    newTab,
  } = useTabs()

  // 统一初始化所有 Store
  useEffect(() => {
    initStorage().catch(console.error)
  }, [])

  // 全局键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 't') {
        e.preventDefault()
        newTab()
      } else if (e.key === 'w') {
        if (tabs.length > 1) {
          e.preventDefault()
          closeTab(activeTabId)
        }
      } else if (e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [newTab, closeTab, activeTabId, toggleSidebar, tabs.length])

  // ActivityBar 视图切换：点击已激活的图标折叠面板，否则切换视图并展开
  const handleSidebarViewChange = useCallback((view: typeof sidebarView) => {
    if (sidebarView === view && !sidebarCollapsed) {
      toggleSidebar()
    } else {
      setSidebarView(view)
      if (sidebarCollapsed) toggleSidebar()
    }
  }, [sidebarView, sidebarCollapsed, toggleSidebar, setSidebarView])

  const handleInsertAIContent = (content: string) => {
    if (editor) {
      const lines = content.split('\n').filter(l => l.trim())
      editor.chain().focus().insertContent({
        type: 'sourceBlock',
        attrs: { source: 'ai', sourceLabel: '◆ AI 生成' },
        content: lines.map(line => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        })),
      }).run()
    }
  }

  const activeDocumentId = tabs.find(t => t.id === activeTabId)?.documentId

  // AI 浮层面板状态
  const [aiFloatPanel, setAIFloatPanel] = useState<{
    mode: AIMode
    contextText: string
    position: { top: number; left: number }
  } | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ contextText?: string; position?: { top: number; left: number } }>).detail
      setAIFloatPanel({
        mode: 'bubble',
        contextText: detail.contextText || '',
        position: detail.position || { top: 200, left: 300 },
      })
    }
    window.addEventListener('openAIChat', handler)
    return () => window.removeEventListener('openAIChat', handler)
  }, [])

  // 加载中
  if (auth.loading && !auth.user) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">BlockOS</div>
      </div>
    )
  }

  // 未登录 → 显示登录页
  if (!auth.isAuthenticated) {
    return (
      <AuthPage
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        loading={auth.loading}
        error={auth.error}
      />
    )
  }

  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''} ${theme === 'newsprint' ? 'theme-newsprint' : ''}`}>
      {!isFullscreen && (
        <>
          <ActivityBar
            activeView={sidebarView}
            onViewChange={handleSidebarViewChange}
            sidebarCollapsed={sidebarCollapsed}
            username={auth.user?.username}
            onSignOut={auth.signOut}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <Sidebar
            activeView={sidebarView}
            collapsed={sidebarCollapsed}
            onSelectToday={selectToday}
            onSelectProject={selectProject}
            onOpenDocument={openDocument}
            currentProjectId={currentProjectId}
            documentId={activeDocumentId || null}
          />
        </>
      )}

      <div className="editor-area" style={{ '--editor-width': isFullscreen ? '100%' : editorWidth } as React.CSSProperties}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={selectTab}
          onCloseTab={closeTab}
          onCloseOtherTabs={closeOtherTabs}
          onCloseTabsToRight={closeTabsToRight}
          onReorderTabs={reorderTabs}
          onNewTab={newTab}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
        <Editor
          onEditorReady={setEditor}
          onTextSelected={setSelectedText}
          documentId={activeDocumentId}
        />
        {aiFloatPanel && (
          <AIFloatPanel
            mode={aiFloatPanel.mode}
            initialContext={aiFloatPanel.contextText}
            position={aiFloatPanel.position}
            onModeChange={mode => setAIFloatPanel(prev => prev ? { ...prev, mode } : null)}
            onInsertContent={handleInsertAIContent}
            onClose={() => setAIFloatPanel(null)}
          />
        )}
      </div>

      {!isFullscreen && (
        <>
          <ResizeHandle
            onResize={setEditorWidth}
            minWidth={minEditorWidth}
            maxWidth={maxEditorWidth}
          />
          <RightPanel
            onInsertContent={handleInsertAIContent}
            selectedText={selectedText}
            onTextSentToAI={() => setSelectedText('')}
          />
        </>
      )}
    </div>
  )
}

export default App
