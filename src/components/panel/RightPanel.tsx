import { useState, useRef, useEffect } from 'react'
import { X, Maximize2, ChevronDown } from 'lucide-react'
import { BlockSpacePanel } from './BlockSpacePanel'
import { SessionHistoryPanel } from './SessionHistoryPanel'
import { PreviewPanel } from './PreviewPanel'
import { Toast } from '../shared/Toast'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'
import { AIImmersivePanel } from '../ai/AIImmersivePanel'
import { generateUUID } from '../../utils/uuid'
import { 
  sendMessage, 
  createImplicitBlockFromAI,
  getCurrentProvider,
  setCurrentProvider,
  getCurrentModel,
  setCurrentModel,
  getProviderConfig,
  getProviderApiKey,
  type AIProvider,
} from '../../services/aiService'
import { captureMessageAsBlock } from '../../services/blockCaptureService'
import { useSession } from '../../hooks/useSession'
import { useViewport } from '../../hooks/useViewport'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import type { PanelTab } from '../../types/chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface RightPanelProps {
  onInsertContent?: (content: string) => void
  selectedText?: string
  onTextSentToAI?: () => void
  onClose?: () => void
  viewMode?: 'ai-focus' | 'hybrid'
  onSwitchToHybrid?: (content?: string) => void
  onSwitchToAIFocus?: () => void
}

