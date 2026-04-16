import { useState, useRef, useEffect } from 'react'
import { X, Maximize2, ChevronDown } from 'lucide-react'
import { BlockSpacePanel } from '@/features/blocks'
import { SessionHistoryPanel } from './SessionHistoryPanel'
import { PreviewPanel } from './PreviewPanel'
import { toast } from '@/hooks/use-toast'
import { MarkdownRenderer } from '../shared/MarkdownRenderer'
import { AIImmersivePanel } from '@/features/ai'
import { generateUUID } from '@/utils/uuid'
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
} from '@/features/ai'
import { captureMessageAsBlock } from '@/features/blocks'
import { useSession } from '@/features/ai'
import { useViewport } from '@/hooks/useViewport'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { PanelTab } from '@/types/models/chat'
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
      toast({
        title: 'Block 捕获成功！',
      })
      setActiveTab('blocks')
    } else {
      toast({
        title: `Block 捕获失败: ${result.error}`,
        variant: 'destructive',
      })
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
          <div className="flex h-full flex-col bg-background">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3.5">
              <h3 className="m-0 text-base font-semibold text-foreground">运行设置</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                onClick={() => setShowSettings(false)}
                title="关闭"
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>
            
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3.5 py-3.5">
              <button
                className={cn(
                  "w-full rounded-[18px] border border-border/80 bg-gradient-to-b from-background/96 to-background p-0 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-border hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
                  expandedSettingsSection === 'model' && "border-purple-600/55 shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                )}
                onClick={() => setExpandedSettingsSection('model')}
                type="button"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-[15px] font-semibold text-foreground">Model</span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">
                      {getProviderConfig(aiProvider).name} · {getModelLabel(aiModel)}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "flex-shrink-0 text-muted-foreground transition-all",
                      expandedSettingsSection === 'model' && "rotate-180 text-foreground"
                    )}
                  />
                </div>
                {expandedSettingsSection === 'model' && (
                  <div 
                    className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/80 px-4 pb-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <label className="mb-2 mt-3.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Select model
                    </label>
                    <select
                      className="min-h-[48px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[15px] font-medium text-foreground outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
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
              </button>

              <button
                className={cn(
                  "w-full rounded-[18px] border border-border/80 bg-gradient-to-b from-background/96 to-background p-0 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-border hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
                  expandedSettingsSection === 'prompt' && "border-purple-600/55 shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                )}
                onClick={() => setExpandedSettingsSection('prompt')}
                type="button"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-[15px] font-semibold text-foreground">System instructions</span>
                    <span className="break-words text-[13px] leading-relaxed text-muted-foreground">
                      {tempSystemPrompt.trim() ? `${tempSystemPrompt.trim().slice(0, 40)}${tempSystemPrompt.trim().length > 40 ? '...' : ''}` : 'Optional tone and style instructions for the model'}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "flex-shrink-0 text-muted-foreground transition-all",
                      expandedSettingsSection === 'prompt' && "rotate-180 text-foreground"
                    )}
                  />
                </div>
                {expandedSettingsSection === 'prompt' && (
                  <div 
                    className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/80 px-4 pb-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <label className="mb-2 mt-3.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      System instructions
                    </label>
                    <Textarea
                      className="min-h-[132px] w-full resize-vertical rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                      value={tempSystemPrompt}
                      onChange={e => setTempSystemPrompt(e.target.value)}
                      rows={6}
                      placeholder="Optional tone and style instructions for the model..."
                    />
                  </div>
                )}
              </button>

              {aiProvider === 'deepseek' && (
                <button
                  className={cn(
                    "w-full rounded-[18px] border border-border/80 bg-gradient-to-b from-background/96 to-background p-0 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-border hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
                    expandedSettingsSection === 'reasoning' && "border-purple-600/55 shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                  )}
                  onClick={() => setExpandedSettingsSection('reasoning')}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-4">
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[15px] font-semibold text-foreground">Reasoning</span>
                      <span className="text-[13px] leading-relaxed text-muted-foreground">
                        {aiModel === 'deepseek-reasoner' ? 'Deeper reasoning for complex tasks' : 'Faster responses for daily chat'}
                      </span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={cn(
                        "flex-shrink-0 text-muted-foreground transition-all",
                        expandedSettingsSection === 'reasoning' && "rotate-180 text-foreground"
                      )}
                    />
                  </div>
                  {expandedSettingsSection === 'reasoning' && (
                    <div 
                      className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/80 px-4 pb-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between gap-4 pt-3.5">
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">Use reasoning model</span>
                          <span className="text-xs text-muted-foreground">Switch between `deepseek-chat` and `deepseek-reasoner`</span>
                        </div>
                        <label className="relative inline-block h-7 w-12 flex-shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer h-0 w-0 opacity-0"
                            checked={aiModel === 'deepseek-reasoner'}
                            onChange={e => {
                              const newModel = e.target.checked ? 'deepseek-reasoner' : 'deepseek-chat'
                              setAIModel(newModel)
                              setCurrentModel(newModel)
                            }}
                          />
                          <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-all before:absolute before:bottom-1 before:left-1 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow-sm before:transition-all before:content-[''] peer-checked:bg-purple-600 peer-checked:before:translate-x-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></span>
                        </label>
                      </div>
                    </div>
                  )}
                </button>
              )}

              <button
                className={cn(
                  "w-full rounded-[18px] border border-border/80 bg-gradient-to-b from-background/96 to-background p-0 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-border hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
                  expandedSettingsSection === 'provider' && "border-purple-600/55 shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                )}
                onClick={() => setExpandedSettingsSection('provider')}
                type="button"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-[15px] font-semibold text-foreground">{hasApiKey ? 'AI Provider' : 'No API Key'}</span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">
                      {hasApiKey ? `${getProviderConfig(aiProvider).name} connected` : 'Switch to a provider with a configured API key'}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "flex-shrink-0 text-muted-foreground transition-all",
                      expandedSettingsSection === 'provider' && "rotate-180 text-foreground"
                    )}
                  />
                </div>
                {expandedSettingsSection === 'provider' && (
                  <div 
                    className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/80 px-4 pb-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <label className="mb-2 mt-3.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      AI Provider
                    </label>
                    <select
                      className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
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
                    <div className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                      {hasApiKey ? 'API key detected for the current provider.' : 'No API key detected for the current provider yet.'}
                    </div>
                  </div>
                )}
              </button>

              <button
                className={cn(
                  "w-full rounded-[18px] border border-border/80 bg-gradient-to-b from-background/96 to-background p-0 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-border hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
                  expandedSettingsSection === 'context' && "border-purple-600/55 shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                )}
                onClick={() => setExpandedSettingsSection('context')}
                type="button"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-[15px] font-semibold text-foreground">Context</span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">Token count · 0 / 128,000</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "flex-shrink-0 text-muted-foreground transition-all",
                      expandedSettingsSection === 'context' && "rotate-180 text-foreground"
                    )}
                  />
                </div>
                {expandedSettingsSection === 'context' && (
                  <div 
                    className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/80 px-4 pb-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="mt-3.5 flex items-center justify-between rounded-[14px] border border-border/80 bg-secondary px-4 py-3.5">
                      <span className="text-[13px] text-muted-foreground">Token count</span>
                      <span className="font-mono text-sm font-medium text-foreground">0 / 128,000</span>
                    </div>
                  </div>
                )}
              </button>
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-border bg-background px-4 py-3.5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => { setSystemPrompt(tempSystemPrompt); setShowSettings(false) }}
              >
                Save
              </Button>
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
              <div className="flex-shrink-0 border-b border-border bg-secondary px-3.5 py-1">
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
                  {currentSession.title}
                </span>
              </div>
            )}

            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex flex-1 flex-col gap-4 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-3 text-5xl opacity-50">🤖</div>
                    <div className="mb-1.5 text-sm text-muted-foreground">开始与 AI 对话</div>
                    <div className="text-xs text-muted-foreground/70">AI 回复可直接写入编辑器或捕获为 Block</div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="flex gap-2.5 animate-in fade-in-0 slide-in-from-bottom-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-2xl">
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        {/* AI 对话回复（如果存在） */}
                        {msg.role === 'assistant' && msg.content && (
                          <div className="min-w-0 flex-1">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        )}
                        
                        {/* 用户消息（纯文本） */}
                        {msg.role === 'user' && (
                          <div className="break-words whitespace-pre-wrap rounded-md bg-secondary px-3 py-2.5 text-sm leading-relaxed text-foreground">
                            {msg.content}
                          </div>
                        )}
                        
                        {/* 编辑器内容（Markdown 渲染，重点展示） */}
                        {msg.role === 'assistant' && msg.editorContent && (
                          <div className="mt-3 rounded-lg border border-border bg-secondary p-4">
                            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              📝 编辑器内容
                            </div>
                            <div>
                              <MarkdownRenderer content={msg.editorContent} />
                            </div>
                          </div>
                        )}
                        
                        {msg.role === 'assistant' && (msg.content || msg.editorContent) && (
                          <div className="mt-1.5 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-7 gap-1 px-2.5 text-[11px] transition-all",
                                msg.insertedToEditor && "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20"
                              )}
                              onClick={() => insertToEditor(msg.id)}
                              disabled={msg.insertedToEditor}
                            >
                              {msg.insertedToEditor ? '✓ 已写入编辑器' : '↗ 写入编辑器'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 border-purple-600 px-2.5 text-[11px] text-purple-600 hover:bg-purple-600/10"
                              onClick={() => handleCaptureBlock(msg.id)}
                            >
                              ◆ 捕获为Block
                            </Button>
                            <span
                              className="flex h-7 w-7 cursor-grab select-none items-center justify-center rounded text-base leading-none tracking-tighter text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:cursor-grabbing"
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

            <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border bg-secondary p-3">
              <Textarea
                className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={3}
              />
              <Button
                className="self-end bg-purple-600 px-4 py-2 text-[13px] font-medium hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? '发送中...' : '发送'}
              </Button>
            </div>
          </>
        )
      )}

      {activeTab === 'blocks' && <BlockSpacePanel />}
      {activeTab === 'preview' && <PreviewPanel />}
        </>
      )}
    </div>
  )
}
