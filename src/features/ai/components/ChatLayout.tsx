import { ReactNode } from 'react'

interface ChatLayoutProps {
  header: ReactNode
  content: ReactNode
  input: ReactNode
}

export function ChatLayout({ header, content, input }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {header}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-4 py-6">
          {content}
        </div>
      </div>
      {input}
    </div>
  )
}
