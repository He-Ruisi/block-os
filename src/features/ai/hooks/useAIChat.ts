import { useState, useCallback } from 'react'
import type { Message } from '@/types/models/chat'
import { sendMessage, createImplicitBlockFromAI } from '../services/aiService'
import { useSession } from './useSession'
import { generateUUID } from '@/utils/uuid'

const MIMO_API_KEY = import.meta.env.VITE_MIMO_API_KEY || ''

interface UseAIChatReturn {
  messages: Message[]
  isLoading: boolean
  input: string
  setInput: (v: string) => void
  handleSend: (contextText?: string) => Promise<void>
  handleNewSession: () => Promise<void>
  insertToEditor: (messageId: string, onInsert?: (content: string) => void) => void
}

export function useAIChat(): UseAIChatReturn {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const {
    messages,
    setMessages,
    systemPrompt,
    newSession,
    persistSession,
  } = useSession()

  const handleSend = useCallback(async (contextText?: string) => {
    const text = input.trim()
    if (!text || isLoading) return

    const finalInput = contextText
      ? `[上下文]\n${contextText}\n\n[我的问题]\n${text}`
      : text

    const userMessage: Message = { id: generateUUID(), role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      let assistantId = ''

      const { assistantId: id, fullResponse } = await sendMessage({
        input: finalInput,
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

      const finalMessages = [...newMessages, {
        id,
        role: 'assistant' as const,
        content: fullResponse,
        insertedToEditor: false,
      }]
      await persistSession(finalMessages)
      await createImplicitBlockFromAI(id, fullResponse)
    } catch (error) {
      console.error('[useAIChat] send failed:', error)
      setMessages(prev => [
        ...prev,
        { id: generateUUID(), role: 'assistant', content: '抱歉，发送消息时出现错误。请检查 API 配置。', insertedToEditor: false },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, systemPrompt, setMessages, persistSession])

  const handleNewSession = useCallback(async () => {
    await newSession()
    setInput('')
  }, [newSession])

  const insertToEditor = useCallback((messageId: string, onInsert?: (content: string) => void) => {
    const message = messages.find(m => m.id === messageId)
    if (message?.role === 'assistant' && onInsert) {
      onInsert(message.editorContent || message.content)
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, insertedToEditor: true } : m))
    }
  }, [messages, setMessages])

  return {
    messages,
    isLoading,
    input,
    setInput,
    handleSend,
    handleNewSession,
    insertToEditor,
  }
}
