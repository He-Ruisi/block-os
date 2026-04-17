import { useSearch } from '../hooks/useSearch'
import { SearchView } from './SearchView'
import { toSearchResultViewModels } from './mappers'

interface SearchContainerProps {
  onOpenBlock: (blockId: string) => void
}

export function SearchContainer({ onOpenBlock }: SearchContainerProps) {
  const { query, setQuery, results, isSearching, hasSearched, handleSearch } = useSearch()

  const resultViewModels = toSearchResultViewModels(results)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <SearchView
      query={query}
      onQueryChange={setQuery}
      results={resultViewModels}
      isSearching={isSearching}
      hasSearched={hasSearched}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      onOpenBlock={onOpenBlock}
    />
  )
}
