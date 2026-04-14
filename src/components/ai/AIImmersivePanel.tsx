import { useState } from 'react'
import { useAIChat } from '../../hooks/useAIChat'
import { useSession } from '../../hooks/useSession'
import { ChatLayout } from './ChatLayout'
import { ChatHeader } from './ChatHeader'
import { MessageContent } from './MessageContent'
import { ChatInput } from './ChatInput'
import { SessionHistoryPanel } from '../panel/SessionHistoryPanel'
import { 
  getCurrentProvider,
  setCurrentProvider,
  getCurrentModel,
  setCurrentModel,
  getProviderConfig,
  type AIProvider,
} from '../../services/aiService'
import '../panel/RightPanel.css' // 导入设置面板样式
import './AIImmersivePanel.css' // 导入沉浸式面板样式

interface AIImmersivePanelProps {
  onClose?: () => void
  onInsertContent?: (content: string) => void
}

export function AIImmersivePanel({ onClose, onInsertContent }: AIImmersivePanelProps) {
  const { messages, isLoading, input, setInput, handleSend, handleNewSession, insertToEditor } = useAIChat()
  const { currentSession, allSessions, systemPrompt, setSystemPrompt, loadSession, newSession: sessionNewSession, refreshSessions } = useSession()
  const [showDeepThink] = useState(true)
  const [showSearch] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempSystemPrompt, setTempSystemPrompt] = useState('')
  const [aiProvider, setAIProvider] = useState<AIProvider>(getCurrentProvider())
  const [aiModel, setAIModel] = useState<string>(getCurrentModel())

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

  const handleToggleHistory = () => {
    setShowHistory(prev => !prev)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setTempSystemPrompt(systemPrompt)
    setShowSettings(prev => !prev)
    setShowHistory(false)
  }

  const handleNewChat = async () => {
    await handleNewSession()
    setShowHistory(false)
    setShowSettings(false)
  }

  const handleLoadSession = (session: typeof currentSession) => {
    loadSession(session)
    setShowHistory(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (sessionId === currentSession.id) {
      sessionNewSession()
    }
  }

  const handleSaveSettings = () => {
    setSystemPrompt(tempSystemPrompt)
    setShowSettings(false)
  }

  const showSidebar = showHistory || showSettings

  return (
    <div className="ai-immersive-container">
      {/* 左侧 AI 对话区 */}
      <div className={`ai-immersive-main ${showSidebar ? 'ai-immersive-main--with-sidebar' : ''}`}>
        <ChatLayout
          header={
            <ChatHeader
              title="AI 助手"
              subtitle={`${messages.length} 条消息`}
              onExitFullscreen={onClose}
              onNewChat={handleNewChat}
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
      </div>

      {/* 右侧边栏 */}
      {showSidebar && (
        <div className="ai-immersive-sidebar">
          {showHistory && (
            <div className="ai-immersive-sidebar-content">
              <div className="ai-immersive-sidebar-header">
                <h3 className="ai-immersive-sidebar-title">历史对话</h3>
                <span className="ai-immersive-sidebar-subtitle">{allSessions.length} 个会话</span>
              </div>
              <div className="ai-immersive-sidebar-body">
                <SessionHistoryPanel
                  sessions={allSessions}
                  currentSessionId={currentSession.id}
                  onSelect={handleLoadSession}
                  onDelete={handleDeleteSession}
                  onRefresh={refreshSessions}
                />
              </div>
            </div>
          )}

          {showSettings && (
            <div className="ai-immersive-sidebar-content">
              <div className="ai-immersive-sidebar-header">
                <h3 className="ai-immersive-sidebar-title">运行设置</h3>
              </div>
              <div className="ai-immersive-sidebar-body">
                <div className="settings-panel">
                  <div className="settings-body">
                    {/* 模型选择 */}
                    <div className="settings-section">
                      <label className="settings-label">模型</label>
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
                            {model === 'deepseek-chat' && 'deepseek-chat (快速模式)'}
                            {model === 'deepseek-reasoner' && 'deepseek-reasoner (思考模式)'}
                            {model === 'mimo-v2-flash' && 'MiMo Flash'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Token 用量显示 */}
                    <div className="settings-section">
                      <div className="token-count-display">
                        <span className="token-count-label">Token count</span>
                        <span className="token-count-value">0 / 128,000</span>
                      </div>
                    </div>

                    {/* 系统提示词 */}
                    <div className="settings-section">
                      <label className="settings-label">系统提示词</label>
                      <textarea
                        className="system-prompt-textarea"
                        value={tempSystemPrompt}
                        onChange={e => setTempSystemPrompt(e.target.value)}
                        rows={6}
                        placeholder="输入系统提示词，影响 AI 的回复风格和行为..."
                      />
                    </div>

                    {/* 思考模式（仅 DeepSeek Reasoner） */}
                    {aiProvider === 'deepseek' && (
                      <div className="settings-section">
                        <div className="settings-section-title">思考</div>
                        
                        <div className="settings-toggle-item">
                          <div className="toggle-item-info">
                            <span className="toggle-item-label">思考模式</span>
                            <span className="toggle-item-hint">
                              {aiModel === 'deepseek-reasoner' ? '深度推理，适合复杂任务' : '快速响应，适合日常对话'}
                            </span>
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

                    {/* AI 提供商切换 */}
                    <div className="settings-section">
                      <label className="settings-label">AI 提供商</label>
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
                        <option value="mimo">小米 MiMo</option>
                        <option value="deepseek">DeepSeek V3.2</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-footer">
                    <button className="btn-secondary" onClick={() => { setTempSystemPrompt(systemPrompt); setShowSettings(false) }}>取消</button>
                    <button className="btn-primary" onClick={handleSaveSettings}>保存</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
