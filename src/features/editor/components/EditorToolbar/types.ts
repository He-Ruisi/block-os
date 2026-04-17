import type { ToolbarButtonViewModel } from '../types'

export interface ToolbarSectionViewModel {
  id: string
  buttons: ToolbarButtonViewModel[]
}

export interface EditorToolbarViewProps {
  topSections: ToolbarSectionViewModel[]
  bottomSections: ToolbarSectionViewModel[]
  shortcutHint: string
  className?: string
}
