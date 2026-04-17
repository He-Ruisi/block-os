import { useEffect, useState } from 'react'
import { SuggestionMenuView } from './SuggestionMenuView'
import type { SuggestionMenuViewProps } from './types'

export function SuggestionMenuContainer({
  items,
  onSelect,
  onClose,
  position,
}: SuggestionMenuViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((previous) => (previous + 1) % items.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((previous) => (previous - 1 + items.length) % items.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        if (items[selectedIndex]) onSelect(items[selectedIndex])
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onSelect, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  return (
    <SuggestionMenuView
      items={items}
      onSelect={onSelect}
      onClose={onClose}
      position={position}
      activeIndex={selectedIndex}
      onHover={setSelectedIndex}
    />
  )
}
