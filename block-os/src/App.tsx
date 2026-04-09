import { useState, useEffect } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { ActivityBar } from './components/ActivityBar'
import { Editor } from './components/Editor'
import { RightPanel } from './components/RightPanel'
import { blockStore } from './lib/blockStore'
import './App.css'

function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')

  // 初始化 blockStore
  useEffect(() => {
    blockStore.init().catch(error => {
      console.error('Failed to initialize blockStore:', error)
    })
  }, [])

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

  return (
    <div className="app">
      <ActivityBar />
      <Editor 
        onEditorReady={setEditor}
        onTextSelected={handleTextSelected}
      />
      <RightPanel 
        onInsertContent={handleInsertAIContent}
        selectedText={selectedText}
        onTextSentToAI={handleTextSentToAI}
      />
    </div>
  )
}

export default App
