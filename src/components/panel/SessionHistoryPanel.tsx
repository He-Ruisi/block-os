import { MessageSquare, Clock, Trash2, Download } from 'lucide-react'
import type { Session } from '@/types/models/chat'
import { groupSessionsByDate, exportSessionAsJSON } from '@/features/ai'
import { sessionStore } from '@/storage/sessionStore'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import '@/styles/modules/panels.css'

interface SessionHistoryPanelProps {
  sessions: Session[]
  currentSessionId: string
  onSelect: (session: Session) => void
  onDelete: (sessionId: string) => void
  onRefresh: () => Promise<void>
}

export function SessionHistoryPanel({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onRefresh,
}: SessionHistoryPanelProps) {
  const groups = groupSessionsByDate(sessions)

  const handleDelete = async (sessionId: string) => {
    await sessionStore.deleteSession(sessionId)
    await onRefresh()
    onDelete(sessionId)
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="text-4xl mb-3">💬</div>
        <div className="text-sm text-muted-foreground mb-1">还没有历史对话</div>
        <div className="text-xs text-muted-foreground">开始对话后会自动保存</div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {groups.map(group => (
          <div key={group.date} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground px-2">{group.label}</h4>
            <div className="space-y-2">
              {group.sessions.map(session => (
                <DropdownMenu key={session.id}>
                  <DropdownMenuTrigger asChild>
                    <Card
                      className={cn(
                        "p-3 cursor-pointer transition-all hover:border-accent-green/50",
                        session.id === currentSessionId && "border-accent-green bg-accent-green/5"
                      )}
                      onClick={() => onSelect(session)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="text-sm font-medium line-clamp-1 flex-1">
                          {session.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          <MessageSquare className="h-2.5 w-2.5 mr-1" />
                          {session.messages.length}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          {formatTime(session.updatedAt)}
                        </Badge>
                      </div>
                    </Card>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportSessionAsJSON(session)}>
                      <Download className="h-4 w-4 mr-2" />
                      导出 JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(session.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
