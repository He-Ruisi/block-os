import { useState, useCallback, useEffect } from 'react'
import type { Session, Message } from '../types/chat'
import { sessionStore } from '../storage/sessionStore'
import { saveSession } from '../services/sessionService'

const DEFAULT_SYSTEM_PROMPT = '你是厾，是一个辅助用户完成输入到输出的AI智能助手，你能引导用户发现深层需求并解决问题。今天的日期：2026-04-09，你的知识截止日期是2024年12月。'

interface UseSessionReturn {
  currentSession: Session
  allSessions: Session[]
  messages: Message[]
  systemPrompt: string
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setSystemPrompt: (prompt: string) => void
  newSession: () => Promise<void>
  loadSession: (session: Session) => void
  persistSession: (messages: Message[]) => Promise<void>
  refreshSessions: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [currentSession, setCurrentSession] = useState<Session>(() =>
    sessionStore.createNew(DEFAULT_SYSTEM_PROMPT)
  )
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [systemPrompt, setSystemPromptState] = useState(DEFAULT_SYSTEM_PROMPT)

  const refreshSessions = useCallback(async () => {
    const sessions = await sessionStore.getAllSessions()
    setAllSessions(sessions)
  }, [])

  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  // 保存当前 Session 到 DB
  const persistSession = useCallback(async (msgs: Message[]) => {
    if (msgs.length === 0) return
    const updated = await saveSession({ ...currentSession, systemPrompt }, msgs)
    setCurrentSession(updated)
    await refreshSessions()
  }, [currentSession, systemPrompt, refreshSessions])

  // 新建 Session（保存当前，清空）
  const newSession = useCallback(async () => {
    if (messages.length > 0) {
      await persistSession(messages)
    }
    const fresh = sessionStore.createNew(systemPrompt)
    setCurrentSession(fresh)
    setMessages([])
  }, [messages, persistSession, systemPrompt])

  // 加载历史 Session
  const loadSession = useCallback((session: Session) => {
    setCurrentSession(session)
    setMessages(session.messages)
    setSystemPromptState(session.systemPrompt)
  }, [])

  const setSystemPrompt = useCallback((prompt: string) => {
    setSystemPromptState(prompt)
    setCurrentSession(prev => ({ ...prev, systemPrompt: prompt }))
  }, [])

  return {
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
  }
}
