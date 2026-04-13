import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { BlockSpacePanel } from './BlockSpacePanel'
import { SessionHistoryPanel } from './SessionHistoryPanel'
import { PreviewPanel } from './PreviewPanel'
import { Toast } from '../shared/Toast'
import { generateUUID } from '../../utils/uuid'
import { sendMessage, createImplicitBlockFromAI } from '../../services/aiService'
import { captureMessageAsBlock } from '../../services/blockCaptureService'
import { useSession } from '../../hooks/useSession'
import { useViewport } from '../../hooks/useViewport'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import type { PanelTab } from '../../types/chat'
import './RightPanel.css'

interface RightPanelProps {
  onInsertContent?: (content: string) => void
  selectedText?: string
  onTextSentToAI?: () => void
  onClose?: () => void
}

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''

export function RightPanel({ onInsertContent, selectedText, onTextSentToAI, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempSystemPrompt, setTempSystemPrompt] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const viewport = useViewport()

  // 滑动手势：向右滑动关闭右侧面板
  const swipeHandlers = useSwipeGesture({
    onSwipeRight: () => {
      if ((viewport.isTablet || viewport.isMobile) && onClose) {
        onClose()
      }
    },
  })

  // 监听 openBlockDetail 事件 → 切换到 Block 空间标签
  useEffect(() => {
    const handler = () => { setActiveTab('blocks'); setShowHistory(false) }
    window.addEventListener('openBlockDetail', handler)
    return () => window.removeEventListener('openBlockDetail', handler)
  }, [])

  const {
    currentSession,
    allSessions,
    messages,
    systemPrompt,
    setMessages,
    setSystemPrompt,
    newSession,
    loadSession,
    persistSession,
    refreshSessions,
  } = useSession()

  // 监听选中文字事件
  useEffect(() => {
    const handleSendToAI = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (text) {
        setActiveTab('chat')
        setShowHistory(false)
        setInput(`[上下文]\n${text}\n\n[我的问题]\n`)
        onTextSentToAI?.()
      }
    }
    window.addEventListener('sendToAI', handleSendToAI)
    return () => window.removeEventListener('sendToAI', handleSendToAI)
  }, [onTextSentToAI])

  useEffect(() => {
    if (selectedText?.trim()) {
      // 只填充输入框，不强制切换标签页
      setInput(`[上下文]\n${selectedText}\n\n[我的问题]\n`)
      onTextSentToAI?.()
    }
  }, [selectedText, onTextSentToAI])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
  }

  const insertToEditor = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message?.role === 'assistant' && onInsertContent) {
      onInsertContent(message.editorContent || message.content)
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, insertedToEditor: true } : m))
    }
  }

  const handleDragStart = (e: React.DragEvent, messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return
    const content = message.editorContent || message.content
    e.dataTransfer.setData('text/plain', content)
    e.dataTransfer.setData('application/blockos-ai-content', content)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleCaptureBlock = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return
    const content = message.editorContent || message.content
    const result = await captureMessageAsBlock(messageId, content)
    if (result.success) {
      showToast('Block 捕获成功！', 'success')
      setActiveTab('blocks')
    } else {
      showToast(`Block 捕获失败: ${result.error}`, 'error')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { id: generateUUID(), role: 'user' as const, content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      let assistantId = ''

      const { assistantId: id, fullResponse } = await sendMessage({
        input: userMessage.content,
        history: messages,
        systemPrompt,
        apiKey: MIMO_API_KEY,
        onToken: (aid, reply, editorContent) => {
          if (!assistantId) {
            assistantId = aid
            setMessages(prev => [...prev, { id: aid, role: 'assistant', content: '', insertedToEditor: false }])
          }
          setMessages(prev =>
            prev.map(m => m.id === aid ? { ...m, content: reply, editorContent, insertedToEditor: false } : m)
          )
        },
      })

      // 自动保存 Session
      const finalMessages = [...newMessages, {
        id,
        role: 'assistant' as const,
        content: fullResponse,
        insertedToEditor: false,
      }]
      await persistSession(finalMessages)

      // 创建隐式 Block
      await createImplicitBlockFromAI(id, fullResponse)
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [
        ...prev,
        { id: generateUUID(), role: 'assistant', content: '抱歉，发送消息时出现错误。请检查 API 配置。', insertedToEditor: false },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewSession = async () => {
    await newSession()
    setShowHistory(false)
  }

  const handleLoadSession = (session: typeof currentSession) => {
    loadSession(session)
    setShowHistory(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    // 如果删除的是当前 session，新建一个
    if (sessionId === currentSession.id) {
      newSession()
    }
  }

  return (
    <div 
      className={`right-panel ${viewport.isTablet || viewport.isMobile ? 'expanded' : ''}`}
      {...((viewport.isTablet || viewport.isMobile) ? swipeHandlers : {})}
    >
      {/* 响应式关闭按钮 - 仅在平板/手机模式显示 */}
      {(viewport.isTablet || viewport.isMobile) && onClose && (
        <button className="right-panel-close" onClick={onClose} title="关闭">
          <X size={18} />
        </button>
      )}
      
      <div className="panel-header">
        <div className="panel-tabs">
          {(['chat', 'blocks', 'preview'] as PanelTab[]).map(tab => (
            <button
              key={tab}
              className={`panel-tab ${activeTab === tab && !showHistory ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setShowHistory(false) }}
            >
              {tab === 'chat' ? '对话' : tab === 'blocks' ? 'Block空间' : '预览导出'}
            </button>
          ))}
        </div>

        {/* 对话标签页的操作按钮 */}
        {activeTab === 'chat' && (
          <div className="chat-header-actions">
            <button
              className="icon-button"
              onClick={handleNewSession}
              title="新建对话"
            >
              +
            </button>
            <button
              className={`icon-button ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(v => !v)}
              title="历史对话"
            >
              ☰
            </button>
            <button
              className="icon-button"
              onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(!showSettings) }}
              title="设置"
            >
              ⚙
            </button>
          </div>
        )}
      </div>

      {/* 对话标签页 */}
      {activeTab === 'chat' && (
        showSettings ? (
          <div className="settings-panel">
            <div className="settings-header"><h3>系统提示词设置</h3></div>
            <div className="settings-body">
              <textarea
                className="system-prompt-input"
                value={tempSystemPrompt}
                onChange={e => setTempSystemPrompt(e.target.value)}
                rows={10}
                placeholder="输入系统提示词..."
              />
              <div className="settings-hint">系统提示词会影响 AI 的回复风格和行为</div>
            </div>
            <div className="settings-footer">
              <button className="btn-secondary" onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}>取消</button>
              <button className="btn-primary" onClick={() => { setSystemPrompt(tempSystemPrompt); setShowSettings(false) }}>保存</button>
            </div>
          </div>
        ) : showHistory ? (
          <SessionHistoryPanel
            sessions={allSessions}
            currentSessionId={currentSession.id}
            onSelect={handleLoadSession}
            onDelete={handleDeleteSession}
            onRefresh={refreshSessions}
          />
        ) : (
          <>
            {/* Session 标题栏 */}
            {messages.length > 0 && (
              <div className="session-title-bar">
                <span className="session-title">{currentSession.title}</span>
              </div>
            )}

            <div className="panel-body">
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="panel-placeholder">
                    <div className="placeholder-icon">🤖</div>
                    <div className="placeholder-text">开始与 AI 对话</div>
                    <div className="placeholder-hint">AI 回复可直接写入编辑器或捕获为 Block</div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`message message-${msg.role}`}>
                      <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
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
                            <button className="capture-button" onClick={() => handleCaptureBlock(msg.id)}>
                              ◆ 捕获为Block
                            </button>
                            <span
                              className="drag-handle"
                              draggable
                              onDragStart={e => handleDragStart(e, msg.id)}
                              title="拖拽到编辑器"
                            >
                              ⠿
                            </span>
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
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={3}
              />
              <button className="send-button" onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                {isLoading ? '发送中...' : '发送'}
              </button>
            </div>
          </>
        )
      )}

      {activeTab === 'blocks' && <BlockSpacePanel />}
      {activeTab === 'preview' && <PreviewPanel />}

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
