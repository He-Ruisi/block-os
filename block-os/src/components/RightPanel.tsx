import { useState, useRef, useEffect } from 'react'
import './RightPanel.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
  insertedToEditor?: boolean
}

interface RightPanelProps {
  onInsertContent?: (content: string) => void
}

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''
const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions'

export function RightPanel({ onInsertContent }: RightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const insertToEditor = (messageIndex: number) => {
    const message = messages[messageIndex]
    if (message.role === 'assistant' && onInsertContent) {
      onInsertContent(message.content)
      
      // 标记为已插入
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[messageIndex] = { ...message, insertedToEditor: true }
        return newMessages
      })
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(MIMO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MIMO_API_KEY,
        },
        body: JSON.stringify({
          model: 'mimo-v2-flash',
          messages: [
            {
              role: 'system',
              content: '你是MiMo，是小米公司研发的AI智能助手。今天的日期：2026-04-09，你的知识截止日期是2024年12月。'
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          temperature: 0.8,
          top_p: 0.95,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '', insertedToEditor: false }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, '')
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              assistantMessage += content
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                  insertedToEditor: false
                }
                return newMessages
              })
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发送消息时出现错误。请检查 API 配置。',
        insertedToEditor: false
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="right-panel">
      <div className="panel-header">
        <span className="panel-title">AI 副驾驶</span>
        <span className="panel-badge">MiMo</span>
      </div>
      
      <div className="panel-body">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="panel-placeholder">
              <div className="placeholder-icon">🤖</div>
              <div className="placeholder-text">开始与 AI 对话</div>
              <div className="placeholder-hint">
                AI 回复可直接写入编辑器
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-wrapper">
                  <div className="message-content">{msg.content}</div>
                  {msg.role === 'assistant' && msg.content && (
                    <button
                      className={`insert-button ${msg.insertedToEditor ? 'inserted' : ''}`}
                      onClick={() => insertToEditor(idx)}
                      disabled={msg.insertedToEditor}
                    >
                      {msg.insertedToEditor ? '✓ 已写入编辑器' : '↗ 写入编辑器'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="panel-footer">
        <textarea
          className="chat-input"
          placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  )
}
