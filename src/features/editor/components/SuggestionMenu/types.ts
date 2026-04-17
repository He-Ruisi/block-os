import type { SuggestionItemViewModel } from '../types'

export interface SuggestionMenuViewProps {
  items: SuggestionItemViewModel[]
  onSelect: (item: SuggestionItemViewModel) => void
  onClose: () => void
  position: { top: number; left: number }
}
