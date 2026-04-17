import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { ActivityBar } from './components/layout/ActivityBar'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { Editor } from './features/editor'
import { ResizeHandle } from './components/layout/ResizeHandle'
import { RightPanel } from './components/panel/RightPanel'
import { AIFloatPanel } from './features/ai'
import type { AIMode } from './features/ai/components/AIFloatPanel'
import { AuthPage } from './features/auth'
import { SettingsPanel } from './components/panel/SettingsPanel'
import { StatusBar } from './components/layout/StatusBar'
import { PluginWorkspace } from './features/sidebar/plugin-workspace'
import { Toaster } from './components/ui/toaster'
import { ProjectOverview } from './components/project/ProjectOverview'
import { initStorage } from './storage'
import { documentStore } from './storage/documentStore'
import { useAppLayout } from './hooks/useAppLayout'
import { useTabs } from './hooks/useTabs'
import { useAuth } from './features/auth'
import { toast } from './hooks/use-toast'
import { useViewport } from './hooks/useViewport'
import { pluginRegistry } from './services/core/pluginRegistry'
import { PluginAPI } from './services/core/pluginAPI'
import { OCRPlugin } from './plugins/built-in/ocr-plugin'
import { LOCAL_STORAGE_KEYS } from './constants/storage'
import './styles/modules/panels.css'

