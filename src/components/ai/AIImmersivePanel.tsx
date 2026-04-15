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
                <div className="settings-panel">
                  <div className="settings-body">
                    <div className="settings-card expanded">
                      <button className="settings-card-summary" type="button">
                        <div className="settings-card-copy">
                          <span className="settings-card-title">Model</span>
                          <span className="settings-card-description">{getProviderConfig(settingsProvider).name} · {getModelLabel(settingsModel)}</span>
                        </div>
                      </button>
                      <div className="settings-card-detail">
                        <label className="settings-label">Select model</label>
                        <select
                          className="settings-select settings-select-large"
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

                    <div className="settings-card expanded">
                      <button className="settings-card-summary" type="button">
                        <div className="settings-card-copy">
                          <span className="settings-card-title">System instructions</span>
                          <span className="settings-card-description">
                            {tempSystemPrompt.trim() ? `${tempSystemPrompt.trim().slice(0, 40)}${tempSystemPrompt.trim().length > 40 ? '...' : ''}` : 'Optional tone and style instructions for the model'}
                          </span>
                        </div>
                      </button>
                      <div className="settings-card-detail">
                        <label className="settings-label">System instructions</label>
                        <textarea
                          className="system-prompt-textarea"
                          value={tempSystemPrompt}
                          onChange={e => setTempSystemPrompt(e.target.value)}
                          rows={6}
                          placeholder="Optional tone and style instructions for the model..."
                        />
                      </div>
                    </div>

                    {settingsProvider === 'deepseek' && (
                      <div className="settings-card expanded">
                        <button className="settings-card-summary" type="button">
                          <div className="settings-card-copy">
                            <span className="settings-card-title">Reasoning</span>
                            <span className="settings-card-description">
                              {settingsModel === 'deepseek-reasoner' ? 'Deeper reasoning for complex tasks' : 'Faster responses for daily chat'}
                            </span>
                          </div>
                        </button>
                        <div className="settings-card-detail">
                          <div className="settings-toggle-item">
                            <div className="toggle-item-info">
                              <span className="toggle-item-label">Use reasoning model</span>
                              <span className="toggle-item-hint">Switch between `deepseek-chat` and `deepseek-reasoner`</span>
                            </div>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={settingsModel === 'deepseek-reasoner'}
                                onChange={e => setSettingsModel(e.target.checked ? 'deepseek-reasoner' : 'deepseek-chat')}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="settings-card expanded">
                      <button className="settings-card-summary" type="button">
                        <div className="settings-card-copy">
                          <span className="settings-card-title">{hasApiKey ? 'AI Provider' : 'No API Key'}</span>
                          <span className="settings-card-description">
                            {hasApiKey ? `${getProviderConfig(settingsProvider).name} connected` : 'Switch to a provider with a configured API key'}
                          </span>
                        </div>
                      </button>
                      <div className="settings-card-detail">
                        <label className="settings-label">AI Provider</label>
                        <select
                          className="settings-select"
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
                        <div className="settings-inline-hint">
                          {hasApiKey ? 'API key detected for the current provider.' : 'No API key detected for the current provider yet.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-footer">
                    <button className="btn-secondary" onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveSettings}>Save</button>
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
