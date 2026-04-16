import { useState, useCallback } from 'react'
import { searchBlocks } from '@/features/editor/extensions/suggestion'
import type { SuggestionItem } from '@/features/editor/extensions/suggestion'

interface BlockSearchState {
  items: SuggestionItem[]
  search: (query: string) => Promise<void>
  clear: () => void
}

export function useBlockSearch(): BlockSearchState {
  const [items, setItems] = useState<SuggestionItem[]>([])

  const search = useCallback(async (query: string) => {
    const results = await searchBlocks(query)
    setItems(results)
  }, [])

  const clear = useCallback(() => setItems([]), [])

  return { items, search, clear }
}
