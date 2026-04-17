import { Download, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AISessionViewModel } from '../types'

interface SessionListViewProps {
  sessions: AISessionViewModel[]
  currentSessionId: string
  onSelect: (sessionId: string) => void
  onDelete: (sessionId: string) => void
  onExport: (sessionId: string) => void
}

export function SessionListView({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onExport,
}: SessionListViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No chat history yet</p>
        <p className="text-xs text-muted-foreground">Sessions will appear here after your first exchange.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className={cn(
            'cursor-pointer border-border/70 transition-colors hover:border-primary/40',
            session.id === currentSessionId && 'border-primary bg-primary/5'
          )}
          onClick={() => onSelect(session.id)}
        >
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1">
              <p className="line-clamp-1 text-sm font-medium">{session.title}</p>
              <p className="text-xs text-muted-foreground">
                {session.messageCount} messages · {session.updatedAtLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onExport(session.id) }}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onDelete(session.id) }}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
