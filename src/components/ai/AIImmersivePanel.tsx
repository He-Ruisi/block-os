import { useState } from 'react'
import { useAIChat } from '../../hooks/useAIChat'
import { ChatLayout } from './ChatLayout'
import { ChatHeader } from './ChatHeader'
import { MessageContent } from './MessageContent'
import { ChatInput } from './ChatInput'

interface AIImmersivePanelProps {
  onClose?: () => void
  onInsertContent?: (content: string) => void
}

export function AIImmersivePanel({ onClose, onInsertContent }: AIImmersivePanelProps) {
  const { messages, isLoading, input, setInput, handleSend, handleNewSession, insertToEditor } = useAIChat()
  const [showDeepThink] = useState(true)
  const [showSearch] = useState(true)

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    await handleSend()
  }

  const handleInsertToEditor = (messageId: string) => {
    insertToEditor(messageId, onInsertContent)
  }

  const handleCapture = (messageId: string) => {
    // TODO: 实现捕获为 Block 的逻辑
    console.log('Capture message:', messageId)
  }

  const handleDrag = (messageId: string) => {
    // TODO: 实现拖拽逻辑
    console.log('Drag message:', messageId)
  }

  return (
    <ChatLayout
      header={
        <ChatHeader
          title="AI 助手"
          subtitle={`${messages.length} 条消息`}
          onToggleSidebar={onClose}
          onNewChat={handleNewSession}
          onShare={() => console.log('Share')}
        />
      }
      content={
        <MessageContent
          messages={messages}
          isLoading={isLoading}
          onInsertToEditor={handleInsertToEditor}
          onCapture={handleCapture}
          onDrag={handleDrag}
        />
      }
      input={
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="输入消息..."
          showDeepThink={showDeepThink}
          showSearch={showSearch}
        />
      }
    />
  )
}
