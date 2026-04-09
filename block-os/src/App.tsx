import { useState, useEffect } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { Sidebar } from './components/Sidebar'
import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { ResizeHandle } from './components/ResizeHandle'
import { RightPanel } from './components/RightPanel'
import { blockStore } from './lib/blockStore'
import { projectStore, Tab } from './lib/projectStore'
import './App.css'

function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  
  // 侧边栏状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // 标签页状态
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'today',
      type: 'today',
      title: '今日',
      isDirty: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('today')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>('today')
  
  // 布局状态
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorWidth, setEditorWidth] = useState(0)

  // 初始化
  useEffect(() => {
    blockStore.init().catch(console.error)
    projectStore.init().catch(console.error)
    
    // 计算初始编辑器宽度（60%）
    const calculateEditorWidth = () => {
      const windowWidth = window.innerWidth
      const sidebarWidth = sidebarCollapsed ? 60 : 240
      return (windowWidth - sidebarWidth) * 0.6
    }
    
    setEditorWidth(calculateEditorWidth())
    
    // 监听窗口大小变化
    const handleResize = () => {
      setEditorWidth(calculateEditorWidth())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed])

  // 处理侧边栏切换
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // 处理选择今日
  const handleSelectToday = () => {
    setCurrentProjectId('today')
    
    // 检查是否已有今日标签页
    const todayTab = tabs.find(t => t.type === 'today')
    if (todayTab) {
      setActiveTabId(todayTab.id)
    } else {
      const newTab: Tab = {
        id: 'today-' + Date.now(),
        type: 'today',
        title: '今日',
        isDirty: false
      }
      setTabs([...tabs, newTab])
      setActiveTabId(newTab.id)
    }
  }

  // 处理选择项目
  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId)
    
    // 检查是否已有该项目的标签页
    const projectTab = tabs.find(t => t.projectId === projectId)
    if (projectTab) {
      setActiveTabId(projectTab.id)
    } else {
      // 创建新标签页
      projectStore.getProject(projectId).then(project => {
        if (project) {
          const newTab: Tab = {
            id: 'project-' + projectId,
            type: 'project',
            projectId: projectId,
            title: project.name,
            isDirty: false
          }
          setTabs([...tabs, newTab])
          setActiveTabId(newTab.id)
        }
      })
    }
  }

  // 处理关闭标签页
  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId)
    
    // 如果关闭的是当前标签页，切换到前一个
    if (tabId === activeTabId && newTabs.length > 0) {
      const closedIndex = tabs.findIndex(t => t.id === tabId)
      const newActiveIndex = Math.max(0, closedIndex - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
    }
    
    setTabs(newTabs)
  }

  // 处理新建标签页
  const handleNewTab = () => {
    const newTab: Tab = {
      id: 'new-' + Date.now(),
      type: 'document',
      title: '新文档',
      isDirty: false
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  // 处理全屏切换
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 处理编辑器宽度调整
  const handleEditorResize = (width: number) => {
    setEditorWidth(width)
  }

  const handleInsertAIContent = (content: string) => {
    if (editor) {
      // 简化方案：直接插入 HTML，让 TipTap 处理
      // 不要逐行插入，而是一次性转换整个内容
      
      const lines = content.split('\n')
      const htmlParts: string[] = []
      
      let inList = false
      let listType = ''
      let listItems: string[] = []
      
      const flushList = () => {
        if (inList && listItems.length > 0) {
          const items = listItems.map(item => `<li><p>${item}</p></li>`).join('')
          htmlParts.push(listType === 'ul' ? `<ul>${items}</ul>` : `<ol>${items}</ol>`)
          listItems = []
          inList = false
        }
      }
      
      lines.forEach((line) => {
        if (!line.trim()) {
          flushList()
          htmlParts.push('<p></p>')
          return
        }

        // 标题
        if (line.match(/^#{1,6}\s/)) {
          flushList()
          const level = line.match(/^(#{1,6})/)?.[1].length || 1
          const text = line.replace(/^#{1,6}\s+/, '')
          htmlParts.push(`<h${level}>${text}</h${level}>`)
        }
        // 无序列表
        else if (line.match(/^[-*]\s+/)) {
          const text = line.replace(/^[-*]\s+/, '')
          if (!inList || listType !== 'ul') {
            flushList()
            inList = true
            listType = 'ul'
          }
          listItems.push(text)
        }
        // 有序列表
        else if (line.match(/^\d+\.\s+/)) {
          const text = line.replace(/^\d+\.\s+/, '')
          if (!inList || listType !== 'ol') {
            flushList()
            inList = true
            listType = 'ol'
          }
          listItems.push(text)
        }
        // 普通段落
        else {
          flushList()
          let html = line
          // 加粗 **text**
          html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          // 斜体 *text* (但不匹配 **)
          html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
          // 行内代码 `code`
          html = html.replace(/`(.+?)`/g, '<code>$1</code>')
          
          htmlParts.push(`<p>${html}</p>`)
        }
      })
      
      // 处理最后的列表
      flushList()
      
      // 一次性插入所有内容
      const finalHtml = htmlParts.join('')
      editor.chain().focus().insertContent(finalHtml).run()
    }
  }

  const handleTextSelected = (text: string) => {
    setSelectedText(text)
  }

  const handleTextSentToAI = () => {
    // 清空选中文字状态
    setSelectedText('')
  }

  // 计算最小/最大宽度
  const windowWidth = window.innerWidth
  const sidebarWidth = sidebarCollapsed ? 60 : 240
  const availableWidth = windowWidth - sidebarWidth
  const minEditorWidth = 400
  const maxEditorWidth = availableWidth * 0.8

  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          onSelectToday={handleSelectToday}
          onSelectProject={handleSelectProject}
          currentProjectId={currentProjectId}
        />
      )}
      
      <div className="editor-area" style={{ width: isFullscreen ? '100%' : editorWidth }}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
        <Editor 
          onEditorReady={setEditor}
          onTextSelected={handleTextSelected}
        />
      </div>

      {!isFullscreen && (
        <>
          <ResizeHandle
            onResize={handleEditorResize}
            minWidth={minEditorWidth}
            maxWidth={maxEditorWidth}
          />
          <RightPanel 
            onInsertContent={handleInsertAIContent}
            selectedText={selectedText}
            onTextSentToAI={handleTextSentToAI}
          />
        </>
      )}
    </div>
  )
}

export default App
