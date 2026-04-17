import { useState, useEffect } from 'react'
import type { Project } from '@/types/models/project'
import type { Document } from '@/types/models/document'
import { projectStore } from '@/storage/projectStore'
import { documentStore } from '@/storage/documentStore'

const STORAGE_KEY = 'blockos-starred-items'

export function useExplorer() {
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [projectDocs, setProjectDocs] = useState<Record<string, Document[]>>({})
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())

  const loadProjects = async () => {
    try {
      const allProjects = await projectStore.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadProjectDocs = async (projectId: string) => {
    try {
      const docs = await documentStore.getDocumentsByProject(projectId)
      setProjectDocs(prev => ({ ...prev, [projectId]: docs }))
    } catch (error) {
      console.error('Failed to load project docs:', error)
    }
  }

  const loadStarredIds = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setStarredIds(new Set())
        return
      }

      const items = JSON.parse(raw) as Array<{ id: string; type: string }>
      setStarredIds(new Set(items.map(item => `${item.type}-${item.id}`)))
    } catch (error) {
      console.error('Failed to load starred ids:', error)
    }
  }

  useEffect(() => {
    loadProjects()
    loadStarredIds()
  }, [])

  useEffect(() => {
    const handleDocumentCreated = (e: Event) => {
      const { projectId } = (e as CustomEvent<{ projectId?: string }>).detail
      if (!projectId) return
      loadProjectDocs(projectId)
      loadProjects()
      setExpandedProjects(prev => new Set([...prev, projectId]))
    }

    window.addEventListener('documentCreated', handleDocumentCreated)
    return () => window.removeEventListener('documentCreated', handleDocumentCreated)
  }, [])

  useEffect(() => {
    const handleToggleStar = () => loadStarredIds()
    window.addEventListener('toggleStar', handleToggleStar)
    return () => window.removeEventListener('toggleStar', handleToggleStar)
  }, [])

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
        loadProjectDocs(projectId)
      }
      return next
    })
  }

  const isStarred = (id: string, type: 'project' | 'document') => {
    return starredIds.has(`${type}-${id}`)
  }

  return {
    projects,
    setProjects,
    expandedProjects,
    setExpandedProjects,
    projectDocs,
    setProjectDocs,
    starredIds,
    loadProjects,
    loadProjectDocs,
    loadStarredIds,
    toggleProject,
    isStarred,
  }
}
