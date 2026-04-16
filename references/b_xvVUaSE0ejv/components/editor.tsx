"use client"

import { useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Quote,
  Link,
  Image,
  Plus,
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
} from "lucide-react"

const initialBlocks = [
  {
    id: "1",
    type: "heading1",
    content: "Welcome to Your Workspace",
  },
  {
    id: "2",
    type: "paragraph",
    content:
      "This is a Notion-style editor. Click anywhere to start typing. Use the + button to add new blocks, or type / to see all available options.",
  },
  {
    id: "3",
    type: "heading2",
    content: "Getting Started",
  },
  {
    id: "4",
    type: "paragraph",
    content:
      "Start by organizing your thoughts into pages. Each page can contain text, images, code blocks, and more.",
  },
  {
    id: "5",
    type: "bullet",
    content: "Create nested pages for better organization",
  },
  {
    id: "6",
    type: "bullet",
    content: "Use tags and links to connect related content",
  },
  {
    id: "7",
    type: "bullet",
    content: "Collaborate with your team in real-time",
  },
  {
    id: "8",
    type: "quote",
    content:
      "The best way to predict the future is to create it. — Peter Drucker",
  },
  {
    id: "9",
    type: "heading2",
    content: "Keyboard Shortcuts",
  },
  {
    id: "10",
    type: "paragraph",
    content: "Speed up your workflow with these handy shortcuts:",
  },
  {
    id: "11",
    type: "todo",
    content: "Learn Markdown basics",
    checked: true,
  },
  {
    id: "12",
    type: "todo",
    content: "Explore templates",
    checked: false,
  },
  {
    id: "13",
    type: "todo",
    content: "Invite team members",
    checked: false,
  },
]

interface Block {
  id: string
  type: string
  content: string
  checked?: boolean
}

export function Editor() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null)

  const updateBlockContent = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    )
  }

  const toggleTodo = (id: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, checked: !block.checked } : block
      )
    )
  }

  const renderBlock = (block: Block) => {
    const isHovered = hoveredBlockId === block.id
    const isFocused = focusedBlockId === block.id

    const commonClasses = "outline-none w-full"

    const blockContent = (() => {
      switch (block.type) {
        case "heading1":
          return (
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlockContent(block.id, e.currentTarget.textContent || "")
              }
              onFocus={() => setFocusedBlockId(block.id)}
              className={`${commonClasses} text-3xl font-bold text-neutral-900`}
            >
              {block.content}
            </h1>
          )
        case "heading2":
          return (
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlockContent(block.id, e.currentTarget.textContent || "")
              }
              onFocus={() => setFocusedBlockId(block.id)}
              className={`${commonClasses} text-xl font-semibold text-neutral-900`}
            >
              {block.content}
            </h2>
          )
        case "heading3":
          return (
            <h3
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlockContent(block.id, e.currentTarget.textContent || "")
              }
              onFocus={() => setFocusedBlockId(block.id)}
              className={`${commonClasses} text-lg font-semibold text-neutral-900`}
            >
              {block.content}
            </h3>
          )
        case "bullet":
          return (
            <div className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateBlockContent(
                    block.id,
                    e.currentTarget.textContent || ""
                  )
                }
                onFocus={() => setFocusedBlockId(block.id)}
                className={`${commonClasses} text-neutral-700`}
              >
                {block.content}
              </p>
            </div>
          )
        case "quote":
          return (
            <blockquote className="border-l-4 border-neutral-300 pl-4">
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateBlockContent(
                    block.id,
                    e.currentTarget.textContent || ""
                  )
                }
                onFocus={() => setFocusedBlockId(block.id)}
                className={`${commonClasses} italic text-neutral-600`}
              >
                {block.content}
              </p>
            </blockquote>
          )
        case "todo":
          return (
            <div className="flex items-start gap-2">
              <button
                onClick={() => toggleTodo(block.id)}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  block.checked
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-neutral-400 hover:border-blue-600"
                }`}
              >
                {block.checked && (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateBlockContent(
                    block.id,
                    e.currentTarget.textContent || ""
                  )
                }
                onFocus={() => setFocusedBlockId(block.id)}
                className={`${commonClasses} ${block.checked ? "text-neutral-400 line-through" : "text-neutral-700"}`}
              >
                {block.content}
              </p>
            </div>
          )
        default:
          return (
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlockContent(block.id, e.currentTarget.textContent || "")
              }
              onFocus={() => setFocusedBlockId(block.id)}
              className={`${commonClasses} text-neutral-700 leading-relaxed`}
            >
              {block.content}
            </p>
          )
      }
    })()

    return (
      <div
        key={block.id}
        className="group relative"
        onMouseEnter={() => setHoveredBlockId(block.id)}
        onMouseLeave={() => setHoveredBlockId(null)}
      >
        {/* Block Controls */}
        <div
          className={`absolute -left-16 top-0 flex items-center gap-0.5 transition-opacity ${
            isHovered || isFocused ? "opacity-100" : "opacity-0"
          }`}
        >
          <button className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
            <Plus className="h-4 w-4" />
          </button>
          <button className="cursor-grab rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Block Content */}
        <div className="py-1">{blockContent}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="mx-auto max-w-[720px] px-16 py-12">
        {/* Page Icon & Title Area */}
        <div className="mb-4 flex items-center gap-2">
          <button className="text-4xl hover:scale-110 transition-transform">
            📄
          </button>
        </div>

        {/* Blocks */}
        <div className="space-y-1">
          {blocks.map((block) => renderBlock(block))}
        </div>

        {/* Add Block Hint */}
        <div className="mt-4 py-2">
          <button className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-600">
            <Plus className="h-4 w-4" />
            <span>{"Click to add a block, or type '/' for commands"}</span>
          </button>
        </div>

        {/* Formatting Toolbar (floating) */}
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 shadow-lg">
          <div className="flex items-center gap-0.5">
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Type className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Heading1 className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Heading2 className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Heading3 className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-neutral-200" />
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Bold className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Italic className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Underline className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Strikethrough className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-neutral-200" />
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <List className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <ListOrdered className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <CheckSquare className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-neutral-200" />
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Code className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Quote className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Link className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100">
              <Image className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