export function RightPanel({ onInsertContent, selectedText, onTextSentToAI, onClose, viewMode = 'hybrid', onSwitchToHybrid, onSwitchToAIFocus }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [expandedSettingsSection, setExpandedSettingsSection] = useState<'model' | 'prompt' | 'reasoning' | 'provider' | 'context'>('model')
  const [tempSystemPrompt, setTempSystemPrompt] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [aiProvider, setAIProvider] = useState<AIProvider>(getCurrentProvider())
  const [aiModel, setAIModel] = useState<string>(getCurrentModel())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const viewport = useViewport()
  
  const isAIFocusMode = viewMode === 'ai-focus'

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
  
  const hasMessages = messages.length > 0

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
    if (message?.role === 'assistant') {
      const content = message.editorContent || message.content
      
      // AI 模式下点击写入编辑器，切换到混合模式并传递内容
      if (isAIFocusMode && onSwitchToHybrid) {
        onSwitchToHybrid(content)
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, insertedToEditor: true } : m))
      } else if (onInsertContent) {
        // 混合模式下直接插入到当前编辑器
        onInsertContent(content)
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, insertedToEditor: true } : m))
      }
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
      const apiKey = getProviderApiKey(aiProvider)

      if (!apiKey) {
        throw new Error(`请配置 ${getProviderConfig(aiProvider).name} API Key`)
      }

      const { assistantId: id, fullResponse } = await sendMessage({
        input: userMessage.content,
        history: messages,
        systemPrompt,
        apiKey,
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
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      setMessages(prev => [
        ...prev,
        { id: generateUUID(), role: 'assistant', content: `抱歉，发送消息时出现错误：${errorMsg}`, insertedToEditor: false },
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

  const hasApiKey = Boolean(getProviderApiKey(aiProvider))

  const getModelLabel = (model: string) => {
    if (model === 'deepseek-chat') return 'deepseek-chat (Fast)'
    if (model === 'deepseek-reasoner') return 'deepseek-reasoner (Reasoning)'
    if (model === 'mimo-v2-flash') return 'MiMo Flash'
    return model
  }

  return (
    <div 
      className={cn(
        "flex flex-col border-l border-border bg-background h-screen overflow-hidden flex-1 min-w-[280px] max-w-[480px]",
        (viewport.isTablet || viewport.isMobile) && "expanded",
        isAIFocusMode && "border-l-0 max-w-none w-full"
      )}
      {...((viewport.isTablet || viewport.isMobile) ? swipeHandlers : {})}
    >
      {/* 响应式关闭按钮 - 仅在平板/手机模式显示 */}
      {(viewport.isTablet || viewport.isMobile) && onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8"
          onClick={onClose}
          title="关闭"
        >
          <X size={18} />
        </Button>
      )}
      
      {/* AI 沉浸式模式 - 初始状态 */}
      {isAIFocusMode && !hasMessages && (
        <div className="flex flex-1 items-center justify-center p-10 bg-background">
          <div className="flex w-full max-w-[800px] flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl leading-none">🤖</span>
              <h1 className="m-0 text-4xl font-semibold tracking-tight text-foreground">下午好</h1>
            </div>
            
            <div className="flex w-full flex-col gap-3">
              <Textarea
                className="w-full resize-none rounded-lg border-2 border-border bg-background px-6 py-5 text-lg leading-relaxed text-foreground shadow-sm outline-none transition-all focus:border-purple-600 focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How can I help you today?"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={4}
              />
              <div className="flex items-center justify-between px-1">
                <div className="text-sm font-medium text-muted-foreground">
                  {getProviderConfig(aiProvider).name} · {aiModel}
                </div>
                <Button
                  className="rounded-md bg-purple-600 px-8 py-3 text-base font-medium text-white transition-all hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? '发送中...' : '发送'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI 沉浸式模式 - 对话状态（使用新的沉浸式面板） */}
      {isAIFocusMode && hasMessages && (
        <AIImmersivePanel
          onClose={onClose}
          messages={messages}
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          onNewSession={handleNewSession}
          onInsertToEditor={insertToEditor}
          currentSession={currentSession}
          allSessions={allSessions}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          loadSession={handleLoadSession}
          refreshSessions={refreshSessions}
          onDeleteSession={handleDeleteSession}
          aiProvider={aiProvider}
          setAIProvider={setAIProvider}
          aiModel={aiModel}
          setAIModel={setAIModel}
        />
      )}
      
      {/* 混合模式 */}
      {!isAIFocusMode && (
        <>
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-border bg-secondary px-3.5 py-2.5">
        <div className="flex flex-1 gap-1">
          {(['chat', 'blocks', 'preview'] as PanelTab[]).map(tab => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-background hover:text-foreground",
                activeTab === tab && !showHistory && "bg-background text-foreground"
              )}
              onClick={() => { setActiveTab(tab); setShowHistory(false) }}
            >
              {tab === 'chat' ? '对话' : tab === 'blocks' ? 'Block空间' : '预览导出'}
            </Button>
          ))}
        </div>

        {/* 对话标签页的操作按钮 */}
        {activeTab === 'chat' && (
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground transition-all hover:bg-background hover:text-foreground"
              onClick={onSwitchToAIFocus}
              title="全屏模式"
            >
              <Maximize2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground transition-all hover:bg-background hover:text-foreground"
              onClick={handleNewSession}
              title="新建对话"
            >
              <span className="text-base leading-none">+</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-muted-foreground transition-all hover:bg-background hover:text-foreground",
                showHistory && "bg-background text-purple-600"
              )}
              onClick={() => setShowHistory(v => !v)}
              title="历史对话"
            >
              <span className="text-base leading-none">☰</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground transition-all hover:bg-background hover:text-foreground"
              onClick={() => {
                setTempSystemPrompt(systemPrompt)
                setExpandedSettingsSection('model')
                setShowSettings(!showSettings)
              }}
              title="设置"
            >
              <span className="text-base leading-none">⚙</span>
            </Button>
          </div>
        )}
      </div>

      {/* 对话标签页 */}
      {activeTab === 'chat' && (
        showSettings ? (
          <div className="settings-panel">
            <div className="settings-header">
              <h3 className="settings-title">运行设置</h3>
              <button className="settings-close-btn" onClick={() => setShowSettings(false)} title="关闭">
                ✕
              </button>
            </div>
            
            <div className="settings-body">
              <div
                className={`settings-card ${expandedSettingsSection === 'model' ? 'expanded' : ''}`}
              >
                <button className="settings-card-summary" onClick={() => setExpandedSettingsSection('model')} type="button">
                  <div className="settings-card-copy">
                    <span className="settings-card-title">Model</span>
                    <span className="settings-card-description">{getProviderConfig(aiProvider).name} · {getModelLabel(aiModel)}</span>
                  </div>
                  <ChevronDown size={16} className="settings-card-chevron" />
                </button>
                {expandedSettingsSection === 'model' && (
                  <div className="settings-card-detail" onClick={e => e.stopPropagation()}>
                    <label className="settings-label">Select model</label>
                    <select
                      className="settings-select settings-select-large"
                      value={aiModel}
                      onChange={e => {
                        setAIModel(e.target.value)
                        setCurrentModel(e.target.value)
                      }}
                    >
                      {getProviderConfig(aiProvider).supportedModels.map(model => (
                        <option key={model} value={model}>
                          {getModelLabel(model)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div
                className={`settings-card ${expandedSettingsSection === 'prompt' ? 'expanded' : ''}`}
              >
                <button className="settings-card-summary" onClick={() => setExpandedSettingsSection('prompt')} type="button">
                  <div className="settings-card-copy">
                    <span className="settings-card-title">System instructions</span>
                    <span className="settings-card-description">
                      {tempSystemPrompt.trim() ? `${tempSystemPrompt.trim().slice(0, 40)}${tempSystemPrompt.trim().length > 40 ? '...' : ''}` : 'Optional tone and style instructions for the model'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="settings-card-chevron" />
                </button>
                {expandedSettingsSection === 'prompt' && (
                  <div className="settings-card-detail" onClick={e => e.stopPropagation()}>
                    <label className="settings-label">System instructions</label>
                    <textarea
                      className="system-prompt-textarea"
                      value={tempSystemPrompt}
                      onChange={e => setTempSystemPrompt(e.target.value)}
                      rows={6}
                      placeholder="Optional tone and style instructions for the model..."
                    />
                  </div>
                )}
              </div>

              {aiProvider === 'deepseek' && (
                <div
                  className={`settings-card ${expandedSettingsSection === 'reasoning' ? 'expanded' : ''}`}
                >
                  <button className="settings-card-summary" onClick={() => setExpandedSettingsSection('reasoning')} type="button">
                    <div className="settings-card-copy">
                      <span className="settings-card-title">Reasoning</span>
                      <span className="settings-card-description">
                        {aiModel === 'deepseek-reasoner' ? 'Deeper reasoning for complex tasks' : 'Faster responses for daily chat'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="settings-card-chevron" />
                  </button>
                  {expandedSettingsSection === 'reasoning' && (
                    <div className="settings-card-detail" onClick={e => e.stopPropagation()}>
                      <div className="settings-toggle-item">
                        <div className="toggle-item-info">
                          <span className="toggle-item-label">Use reasoning model</span>
                          <span className="toggle-item-hint">Switch between `deepseek-chat` and `deepseek-reasoner`</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={aiModel === 'deepseek-reasoner'}
                            onChange={e => {
                              const newModel = e.target.checked ? 'deepseek-reasoner' : 'deepseek-chat'
                              setAIModel(newModel)
                              setCurrentModel(newModel)
                            }}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`settings-card ${expandedSettingsSection === 'provider' ? 'expanded' : ''}`}
              >
                <button className="settings-card-summary" onClick={() => setExpandedSettingsSection('provider')} type="button">
                  <div className="settings-card-copy">
                    <span className="settings-card-title">{hasApiKey ? 'AI Provider' : 'No API Key'}</span>
                    <span className="settings-card-description">
                      {hasApiKey ? `${getProviderConfig(aiProvider).name} connected` : 'Switch to a provider with a configured API key'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="settings-card-chevron" />
                </button>
                {expandedSettingsSection === 'provider' && (
                  <div className="settings-card-detail" onClick={e => e.stopPropagation()}>
                    <label className="settings-label">AI Provider</label>
                    <select
                      className="settings-select"
                      value={aiProvider}
                      onChange={e => {
                        const provider = e.target.value as AIProvider
                        setAIProvider(provider)
                        setCurrentProvider(provider)
                        setAIModel(getCurrentModel())
                      }}
                    >
                      <option value="mimo">Xiaomi MiMo</option>
                      <option value="deepseek">DeepSeek V3.2</option>
                    </select>
                    <div className="settings-inline-hint">
                      {hasApiKey ? 'API key detected for the current provider.' : 'No API key detected for the current provider yet.'}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`settings-card ${expandedSettingsSection === 'context' ? 'expanded' : ''}`}
              >
                <button className="settings-card-summary" onClick={() => setExpandedSettingsSection('context')} type="button">
                  <div className="settings-card-copy">
                    <span className="settings-card-title">Context</span>
                    <span className="settings-card-description">Token count · 0 / 128,000</span>
                  </div>
                  <ChevronDown size={16} className="settings-card-chevron" />
                </button>
                {expandedSettingsSection === 'context' && (
                  <div className="settings-card-detail" onClick={e => e.stopPropagation()}>
                    <div className="token-count-display">
                      <span className="token-count-label">Token count</span>
                      <span className="token-count-value">0 / 128,000</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="settings-footer">
              <button className="btn-secondary" onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}>Cancel</button>
              <button className="btn-primary" onClick={() => { setSystemPrompt(tempSystemPrompt); setShowSettings(false) }}>Save</button>
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
                        {/* AI 对话回复（如果存在） */}
                        {msg.role === 'assistant' && msg.content && (
                          <div className="message-content">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        )}
                        
                        {/* 用户消息（纯文本） */}
                        {msg.role === 'user' && (
                          <div className="message-content">
                            {msg.content}
                          </div>
                        )}
                        
                        {/* 编辑器内容（Markdown 渲染，重点展示） */}
                        {msg.role === 'assistant' && msg.editorContent && (
                          <div className="editor-content-preview">
                            <div className="preview-label">📝 编辑器内容</div>
                            <div className="preview-markdown">
                              <MarkdownRenderer content={msg.editorContent} />
                            </div>
                          </div>
                        )}
                        
                        {msg.role === 'assistant' && (msg.content || msg.editorContent) && (
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
        </>
      )}
    </div>
  )
}
