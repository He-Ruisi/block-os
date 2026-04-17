import { ReactNode } from 'react'

interface ChatLayoutProps {
  header: ReactNode
  content: ReactNode
  input: ReactNode
}

export function ChatLayout({ header, content, input }: ChatLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {header}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-4 py-6">{content}</div>
      </div>
      {input}
    </div>
  )
}
