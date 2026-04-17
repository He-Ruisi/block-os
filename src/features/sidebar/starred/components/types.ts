export interface StarredItemViewModel {
  id: string
  type: 'project' | 'document'
  name: string
  displayName: string
  projectId?: string
  starredAt: Date
}
