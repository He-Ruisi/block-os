import { useState, useEffect, useCallback } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { Editor } from './components/editor/Editor'
import { ResizeHandle } from './components/layout/ResizeHandle'
import { RightPanel } from './components/panel/RightPanel'
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
    isFullscreen,
    editorWidth,
    toggleSidebar,
    toggleFullscreen,
    setEditorWidth,
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
      // 输入框内不触发
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 't') {
        e.preventDefault()
        newTab()
      } else if (e.key === 'w') {
        // 只有多于1个标签页时才拦截，避免关闭浏览器窗口
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
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onSelectToday={selectToday}
          onSelectProject={selectProject}
          onOpenDocument={openDocument}
          currentProjectId={currentProjectId}
          username={auth.user?.username}
          onSignOut={auth.signOut}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <div className="editor-area" style={{ width: isFullscreen ? '100%' : editorWidth }}>
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
