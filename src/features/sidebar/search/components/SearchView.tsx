import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, SearchInput } from '@/components/shells'
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
  const truncate = (text: string, max = 80) => (text.length <= max ? text : `${text.substring(0, max)}...`)

  return (
    <div className="space-y-4">
      <div className="section-label w-fit">
        <span className="section-label__dot" />
        <span className="section-label__text">Block Search</span>
      </div>

      <div className="flex gap-2">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="搜索 Block..."
          autoFocus
          onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement>}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={onSearch} disabled={!query.trim() || isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isSearching ? (
        <EmptyState title="搜索中..." description="正在查找匹配的 Block。" />
      ) : !hasSearched ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8">
          <EmptyState compact icon={Search} title="输入关键词开始搜索" description="按 Enter 或点击搜索按钮执行查询。" />
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8">
          <EmptyState compact icon={Search} title="没有找到结果" description="换一个关键词，或者缩短搜索词试试。" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {results.length} results
          </div>
          {results.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className="h-auto w-full justify-start rounded-2xl border border-border/80 bg-background/90 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/[0.03]"
              onClick={() => onOpenBlock(item.id)}
            >
              <div className="w-full">
                <div className="mb-1 truncate text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs leading-6 text-muted-foreground">{truncate(item.content)}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
