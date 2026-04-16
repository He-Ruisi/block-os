import { useState, useEffect, useRef } from 'react'
import '../../../styles/modules/ai.css'

interface SuggestionItem {
  id: string
  title: string
  content: string
}

interface SuggestionMenuProps {
  items: SuggestionItem[]
  onSelect: (item: SuggestionItem) => void
  onClose: () => void
  position: { top: number; left: number }
}

export function SuggestionMenu({ items, onSelect, onClose, position }: SuggestionMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (items[selectedIndex]) {
          onSelect(items[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onSelect, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  if (items.length === 0) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="editor-suggestion-menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`editor-suggestion-menu__item ${index === selectedIndex ? 'editor-suggestion-menu__item--selected' : ''}`}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="editor-suggestion-menu__title">{item.title}</div>
          <div className="editor-suggestion-menu__content">
            {item.content.substring(0, 60)}
            {item.content.length > 60 ? '...' : ''}
          </div>
        </div>
      ))}
    </div>
  )
}
