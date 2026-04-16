import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { searchBlocks } from '@/features/editor/extensions/suggestion'
import type { SuggestionItem } from '@/features/editor/extensions/suggestion'

interface SearchViewProps {
  onOpenBlock: (blockId: string) => void
}

export function SearchView({ onOpenBlock }: SearchViewProps) {
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-2 p-3 border-b border-border">
        <input
          className="flex-1 px-2.5 py-2 border border-border rounded text-sm bg-background text-foreground outline-none transition-colors focus:border-ring placeholder:text-muted-foreground"
          type="text"
          placeholder="搜索 Block..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="w-8 h-8 border border-border bg-background rounded cursor-pointer flex items-center justify-center transition-all shrink-0 hover:bg-muted hover:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          title="搜索"
        >
          <Search size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isSearching ? (
          <div className="py-10 px-5 text-center">
            <div className="text-sm text-muted-foreground mb-1">搜索中...</div>
          </div>
        ) : !hasSearched ? (
          <div className="py-10 px-5 text-center">
            <div className="text-sm text-muted-foreground mb-1">输入关键词搜索 Block</div>
            <div className="text-xs text-muted-foreground">按 Enter 搜索</div>
          </div>
        ) : results.length === 0 ? (
          <div className="py-10 px-5 text-center">
            <div className="text-sm text-muted-foreground mb-1">未找到结果</div>
            <div className="text-xs text-muted-foreground">尝试其他关键词</div>
          </div>
        ) : (
          <>
            <div className="py-1 px-2 text-xs text-muted-foreground uppercase tracking-wider">{results.length} 个结果</div>
            {results.map(item => (
                <div
                  key={item.id}
                  className="px-3 py-2.5 rounded cursor-pointer transition-colors mb-0.5 hover:bg-muted"
                  onClick={() => onOpenBlock(item.id)}
                >
                <div className="text-sm font-medium text-foreground mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">{truncate(item.content)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
