import { useState, useRef, useEffect } from 'react'
import { BlockCaptureDialog } from './BlockCaptureDialog'
import { BlockSpacePanel } from './BlockSpacePanel'
import { blockStore, generateUUID, Block } from '../lib/blockStore'
import './RightPanel.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  editorContent?: string
  insertedToEditor?: boolean
}

interface RightPanelProps {
  onInsertContent?: (content: string) => void
}

type PanelTab = 'chat' | 'blocks' | 'session'

const DEFAULT_SYSTEM_PROMPT = '你是MiMo，是小米公司研发的AI智能助手。今天的日期：2026-04-09，你的知识截止日期是2024年12月。'

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''
const MIMO_API_URL = 'https://api.xiaomimimo.com/v1/chat/completions'

export function RightPanel({ onInsertContent }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [tempSystemPrompt, setTempSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  
  // Block 捕获相关
  const [showCaptureDialog, setShowCaptureDialog] = useState(false)
  const [captureContent, setCaptureContent] = useState('')
  const [captureMessageId, setCaptureMessageId] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 初始化 IndexedDB
  useEffect(() => {
    blockStore.init().catch(console.error)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const insertToEditor = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message?.role === 'assistant' && onInsertContent) {
      const contentToInsert = message.editorContent || message.content
      onInsertContent(contentToInsert)
      
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, insertedToEditor: true } : m)
      )
    }
  }

  // 打开捕获对话框
  const openCaptureDialog = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message?.role === 'assistant') {
      const content = message.editorContent || message.content
      setCaptureContent(content)
      setCaptureMessageId(messageId)
      setShowCaptureDialog(true)
    }
  }

  // 捕获 Block
  const handleCaptureBlock = async (title: string, tags: string[]) => {
    try {
      const block: Block = {
        id: generateUUID(),
        content: captureContent,
        type: 'ai-generated',
        source: {
          type: 'ai',
          aiMessageId: captureMessageId,
          capturedAt: new Date()
        },
        metadata: {
          title: title || undefined,
          tags,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      await blockStore.saveBlock(block)
      setShowCaptureDialog(false)
      
      // 切换到 Block 空间标签页
      setActiveTab('blocks')
    } catch (error) {
      console.error('Failed to capture block:', error)
    }
  }

  const parseAIResponse = (fullResponse: string): { reply: string; editorContent?: string } => {
    try {
      const parsed = JSON.parse(fullResponse)
      if (parsed.reply && parsed.content) {
        return { reply: parsed.reply, editorContent: parsed.content }
      }
    } catch (e) {
      // Not JSON
    }

    const separators = ['---CONTENT---', '【写入内容】', '[CONTENT]']
    for (const sep of separators) {
      if (fullResponse.includes(sep)) {
        const parts = fullResponse.split(sep)
        return {
          reply: parts[0].trim(),
          editorContent: parts[1].trim()
        }
      }
    }

    return { reply: fullResponse }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { 
      id: generateUUID(),
      role: 'user', 
      content: input.trim() 
    }
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
              content: systemPrompt + '\n\n如果用户需要写入编辑器的内容，请用以下格式回复：\n简短回复用户\n---CONTENT---\n要写入编辑器的内容'
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
      const assistantId = generateUUID()

      setMessages(prev => [...prev, { 
        id: assistantId,
        role: 'assistant', 
        content: '', 
        insertedToEditor: false 
      }])

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
              const { reply, editorContent } = parseAIResponse(assistantMessage)
              
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? {
                  ...m,
                  content: reply,
                  editorContent: editorContent,
                  insertedToEditor: false
                } : m)
              )
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, {
        id: generateUUID(),
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

  const handleSaveSettings = () => {
    setSystemPrompt(tempSystemPrompt)
    setShowSettings(false)
  }

  const handleCancelSettings = () => {
    setTempSystemPrompt(systemPrompt)
    setShowSettings(false)
  }

  return (
    <div className="right-panel">
      <div className="panel-header">
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            对话
          </button>
          <button
            className={`panel-tab ${activeTab === 'blocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocks')}
          >
            Block空间
          </button>
          <button
            className={`panel-tab ${activeTab === 'session' ? 'active' : ''}`}
            onClick={() => setActiveTab('session')}
            disabled
          >
            Session
          </button>
        </div>
        {activeTab === 'chat' && (
          <button 
            className="settings-button"
            onClick={() => {
              setTempSystemPrompt(systemPrompt)
              setShowSettings(!showSettings)
            }}
            title="设置"
          >
            ⚙
          </button>
        )}
      </div>

      {activeTab === 'chat' && (
        showSettings ? (
          <div className="settings-panel">
            <div className="settings-header">
              <h3>系统提示词设置</h3>
            </div>
            <div className="settings-body">
              <textarea
                className="system-prompt-input"
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                rows={10}
                placeholder="输入系统提示词..."
              />
              <div className="settings-hint">
                系统提示词会影响 AI 的回复风格和行为
              </div>
            </div>
            <div className="settings-footer">
              <button className="btn-secondary" onClick={handleCancelSettings}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSaveSettings}>
                保存
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="panel-body">
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="panel-placeholder">
                    <div className="placeholder-icon">🤖</div>
                    <div className="placeholder-text">开始与 AI 对话</div>
                    <div className="placeholder-hint">
                      AI 回复可直接写入编辑器或捕获为 Block
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`message message-${msg.role}`}>
                      <div className="message-avatar">
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="message-wrapper">
                        <div className="message-content">{msg.content}</div>
                        {msg.role === 'assistant' && msg.editorContent && (
                          <div className="editor-content-preview">
                            <div className="preview-label">📝 编辑器内容预览</div>
                            <div className="preview-text">{msg.editorContent}</div>
                          </div>
                        )}
                        {msg.role === 'assistant' && msg.content && (
                          <div className="message-actions">
                            <button
                              className={`insert-button ${msg.insertedToEditor ? 'inserted' : ''}`}
                              onClick={() => insertToEditor(msg.id)}
                              disabled={msg.insertedToEditor}
                            >
                              {msg.insertedToEditor ? '✓ 已写入编辑器' : '↗ 写入编辑器'}
                            </button>
                            <button
                              className="capture-button"
                              onClick={() => openCaptureDialog(msg.id)}
                            >
                              ◆ 捕获为Block
                            </button>
                          </div>
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
          </>
        )
      )}

      {activeTab === 'blocks' && <BlockSpacePanel />}

      {activeTab === 'session' && (
        <div className="panel-body">
          <div className="panel-placeholder">
            <div className="placeholder-icon">📅</div>
            <div className="placeholder-text">Session 功能</div>
            <div className="placeholder-hint">即将推出</div>
          </div>
        </div>
      )}

      {showCaptureDialog && (
        <BlockCaptureDialog
          content={captureContent}
          onCapture={handleCaptureBlock}
          onCancel={() => setShowCaptureDialog(false)}
        />
      )}
    </div>
  )
}
