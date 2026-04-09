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
      // 在光标位置插入 AI 生成的内容
      editor.chain().focus().insertContent(content).run()
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
