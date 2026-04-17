import type { Project } from '@/types/models/project'
import type { Document } from '@/types/models/document'
import type { StarredItem } from '@/types/common/layout'
import type { ProjectViewModel, DocumentViewModel, StarredItemViewModel } from './types'

export function toDocumentViewModel(
  doc: Document,
  isStarred: (id: string, type: 'project' | 'document') => boolean
): DocumentViewModel {
  return {
    id: doc.id,
    title: doc.title,
    projectId: doc.projectId,
    isStarred: isStarred(doc.id, 'document'),
  }
}

export function toProjectViewModel(
  project: Project,
  docs: Document[],
  isExpanded: boolean,
  isStarred: (id: string, type: 'project' | 'document') => boolean
): ProjectViewModel {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    documentCount: project.documents.length,
    isExpanded,
    isStarred: isStarred(project.id, 'project'),
    documents: docs.map(doc => toDocumentViewModel(doc, isStarred)),
  }
}

export function toProjectViewModels(
  projects: Project[],
  projectDocs: Record<string, Document[]>,
  expandedProjects: Set<string>,
  isStarred: (id: string, type: 'project' | 'document') => boolean
): ProjectViewModel[] {
  return projects.map(project =>
    toProjectViewModel(
      project,
      projectDocs[project.id] || [],
      expandedProjects.has(project.id),
      isStarred
    )
  )
}

export function toStarredItemViewModels(
  items: StarredItem[],
  itemNames: Record<string, string>
): StarredItemViewModel[] {
  return items.map(item => ({
    id: item.id,
    type: item.type,
    name: item.name,
    displayName: itemNames[item.id] || item.name,
    projectId: item.projectId,
    starredAt: item.starredAt,
  }))
}
