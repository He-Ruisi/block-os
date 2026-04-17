import { useMemo, useState } from 'react'
import type { Message, Session } from '@/types/models/chat'
import {
  setCurrentModel,
  setCurrentProvider,
  type AIProvider,
} from '../../services/aiService'
import { AIImmersivePanelView } from './AIImmersivePanelView'
import {
  formatModelLabel,
  toAIMessageViewModels,
  toAIModelOptions,
  toAIProviderOptions,
  toAISessionViewModels,
} from './mappers'

interface AIImmersivePanelContainerProps {
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

export function AIImmersivePanelContainer({
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
}: AIImmersivePanelContainerProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempSystemPrompt, setTempSystemPrompt] = useState(systemPrompt)
  const [settingsProvider, setSettingsProvider] = useState<AIProvider>(aiProvider)
  const [settingsModel, setSettingsModel] = useState(aiModel)

  const providerOptions = useMemo(() => toAIProviderOptions(), [])
  const modelOptions = useMemo(() => toAIModelOptions(settingsProvider), [settingsProvider])

  const handleToggleHistory = () => {
    setShowHistory((previous) => !previous)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setTempSystemPrompt(systemPrompt)
    setSettingsProvider(aiProvider)
    setSettingsModel(aiModel)
    setShowSettings((previous) => !previous)
    setShowHistory(false)
  }

  const handleLoadSession = (sessionId: string) => {
    const session = allSessions.find((item) => item.id === sessionId)
    if (!session) return
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

  const handleCancelSettings = () => {
    setTempSystemPrompt(systemPrompt)
    setSettingsProvider(aiProvider)
    setSettingsModel(aiModel)
    setShowSettings(false)
  }

  return (
    <AIImmersivePanelView
      title="AI Assistant"
      subtitle={`${messages.length} messages`}
      messages={toAIMessageViewModels(messages)}
      isLoading={isLoading}
      input={input}
      onInputChange={setInput}
      onSendMessage={() => {
        void onSendMessage()
      }}
      onInsertToEditor={onInsertToEditor}
      onClose={onClose}
      onNewSession={() => {
        void onNewSession()
      }}
      onToggleHistory={handleToggleHistory}
      onOpenSettings={handleOpenSettings}
      showHistory={showHistory}
      showSettings={showSettings}
      historyTitle={showHistory ? 'History' : 'Settings'}
      historySubtitle={
        showHistory
          ? `${allSessions.length} sessions`
          : `${settingsProvider} / ${formatModelLabel(settingsModel)}`
      }
      sessions={toAISessionViewModels(allSessions)}
      currentSessionId={currentSession.id}
      onLoadSession={handleLoadSession}
      onDeleteSession={onDeleteSession}
      onRefreshSessions={refreshSessions}
      selectedProvider={settingsProvider}
      selectedModel={settingsModel}
      providerOptions={providerOptions}
      modelOptions={modelOptions}
      systemPrompt={tempSystemPrompt}
      onProviderChange={(provider) => {
        setSettingsProvider(provider)
        setSettingsModel(toAIModelOptions(provider)[0]?.value ?? '')
      }}
      onModelChange={setSettingsModel}
      onSystemPromptChange={setTempSystemPrompt}
      onCancelSettings={handleCancelSettings}
      onSaveSettings={handleSaveSettings}
    />
  )
}
