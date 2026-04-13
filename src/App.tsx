import { useState, useEffect, useCallback, useRef } from 'react'
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
import { SettingsPanel } from './components/panel/SettingsPanel'
import { StatusBar } from './components/layout/StatusBar'
import { Toast } from './components/shared/Toast'
import { initStorage } from './storage'
import { documentStore } from './storage/documentStore'
import { useAppLayout } from './hooks/useAppLayout'
import { useTabs } from './hooks/useTabs'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'
import { useViewport } from './hooks/useViewport'
import './App.css'

function App() {
  const editorAreaRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('blockos-theme') || 'default')
  const [showSettings, setShowSettings] = useState(false)
  
  // 视图模式：AI 沉浸式 or 混合模式
  const [viewMode, setViewMode] = useState<'ai-focus' | 'hybrid'>(() => {
    return (localStorage.getItem('blockos-view-mode') as 'ai-focus' | 'hybrid') || 'ai-focus'
  })
  
  // 文档统计状态
  const [wordCount, setWordCount] = useState(0)
  const [blockCount, setBlockCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const { toasts, showToast, removeToast } = useToast()
  const viewport = useViewport()

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'default' ? 'newsprint' : 'default'
      localStorage.setItem('blockos-theme', next)
      return next
    })
  }, [])

  const switchToHybridMode = useCallback(() => {
    setViewMode('hybrid')
    localStorage.setItem('blockos-view-mode', 'hybrid')
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

  // 管理编辑器区域宽度样式
  useEffect(() => {
    if (editorAreaRef.current) {
      const width = isFullscreen ? '100%' : `${editorWidth}px`
      editorAreaRef.current.style.setProperty('--editor-width', width)
    }
  }, [isFullscreen, editorWidth])

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

  // 保存文档
  const handleSaveDocument = useCallback(async (tabId: string) => {
    if (!editor) return
    
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || !tab.documentId) return
    
    setAutoSaveStatus('saving')
    try {
      await documentStore.updateDocumentBlocks(tab.documentId, editor.getJSON())
      setAutoSaveStatus('saved')
      setLastSaved(new Date())
      showToast('文档已保存', 'success')
    } catch (error) {
      console.error('保存失败:', error)
      showToast('保存失败', 'error')
      setAutoSaveStatus('unsaved')
    }
  }, [editor, tabs, showToast])

  // 监听编辑器内容变化，更新统计信息
  useEffect(() => {
    if (!editor) return
    
    const updateStats = () => {
      const text = editor.getText()
      const words = text.replace(/\s+/g, '').length // 中文字数
      setWordCount(words)
      
      // 统计 SourceBlock 数量
      let blocks = 0
      let links = 0
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'sourceBlock') blocks++
        if (node.type.name === 'blockLink') links++
      })
      setBlockCount(blocks)
      setLinkCount(links)
      
      // 标记为未保存
      if (autoSaveStatus === 'saved') {
        setAutoSaveStatus('unsaved')
      }
    }
    
    editor.on('update', updateStats)
    updateStats() // 初始统计
    
    return () => {
      editor.off('update', updateStats)
    }
  }, [editor, autoSaveStatus])

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
        isPullingData={auth.isPullingData}
      />
    )
  }

  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''} ${theme === 'newsprint' ? 'theme-newsprint' : ''} ${viewMode === 'ai-focus' ? 'app-ai-focus' : ''}`}>
      {/* AI 沉浸式模式 */}
      {viewMode === 'ai-focus' && (
        <RightPanel
          onInsertContent={handleInsertAIContent}
          selectedText={selectedText}
          onTextSentToAI={() => setSelectedText('')}
          viewMode={viewMode}
          onSwitchToHybrid={switchToHybridMode}
        />
      )}
      
      {/* 混合模式 */}
      {viewMode === 'hybrid' && (
        <>
          {!isFullscreen && (
            <>
              <ActivityBar
                activeView={sidebarView}
                onViewChange={handleSidebarViewChange}
                sidebarCollapsed={sidebarCollapsed}
                username={auth.user?.username}
                onSignOut={auth.signOut}
                onOpenSettings={() => setShowSettings(true)}
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
                onClose={() => viewport.isTablet && toggleSidebar()}
              />
            </>
          )}

          <div className="editor-area" ref={editorAreaRef}>
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
              onSaveTab={handleSaveDocument}
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
            
            {/* 底部状态栏 */}
            <StatusBar
              wordCount={wordCount}
              blockCount={blockCount}
              linkCount={linkCount}
              autoSaveStatus={autoSaveStatus}
              lastSaved={lastSaved}
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
                viewMode={viewMode}
                onSwitchToHybrid={switchToHybridMode}
              />
            </>
          )}
        </>
      )}

      {showSettings && auth.user && (
        <SettingsPanel
          username={auth.user.username}
          userId={auth.user.id}
          onClose={() => setShowSettings(false)}
          onSignOut={() => {
            setShowSettings(false)
            auth.signOut()
          }}
        />
      )}
      
      {/* Toast 通知 */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default App
