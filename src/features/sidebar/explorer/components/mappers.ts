import type { Project } from '@/types/models/project'
import type { Document } from '@/types/models/document'
import type { ProjectViewModel, DocumentViewModel } from './types'

export function toProjectViewModel(
  project: Project,
  isExpanded: boolean,
  isStarred: boolean
): ProjectViewModel {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    documentCount: project.documents.length,
    isExpanded,
    isStarred,
  }
}

export function toProjectViewModels(
  projects: Project[],
  expandedProjects: Set<string>,
  isStarred: (id: string, type: 'project' | 'document') => boolean
): ProjectViewModel[] {
  return projects.map(project =>
    toProjectViewModel(project, expandedProjects.has(project.id), isStarred(project.id, 'project'))
  )
}

export function toDocumentViewModel(doc: Document, isStarred: boolean): DocumentViewModel {
  return {
    id: doc.id,
    title: doc.title,
    projectId: doc.projectId,
    isStarred,
  }
}

export function toDocumentViewModels(
  docs: Document[],
  isStarred: (id: string, type: 'project' | 'document') => boolean
): DocumentViewModel[] {
  return docs.map(doc => toDocumentViewModel(doc, isStarred(doc.id, 'document')))
}
