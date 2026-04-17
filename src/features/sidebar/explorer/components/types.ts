export interface DocumentViewModel {
  id: string
  title: string
  projectId?: string
  isStarred: boolean
}

export interface ProjectViewModel {
  id: string
  name: string
  description?: string
  documentCount: number
  isExpanded: boolean
  isStarred: boolean
  documents: DocumentViewModel[]
}

export interface StarredItemViewModel {
  id: string
  type: 'project' | 'document'
  name: string
  displayName: string
  projectId?: string
  starredAt: Date
}
