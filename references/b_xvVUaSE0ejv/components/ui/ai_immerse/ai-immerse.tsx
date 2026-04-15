"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AIHeader } from "./ai-header"
import { AIMessage, AIMessageLoading, type Message } from "./ai-message"
import { AIInput } from "./ai-input"
import { AISidebar } from "./ai-sidebar"
import { cn } from "@/lib/utils"

const DEMO_CHAT_HISTORY = [
  {
    id: "1",
    title: "React Performance Optimization",
    preview: "How can I improve the performance of my React app?",
    timestamp: new Date(Date.now() - 3600000),
    messageCount: 12,
  },
  {
    id: "2",
    title: "TypeScript Generics",
    preview: "Explain TypeScript generics with examples",
    timestamp: new Date(Date.now() - 86400000),
    messageCount: 8,
  },
  {
    id: "3",
    title: "CSS Grid Layout",
    preview: "Best practices for CSS Grid in responsive design",
    timestamp: new Date(Date.now() - 172800000),
    messageCount: 6,
  },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: `Welcome to **BlockOS AI Assistant**! I'm here to help you with:

- Writing and editing content
- Answering questions
- Brainstorming ideas
- Code assistance
- And much more...

How can I assist you today?`,
    timestamp: new Date(),
  },
]

interface AIImmerseProps {
  onExit?: () => void
  onInsertToEditor?: (content: string) => void
  onCaptureAsBlock?: (content: string) => void
}

export function AIImmerse({
  onExit,
  onInsertToEditor,
  onCaptureAsBlock,
}: AIImmerseProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<"history" | "settings">("history")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleSend = async (
    content: string,
    options?: { deepThink?: boolean; search?: boolean }
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateDemoResponse(content, options),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiResponse])
    setIsLoading(false)
  }

  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES)
  }

  const handleToggleHistory = () => {
    setSidebarMode("history")
    setSidebarOpen(!sidebarOpen || sidebarMode !== "history")
  }

  const handleToggleSettings = () => {
    setSidebarMode("settings")
    setSidebarOpen(!sidebarOpen || sidebarMode !== "settings")
  }

  const handleSelectChat = (chatId: string) => {
    console.log("Selected chat:", chatId)
    setSidebarOpen(false)
  }

  const handleDeleteChat = (chatId: string) => {
    console.log("Delete chat:", chatId)
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <AIHeader
        messageCount={messages.length}
        onExit={onExit ?? (() => window.history.back())}
        onNewChat={handleNewChat}
        onToggleHistory={handleToggleHistory}
        onToggleSettings={handleToggleSettings}
      />

      <div className="flex-1 flex overflow-hidden">
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:mr-[25%]" : ""
          )}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[760px] mx-auto px-4 py-6">
              {messages.map((message) => (
                <AIMessage
                  key={message.id}
                  message={message}
                  onInsertToEditor={onInsertToEditor}
                  onCaptureAsBlock={onCaptureAsBlock}
                />
              ))}
              {isLoading && <AIMessageLoading />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <AIInput onSend={handleSend} disabled={isLoading} />
        </main>

        <AISidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          onClose={() => setSidebarOpen(false)}
          chatHistory={DEMO_CHAT_HISTORY}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>
    </div>
  )
}

function generateDemoResponse(
  userMessage: string,
  options?: { deepThink?: boolean; search?: boolean }
): string {
  const lowerMessage = userMessage.toLowerCase()

  if (options?.deepThink) {
    return `## Deep Analysis

After careful consideration of your question: "${userMessage}"

### Key Points:
1. **Context Understanding** - I've analyzed the deeper implications of your query
2. **Multiple Perspectives** - Considering various angles and approaches
3. **Comprehensive Answer** - Providing a thorough response

### Detailed Response:
This is a demonstration of the DeepThink mode, which provides more thorough and analytical responses. In a real implementation, this would involve:

- Extended reasoning chains
- Multiple verification steps
- More comprehensive answers

\`\`\`typescript
// Example code snippet
const deepThink = async (query: string) => {
  const analysis = await analyzeQuery(query);
  const perspectives = await gatherPerspectives(analysis);
  return synthesizeResponse(perspectives);
};
\`\`\`

Is there anything specific you'd like me to elaborate on?`
  }

  if (options?.search) {
    return `## Search Results

I searched for information related to: "${userMessage}"

### Top Results:
1. **Official Documentation** - Comprehensive guides and API references
2. **Community Resources** - Stack Overflow discussions and tutorials
3. **Recent Updates** - Latest changes and announcements

### Summary:
Based on my search, here are the key findings relevant to your query. In a production environment, this would include real-time web search results and citations.

Would you like me to search for more specific information?`
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you today? Feel free to ask me anything or try the **DeepThink** and **Search** features for more comprehensive responses."
  }

  if (lowerMessage.includes("code") || lowerMessage.includes("example")) {
    return `Here's an example based on your request:

\`\`\`typescript
interface Example {
  id: string;
  name: string;
  value: number;
}

const processExample = (data: Example[]): Example[] => {
  return data
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      name: item.name.toUpperCase()
    }));
};
\`\`\`

This demonstrates a common pattern. Would you like me to explain any part in more detail?`
  }

  return `Thank you for your message! Here's my response to: "${userMessage}"

I'm a demo AI assistant showcasing the BlockOS AI interface. In a real implementation, I would:

- Process your query using advanced language models
- Provide contextually relevant responses
- Support code generation, writing assistance, and more

Try using the **DeepThink** button for deeper analysis or **Search** for web-enhanced responses!`
}

export default AIImmerse
