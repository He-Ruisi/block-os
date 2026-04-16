import { useState } from 'react'
import type { Message, Session } from '../../types/chat'
import { ChatLayout } from './ChatLayout'
import { ChatHeader } from './ChatHeader'
import { MessageContent } from './MessageContent'
import { ChatInput } from './ChatInput'
import { SessionHistoryPanel } from '../panel/SessionHistoryPanel'
import {
  setCurrentProvider,
  setCurrentModel,
  getProviderConfig,
  getProviderApiKey,
  type AIProvider,
} from '../../services/aiService'
import '../panel/RightPanel.css'

interface AIImmersivePanelProps {
  onClose?: () => void
  messages: Message[]
  isLoading: boolean
  input: string
  setInput: (value: string) => void
  onSendMessage: () => Promise<void>
  onNewSession: () => Promise<void>
  onInsertToEditor: (messageId: string) => void
  currentSession: Session
  allSessions: Session[]
  systemPrompt: string
  setSystemPrompt: (prompt: string) => void
  loadSession: (session: Session) => void
  refreshSessions: () => Promise<void>
  onDeleteSession: (sessionId: string) => void
  aiProvider: AIProvider
  setAIProvider: (provider: AIProvider) => void
  aiModel: string
  setAIModel: (model: string) => void
}

export function AIImmersivePanel({
  onClose,
  messages,
  isLoading,
  input,
  setInput,
  onSendMessage,
  onNewSession,
  onInsertToEditor,
  currentSession,
  allSessions,
  systemPrompt,
  setSystemPrompt,
  loadSession,
  refreshSessions,
  onDeleteSession,
  aiProvider,
  setAIProvider,
  aiModel,
  setAIModel,
}: AIImmersivePanelProps) {
  const [showDeepThink] = useState(true)
  const [showSearch] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempSystemPrompt, setTempSystemPrompt] = useState('')
  const [settingsProvider, setSettingsProvider] = useState<AIProvider>(aiProvider)
  const [settingsModel, setSettingsModel] = useState<string>(aiModel)

  const showSidebar = showHistory || showSettings
  const hasApiKey = Boolean(getProviderApiKey(settingsProvider))

  const getModelLabel = (model: string) => {
    if (model === 'deepseek-chat') return 'deepseek-chat (Fast)'
    if (model === 'deepseek-reasoner') return 'deepseek-reasoner (Reasoning)'
    if (model === 'mimo-v2-flash') return 'MiMo Flash'
    return model
  }

  const handleToggleHistory = () => {
    setShowHistory(prev => !prev)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setTempSystemPrompt(systemPrompt)
    setSettingsProvider(aiProvider)
    setSettingsModel(aiModel)
    setShowSettings(prev => !prev)
    setShowHistory(false)
  }

  const handleLoadSession = (session: Session) => {
    loadSession(session)
    setShowHistory(false)
  }

  const handleSaveSettings = () => {
    setSystemPrompt(tempSystemPrompt)
    setAIProvider(settingsProvider)
    setCurrentProvider(settingsProvider)
    setAIModel(settingsModel)
    setCurrentModel(settingsModel)
    setShowSettings(false)
  }

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${showSidebar ? 'lg:mr-[25%]' : ''}`}>
        <ChatLayout
          header={
            <ChatHeader
              title="AI 助手"
              subtitle={`${messages.length} 条消息`}
              onExitFullscreen={onClose}
              onNewChat={onNewSession}
              onToggleHistory={handleToggleHistory}
              onOpenSettings={handleOpenSettings}
              showHistory={showHistory}
              showSettings={showSettings}
            />
          }
          content={
            <MessageContent
              messages={messages}
              isLoading={isLoading}
              onInsertToEditor={onInsertToEditor}
            />
          }
          input={
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => { void onSendMessage() }}
              disabled={isLoading}
              placeholder="输入消息..."
              showDeepThink={showDeepThink}
              showSearch={showSearch}
            />
          }
        />
      </div>

      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => {
              setShowHistory(false)
              setShowSettings(false)
            }}
          />
          <aside className="fixed top-0 right-0 h-full w-80 lg:w-[25%] max-w-sm bg-background border-l border-border z-50 flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-semibold text-foreground">
                  {showHistory ? '历史对话' : '运行设置'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {showHistory ? `${allSessions.length} 个会话` : '配置 AI 助手'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showHistory && (
                <div className="p-4">
                  <SessionHistoryPanel
                    sessions={allSessions}
                    currentSessionId={currentSession.id}
                    onSelect={handleLoadSession}
                    onDelete={onDeleteSession}
                    onRefresh={refreshSessions}
                  />
                </div>
              )}

              {showSettings && (
                <div className="p-4 space-y-6">
                  {/* Model Selection */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">模型</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getProviderConfig(settingsProvider).name} · {getModelLabel(settingsModel)}
                      </p>
                    </div>
                    <div className="space-y-2">
          
                      <select
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        value={settingsModel}
                        onChange={e => setSettingsModel(e.target.value)}
                      >
                        {getProviderConfig(settingsProvider).supportedModels.map(model => (
                          <option key={model} value={model}>
                            {getModelLabel(model)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reasoning Toggle (DeepSeek only) */}
                  {settingsProvider === 'deepseek' && (
                    <div className="border-t border-border pt-6 space-y-3">
                    
                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">使用推理模型</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            在 deepseek-chat 和 deepseek-reasoner 之间切换
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settingsModel === 'deepseek-reasoner'}
                            onChange={e => setSettingsModel(e.target.checked ? 'deepseek-reasoner' : 'deepseek-chat')}
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* System Instructions */}
                  <div className="border-t border-border pt-6 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">系统指令</h3>
                      <div className="space-y-2">
                      <textarea
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        value={tempSystemPrompt}
                        onChange={e => setTempSystemPrompt(e.target.value)}
                        rows={6}
                        placeholder="为模型设置可选的语气和风格指令..."
                      />
                      </div>
                    </div>
                  </div>

                  

                  {/* AI Provider */}
                  <div className="border-t border-border pt-6 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {hasApiKey ? 'AI 提供商' : '未配置 API Key'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {hasApiKey 
                          ? `${getProviderConfig(settingsProvider).name} 已连接` 
                          : '切换到已配置 API Key 的提供商'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <select
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        value={settingsProvider}
                        onChange={e => {
                          const provider = e.target.value as AIProvider
                          setSettingsProvider(provider)
                          setSettingsModel(getProviderConfig(provider).defaultModel)
                        }}
                      >
                        <option value="mimo">Xiaomi MiMo</option>
                        <option value="deepseek">DeepSeek V3.2</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {hasApiKey 
                          ? '已检测到当前提供商的 API Key' 
                          : '尚未检测到当前提供商的 API Key'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-border pt-6 flex gap-2">
                    <button 
                      className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                      onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}
                    >
                      取消
                    </button>
                    <button 
                      className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
                      onClick={handleSaveSettings}
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
