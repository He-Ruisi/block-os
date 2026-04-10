import { useState, useEffect } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { Sidebar } from './components/layout/Sidebar'
import { TabBar } from './components/layout/TabBar'
import { Editor } from './components/editor/Editor'
import { ResizeHandle } from './components/layout/ResizeHandle'
import { RightPanel } from './components/panel/RightPanel'
import { initStorage } from './storage'
import { markdownToHtml } from './utils/markdown'
import { useAppLayout } from './hooks/useAppLayout'
import { useTabs } from './hooks/useTabs'
import './App.css'

function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState('')

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
    selectToday,
    selectProject,
    newTab,
  } = useTabs()

  // 统一初始化所有 Store
  useEffect(() => {
    initStorage().catch(console.error)
  }, [])

  const handleInsertAIContent = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(markdownToHtml(content)).run()
    }
  }

  const activeDocumentId = tabs.find(t => t.id === activeTabId)?.documentId

  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onSelectToday={selectToday}
          onSelectProject={selectProject}
          currentProjectId={currentProjectId}
        />
      )}

      <div className="editor-area" style={{ width: isFullscreen ? '100%' : editorWidth }}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={selectTab}
          onCloseTab={closeTab}
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
