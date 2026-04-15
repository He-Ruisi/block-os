import { useRef, useEffect } from 'react'
import type { Message } from '../../types/chat'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'
import './MessageContent.css'

interface MessageContentProps {
  messages: Message[]
  isLoading?: boolean
  onInsertToEditor?: (messageId: string) => void
  onCapture?: (messageId: string) => void
  onDrag?: (messageId: string) => void
}

export function MessageContent({
  messages,
  isLoading,
  onInsertToEditor,
  onCapture,
  onDrag,
}: MessageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="message-content">
      <div className="message-content__inner">
        {messages.map(msg => (
          <div key={msg.id} className={`message-content__item message-content__item--${msg.role}`}>
            <div className="message-content__text">
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'assistant' && msg.editorContent && (
              <div className="message-content__editor-preview">
                <div className="message-content__editor-label">编辑器内容</div>
                <div className="message-content__editor-markdown">
                  <MarkdownRenderer content={msg.editorContent} />
                </div>
              </div>
            )}
            {msg.role === 'assistant' && (
              <div className="message-content__toolbar">
                <button
                  className={`message-content__toolbar-btn message-content__toolbar-btn--primary ${msg.insertedToEditor ? 'is-inserted' : ''}`}
                  onClick={() => onInsertToEditor?.(msg.id)}
                  disabled={msg.insertedToEditor}
                  title="写入编辑器"
                >
                  {msg.insertedToEditor ? '已写入编辑器' : '写入编辑器'}
                </button>
                <button
                  className="message-content__toolbar-btn"
                  onClick={() => onCapture?.(msg.id)}
                  title="捕获为 Block"
                >
                  捕获
                </button>
                <button
                  className="message-content__toolbar-btn"
                  onClick={() => onDrag?.(msg.id)}
                  title="拖拽"
                >
                  拖拽
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="message-content__item message-content__item--assistant message-content__item--streaming">
            <span className="message-content__cursor" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
