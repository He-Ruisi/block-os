import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shells/EmptyState'
import type { SearchResultViewModel } from './types'

interface SearchViewProps {
  query: string
  onQueryChange: (value: string) => void
  results: SearchResultViewModel[]
  isSearching: boolean
  hasSearched: boolean
  onSearch: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onOpenBlock: (blockId: string) => void
}

export function SearchView({
  query,
  onQueryChange,
  results,
  isSearching,
  hasSearched,
  onSearch,
  onKeyDown,
  onOpenBlock,
}: SearchViewProps) {
  const truncate = (text: string, max: number = 80) => {
    if (text.length <= max) return text
    return text.substring(0, max) + '...'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-2 p-3 border-b border-border">
        <Input
          type="text"
          placeholder="搜索 Block..."
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onSearch}
          disabled={!query.trim() || isSearching}
          title="搜索"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            <EmptyState
              title="搜索中..."
              description="正在查找匹配的 Block"
            />
          ) : !hasSearched ? (
            <EmptyState
              icon={Search}
              title="输入关键词搜索 Block"
              description="按 Enter 搜索"
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="未找到结果"
              description="尝试其他关键词"
            />
          ) : (
            <>
              <div className="py-1 px-2 text-xs text-muted-foreground uppercase tracking-wider">
                {results.length} 个结果
              </div>
              {results.map(item => (
                <div
                  key={item.id}
                  className="px-3 py-2.5 rounded cursor-pointer transition-colors mb-0.5 hover:bg-muted"
                  onClick={() => onOpenBlock(item.id)}
                >
                  <div className="text-sm font-medium text-foreground mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                    {truncate(item.content)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
