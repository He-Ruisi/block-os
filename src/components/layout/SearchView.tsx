import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { searchBlocks } from '../../editor/extensions/suggestion'
import type { SuggestionItem } from '../../editor/extensions/suggestion'
import './SearchView.css'

interface SearchViewProps {
  onOpenDocument: (docId: string) => void
}

export function SearchView({ onOpenDocument }: SearchViewProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 截断内容
  const truncate = (text: string, max: number = 80) => {
    if (text.length <= max) return text
    return text.substring(0, max) + '...'
  }

  return (
    <div className="search-view">
      <div className="search-input-wrapper">
        <input
          className="search-input"
          type="text"
          placeholder="搜索 Block..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          title="搜索"
        >
          <Search size={16} />
        </button>
      </div>

      <div className="search-results">
        {isSearching ? (
          <div className="search-empty">
            <div className="search-empty-text">搜索中...</div>
          </div>
        ) : !hasSearched ? (
          <div className="search-empty">
            <div className="search-empty-text">输入关键词搜索 Block</div>
            <div className="search-empty-hint">按 Enter 搜索</div>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-text">未找到结果</div>
            <div className="search-empty-hint">尝试其他关键词</div>
          </div>
        ) : (
          <>
            <div className="search-result-count">{results.length} 个结果</div>
            {results.map(item => (
              <div
                key={item.id}
                className="search-result"
                onClick={() => onOpenDocument(item.id)}
              >
                <div className="search-result-title">{item.title}</div>
                <div className="search-result-snippet">{truncate(item.content)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
