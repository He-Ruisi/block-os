import { History, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChatHeader } from '../ChatHeader'
import { ChatInput } from '../ChatInput'
import { ChatLayout } from '../ChatLayout'
import { MessageContent } from '../MessageContent'
import { SessionListView } from './SessionListView'
import type { AIImmersivePanelViewProps } from './types'

export function AIImmersivePanelView({
  title,
  subtitle,
  messages,
  isLoading,
  input,
  onInputChange,
  onSendMessage,
  onInsertToEditor,
  onClose,
  onNewSession,
  onToggleHistory,
  onOpenSettings,
  showHistory,
  showSettings,
  historyTitle,
  historySubtitle,
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  onExportSession,
  selectedProvider,
  selectedModel,
  providerOptions,
  modelOptions,
  systemPrompt,
  onProviderChange,
  onModelChange,
  onSystemPromptChange,
  onCancelSettings,
  onSaveSettings,
}: AIImmersivePanelViewProps) {
  const showSidebar = showHistory || showSettings

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${showSidebar ? 'lg:mr-[25%]' : ''}`}>
        <ChatLayout
          header={
            <ChatHeader
              title={title}
              subtitle={subtitle}
              onExitFullscreen={onClose}
              onNewChat={onNewSession}
              onToggleHistory={onToggleHistory}
              onOpenSettings={onOpenSettings}
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
              onChange={onInputChange}
              onSend={onSendMessage}
              disabled={isLoading}
              placeholder="Send a message..."
              showDeepThink
              showSearch
            />
          }
        />
      </div>

      {showSidebar ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => {
              if (showSettings) onCancelSettings()
              if (showHistory) onToggleHistory()
            }}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-sm flex-col border-l bg-background lg:w-[25%]">
            <div className="border-b px-4 py-4">
              <div className="flex items-center gap-2">
                {showHistory ? (
                  <History className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <h2 className="text-sm font-semibold">{historyTitle}</h2>
                  <p className="text-xs text-muted-foreground">{historySubtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {showHistory ? (
                <SessionListView
                  sessions={sessions}
                  currentSessionId={currentSessionId}
                  onSelect={onLoadSession}
                  onDelete={onDeleteSession}
                  onExport={onExportSession}
                />
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Provider</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={selectedProvider} onValueChange={(value) => onProviderChange(value as 'mimo' | 'deepseek')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerOptions.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              {provider.label} {provider.connected ? 'Connected' : 'No Key'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedModel} onValueChange={onModelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelOptions.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">System Prompt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={systemPrompt}
                        onChange={(event) => onSystemPromptChange(event.target.value)}
                        rows={8}
                        placeholder="Describe the tone, role, and constraints for the assistant..."
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={onCancelSettings}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={onSaveSettings}>
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  )
}
