import { ReactNode } from 'react'
import './ChatLayout.css'

interface ChatLayoutProps {
  header: ReactNode
  content: ReactNode
  input: ReactNode
}

export function ChatLayout({ header, content, input }: ChatLayoutProps) {
  return (
    <div className="chat-layout">
      {header}
      <div className="chat-layout__content">
        {content}
      </div>
      {input}
    </div>
  )
}
