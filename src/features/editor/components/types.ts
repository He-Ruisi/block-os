import type { LucideIcon } from 'lucide-react'

export type AIToolbarMode =
  | 'continue'
  | 'rewrite'
  | 'shorten'
  | 'expand'
  | 'translate'
  | 'explain'
  | 'capture'

export interface SuggestionItemViewModel {
  id: string
  title: string
  content: string
}

export interface ToolbarButtonViewModel {
  id: string
  label?: string
  icon?: LucideIcon
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

export interface AIActionViewModel {
  mode: AIToolbarMode
  icon: LucideIcon
  label: string
  title: string
}