function App() {
  const editorAreaRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const editorRef = useRef<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState('')
  // 主题功能已禁用，始终使用默认主题
  // const [theme] = useState<string>('default')
  const [showSettings, setShowSettings] = useState(false)
  const [showProjectOverview, setShowProjectOverview] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  const [pendingAIInsert, setPendingAIInsert] = useState<{ documentId: string; content: string } | null>(null)
  const [activePluginWorkspace, setActivePluginWorkspace] = useState<{ pluginId: string; showSettings: boolean } | null>(null)
  const previousViewModeRef = useRef<'ai-focus' | 'hybrid' | null>(null)
  
  // 视图模式：AI 沉浸式 or 混合模式
  const [viewMode, setViewMode] = useState<'ai-focus' | 'hybrid'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW_MODE) as 'ai-focus' | 'hybrid') || 'ai-focus'
  })
  
  // 文档统计状态
  const [wordCount, setWordCount] = useState(0)
  const [blockCount, setBlockCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const viewport = useViewport()

  // 主题切换功能已禁用
  // const toggleTheme = useCallback(() => {
  //   // 不执行任何操作
  // }, [])

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
    setSidebarCollapsed,
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

  const handleSelectProject = useCallback((projectId: string) => {
    // 显示项目概览页面
    setActivePluginWorkspace(null)
    setShowProjectOverview(true)
    selectProject(projectId)
  }, [selectProject])

  const handleOpenProjectFromOverview = useCallback((projectId: string) => {
    // 从项目概览打开项目（关闭概览，切换到项目）
    setShowProjectOverview(false)
    setActivePluginWorkspace(null)
    selectProject(projectId)
  }, [selectProject])

  const handleOpenDocument = useCallback((doc: Parameters<typeof openDocument>[0]) => {
    setShowProjectOverview(false)
    setActivePluginWorkspace(null)
    openDocument(doc)
  }, [openDocument])

  const handleOpenPluginWorkspace = useCallback((pluginId: string, showSettings: boolean) => {
    setShowProjectOverview(false)
    setActivePluginWorkspace({ pluginId, showSettings })
    setSidebarCollapsed(true)
  }, [setSidebarCollapsed])

  const handleCreateProject = useCallback(() => {
    // TODO: 实现新建项目对话框
    console.log('Create new project')
  }, [])

  const switchToHybridMode = useCallback(async (aiContent?: string) => {
    // 创建新文档
    const doc = await documentStore.createDocument('AI 对话笔记', undefined)
    
    // 切换到混合模式
    setViewMode('hybrid')
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, 'hybrid')
    setSidebarCollapsed(true)
    
    // 打开新文档
    handleOpenDocument(doc)
    
    // 记录待插入内容，等目标文档真正加载到编辑器后再写入
    if (aiContent?.trim()) {
      setPendingAIInsert({ documentId: doc.id, content: aiContent })
    }
  }, [handleOpenDocument, setSidebarCollapsed])

  const switchToAIFocus = useCallback(() => {
    // 切换到 AI 沉浸模式
    setViewMode('ai-focus')
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, 'ai-focus')
  }, [])

  // 切换到混合模式时，确保侧边栏默认隐藏
  const exitAIFocus = useCallback(() => {
    setViewMode('hybrid')
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, 'hybrid')
    setSidebarCollapsed(true)
  }, [setSidebarCollapsed])

  useEffect(() => {
    const previousViewMode = previousViewModeRef.current
    if (previousViewMode === 'ai-focus' && viewMode === 'hybrid') {
      setSidebarCollapsed(true)
    }
    previousViewModeRef.current = viewMode
  }, [viewMode, setSidebarCollapsed])

  // 统一初始化所有 Store
  useEffect(() => {
    initStorage()
      .then(() => setStorageReady(true))
      .catch(error => {
        console.error(error)
      })
  }, [])

  // 初始化插件系统
  useEffect(() => {
    if (!storageReady) return
    
    // 创建插件 API 实例
    const pluginAPI = new PluginAPI(
      {
        pluginId: 'system', // 系统级 API
        permissions: [
          'editor:read',
          'editor:write',
          'block:read',
          'block:write',
          'storage:read',
          'storage:write',
          'network',
        ],
      },
      editorRef
    )
    
    // 设置插件 API
    pluginRegistry.setPluginAPI(pluginAPI)
    
    // 注册 OCR 插件
    pluginRegistry.registerPlugin(OCRPlugin)
      .then(() => {
        console.log('[App] OCR Plugin registered successfully')
      })
      .catch(error => {
        console.error('[App] Failed to register OCR Plugin:', error)
      })
  }, [storageReady])

  // 同步 editor 到 editorRef
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

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
      // 点击已激活的视图 → 折叠侧边栏
      setSidebarCollapsed(true)
    } else {
      // 切换到新视图 → 展开侧边栏
      setSidebarView(view)
      setSidebarCollapsed(false)
    }
  }, [sidebarView, sidebarCollapsed, setSidebarView, setSidebarCollapsed])

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
      toast({
        title: '文档已保存',
      })
    } catch (error) {
      console.error('保存失败:', error)
      toast({
        title: '保存失败',
        variant: 'destructive',
      })
      setAutoSaveStatus('unsaved')
    }
  }, [editor, tabs])

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

  useEffect(() => {
    if (!editor || !pendingAIInsert) return
    if (activeDocumentId !== pendingAIInsert.documentId) return

    const lines = pendingAIInsert.content.split('\n').filter(l => l.trim())
    editor.chain().focus().insertContent({
      type: 'sourceBlock',
      attrs: { source: 'ai', sourceLabel: '◆ AI 生成' },
      content: lines.map(line => ({
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      })),
    }).run()

    setPendingAIInsert(null)
  }, [editor, activeDocumentId, pendingAIInsert])

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
  if ((auth.loading && !auth.user) || !storageReady) {
    return (
      <div className="app__loading">
        <div className="app__loading-spinner">BlockOS</div>
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
    <div className={`app ${isFullscreen ? 'app--fullscreen' : ''} ${viewMode === 'ai-focus' ? 'app--ai-focus' : ''}`}>
      {/* AI 沉浸式模式 */}
      {viewMode === 'ai-focus' && (
        <RightPanel
          onInsertContent={handleInsertAIContent}
          selectedText={selectedText}
          onTextSentToAI={() => setSelectedText('')}
          viewMode={viewMode}
          onSwitchToHybrid={switchToHybridMode}
          onClose={exitAIFocus}
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
              />
              <Sidebar
                activeView={sidebarView}
                collapsed={sidebarCollapsed}
                onOpenPlugin={(pluginId) => handleOpenPluginWorkspace(pluginId, false)}
                onOpenPluginSettings={(pluginId) => handleOpenPluginWorkspace(pluginId, true)}
                onSelectToday={selectToday}
                onSelectProject={handleSelectProject}
                onOpenDocument={handleOpenDocument}
                currentProjectId={currentProjectId}
                documentId={activeDocumentId || null}
                onClose={() => viewport.isTablet && toggleSidebar()}
              />
            </>
          )}

          <div className="editor-area" ref={editorAreaRef}>
            {showProjectOverview ? (
              /* 项目概览页面 */
              <ProjectOverview
                onSelectProject={handleOpenProjectFromOverview}
                onCreateProject={handleCreateProject}
              />
            ) : activePluginWorkspace ? (
              <PluginWorkspace
                pluginId={activePluginWorkspace.pluginId}
                showSettings={activePluginWorkspace.showSettings}
                onClose={() => setActivePluginWorkspace(null)}
                onToggleSettings={() => {
                  setActivePluginWorkspace((prev) => {
                    if (!prev) {
                      return prev
                    }

                    return {
                      ...prev,
                      showSettings: !prev.showSettings,
                    }
                  })
                }}
              />
            ) : (
              /* 编辑器视图 */
              <>
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
              </>
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
                viewMode={viewMode}
                onSwitchToHybrid={switchToHybridMode}
                onSwitchToAIFocus={switchToAIFocus}
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
      <Toaster />
    </div>
  )
}

export default App
