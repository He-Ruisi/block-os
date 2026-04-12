import type { Session, Message } from '../types/chat'
import { sessionStore } from '../storage/sessionStore'

// 导出 Session 为 JSON 文件（Blob 下载）
export function exportSessionAsJSON(session: Session): void {
  const json = JSON.stringify(session, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `session-${session.date}-${session.title.slice(0, 20).replace(/\s+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 保存/更新 Session（AI 回复完成后调用）
export async function saveSession(
  session: Session,
  messages: Message[]
): Promise<Session> {
  const updated: Session = {
    ...session,
    messages,
    title: sessionStore.generateTitle(messages),
    updatedAt: new Date(),
  }
  await sessionStore.saveSession(updated)
  return updated
}

// 按日期分组 Sessions
export interface SessionGroup {
  label: string   // "今天" | "昨天" | "2026-04-09"
  date: string
  sessions: Session[]
}

export function groupSessionsByDate(sessions: Session[]): SessionGroup[] {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const map = new Map<string, Session[]>()
  for (const s of sessions) {
    const list = map.get(s.date) || []
    list.push(s)
    map.set(s.date, list)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      label: date === today ? '今天' : date === yesterday ? '昨天' : date,
      date,
      sessions: list,
    }))
}
