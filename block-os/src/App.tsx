import { useState } from 'react'
import { Editor as TiptapEditor } from '@tiptap/react'
import { ActivityBar } from './components/ActivityBar'
import { Editor } from './components/Editor'
import { RightPanel } from './components/RightPanel'
import './App.css'

function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')

  const handleInsertAIContent = (content: string) => {
    if (editor) {
      // 使用 insertContent 并让 TipTap 自动解析 Markdown
      // 先在当前位置插入一个新段落，然后插入内容
      editor.chain().focus().insertContent('<p></p>').run()
      
      // 将内容按行处理
      const lines = content.split('\n')
      
      lines.forEach((line) => {
        if (!line.trim()) {
          // 空行插入段落
          editor.chain().insertContent('<p></p>').run()
          return
        }

        // 检测并转换 Markdown 语法
        // 标题
        if (line.match(/^#{1,6}\s/)) {
          const level = line.match(/^(#{1,6})/)?.[1].length || 1
          const text = line.replace(/^#{1,6}\s+/, '')
          editor.chain().insertContent(`<h${level}>${text}</h${level}>`).run()
        }
        // 无序列表
        else if (line.match(/^[-*]\s+/)) {
          const text = line.replace(/^[-*]\s+/, '')
          editor.chain().insertContent(`<ul><li><p>${text}</p></li></ul>`).run()
        }
        // 有序列表
        else if (line.match(/^\d+\.\s+/)) {
          const text = line.replace(/^\d+\.\s+/, '')
          editor.chain().insertContent(`<ol><li><p>${text}</p></li></ol>`).run()
        }
        // 普通段落，处理加粗和斜体
        else {
          let html = line
          // 加粗 **text** 或 __text__
          html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
          // 斜体 *text* 或 _text_
          html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
          html = html.replace(/_(.+?)_/g, '<em>$1</em>')
          // 行内代码 `code`
          html = html.replace(/`(.+?)`/g, '<code>$1</code>')
          
          editor.chain().insertContent(`<p>${html}</p>`).run()
        }
      })
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
