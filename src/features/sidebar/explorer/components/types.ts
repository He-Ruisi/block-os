export interface ProjectViewModel {
  id: string
  name: string
  description?: string
  documentCount: number
  isExpanded: boolean
  isStarred: boolean
}

export interface DocumentViewModel {
  id: string
  title: string
  projectId?: string
  isStarred: boolean
}
