import { useState, useCallback } from 'react'
import { searchBlocks } from '@/features/editor/extensions/suggestion'
import type { SuggestionItem } from '@/features/editor/extensions/suggestion'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SuggestionItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    try {
      const items = await searchBlocks(query)
      setResults(items)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched,
    handleSearch,
  }
}
