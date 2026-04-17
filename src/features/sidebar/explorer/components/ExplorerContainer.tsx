import { useState, useRef, useMemo } from 'react'
import type { Document } from '@/types/models/document'
import { useExplorer } from '../hooks/useExplorer'
import { useStarred } from '../hooks/useStarred'
import { ExplorerView } from './ExplorerView'
import { toProjectViewModels, toStarredItemViewModels } from './mappers'
import { useViewport } from '@/hooks/useViewport'

const STORAGE_KEY = 'blockos-starred-items'
const MAX_STARRED_ITEMS = 10

interface ExplorerContainerProps {
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
}

export function ExplorerContainer({
  onSelectToday,
  onSelectProject,
  onOpenDocument,
  currentProjectId,
}: ExplorerContainerProps) {
  const {
    projects,
    setProjects,
    expandedProjects,
    setExpandedProjects,
    projectDocs,
    setProjectDocs,
    loadProjects,
    loadProjectDocs,
    loadStarredIds,
    toggleProject,
    isStarred,
  } = useExplorer()

  const {
    starredItems,
    itemNames,
    draggedItem,
    removeStaleItem,
    handleUnstar,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  } = useStarred()

  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameProjectValue, setRenameProjectValue] = useState('')
  const renameProjectInputRef = useRef<HTMLInputElement>(null)
  const [movingDocId, setMovingDocId] = useState<string | null>(null)
  const [docActionMenuId, setDocActionMenuId] = useState<string | null>(null)
  const viewport = useViewport()
  const isTouchDevice = viewport.isTablet || viewport.isMobile

  const projectViewModels = useMemo(
    () => toProjectViewModels(projects, projectDocs, expandedProjects, isStarred),
    [projects, projectDocs, expandedProjects, isStarred]
  )

  const starredViewModels = useMemo(
    () => toStarredItemViewModels(starredItems, itemNames),
    [starredItems, itemNames]
  )

  const findDocumentById = (docId: string) => {
    for (const docs of Object.values(projectDocs)) {
      const doc = docs.find(item => item.id === docId)
      if (doc) return doc
    }
    return null
  }

  const loadDocumentById = async (docId: string) => {
    const existing = findDocumentById(docId)
    if (existing) {
      return existing
    }

    const { documentStore } = await import('@/storage/documentStore')
    return documentStore.getDocument(docId)
  }

  const handleCreateProject = async () => {
    const name = newProjectName.trim()
    if (!name) return

    if (projects.some(project => project.name === name)) {
      alert('项目名称已存在，请使用其他名称')
      return
    }

    try {
      const { projectStore } = await import('@/storage/projectStore')
      const { documentStore } = await import('@/storage/documentStore')

      const project = await projectStore.createProject(name, newProjectDescription.trim() || undefined)
      const doc = await documentStore.createDocument(project.name, project.id)
      await projectStore.addDocumentToProject(project.id, doc.id)

      setProjects(prev => [{ ...project, documents: [doc.id] }, ...prev])
      setExpandedProjects(prev => new Set([...prev, project.id]))
      setProjectDocs(prev => ({ ...prev, [project.id]: [doc] }))
      setShowNewProjectDialog(false)
      setNewProjectName('')
      setNewProjectDescription('')
      onOpenDocument(doc)
    } catch (error) {
      console.error('[ExplorerContainer] Failed to create project:', error)
      alert(`创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    const doc = await loadDocumentById(docId)
    if (!doc) return
    if (!confirm(`确定删除文档“${doc.title}”吗？`)) return

    try {
      const { projectStore } = await import('@/storage/projectStore')
      const { documentStore } = await import('@/storage/documentStore')

      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(item => item.id !== doc.id),
        }))
        setProjects(prev =>
          prev.map(project =>
            project.id === doc.projectId
              ? { ...project, documents: project.documents.filter(id => id !== doc.id) }
              : project
          )
        )
      }

      await documentStore.deleteDocument(doc.id)
      window.dispatchEvent(new CustomEvent('documentDeleted', { detail: { documentId: doc.id } }))
    } catch (error) {
      console.error('Failed to delete doc:', error)
    }
  }

  const startRename = async (docId: string) => {
    const doc = await loadDocumentById(docId)
    if (!doc) return
    setDocActionMenuId(null)
    setRenamingDocId(doc.id)
    setRenameValue(doc.title)
    setTimeout(() => renameInputRef.current?.select(), 50)
  }

  const submitRename = async (docId: string) => {
    const doc = await loadDocumentById(docId)
    if (!doc) return

    const newTitle = renameValue.trim()
    if (!newTitle || newTitle === doc.title) {
      setRenamingDocId(null)
      return
    }

    try {
      const { documentStore } = await import('@/storage/documentStore')
      const updated = { ...doc, title: newTitle, metadata: { ...doc.metadata, updatedAt: new Date() } }
      await documentStore.saveDocument(updated)

      if (doc.projectId) {
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).map(item => (item.id === doc.id ? updated : item)),
        }))
      }
    } catch (error) {
      console.error('Failed to rename doc:', error)
    }

    setRenamingDocId(null)
  }

  const handleMoveDoc = async (targetProjectId: string) => {
    if (!movingDocId) return
    const doc = await loadDocumentById(movingDocId)
    if (!doc || doc.projectId === targetProjectId) {
      setMovingDocId(null)
      return
    }

    try {
      const { projectStore } = await import('@/storage/projectStore')
      const { documentStore } = await import('@/storage/documentStore')

      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(item => item.id !== doc.id),
        }))
      }

      await projectStore.addDocumentToProject(targetProjectId, doc.id)
      await documentStore.updateDocumentProject(doc.id, targetProjectId)

      if (expandedProjects.has(targetProjectId)) {
        await loadProjectDocs(targetProjectId)
      }

      await loadProjects()
    } catch (error) {
      console.error('Failed to move doc:', error)
    }

    setMovingDocId(null)
  }

  const startRenameProject = (projectId: string, currentName: string) => {
    setRenamingProjectId(projectId)
    setRenameProjectValue(currentName)
    setTimeout(() => renameProjectInputRef.current?.select(), 50)
  }

  const submitRenameProject = async (projectId: string) => {
    const newName = renameProjectValue.trim()
    if (!newName) {
      setRenamingProjectId(null)
      return
    }

    if (projects.some(project => project.id !== projectId && project.name === newName)) {
      alert('项目名称已存在，请使用其他名称')
      return
    }

    try {
      const { projectStore } = await import('@/storage/projectStore')
      await projectStore.updateProject(projectId, { name: newName })
      setProjects(prev => prev.map(project => (project.id === projectId ? { ...project, name: newName } : project)))
    } catch (error) {
      console.error('Failed to rename project:', error)
    }

    setRenamingProjectId(null)
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`确定删除项目“${projectName}”吗？项目下的文档不会被删除。`)) return

    try {
      const { projectStore } = await import('@/storage/projectStore')
      await projectStore.deleteProject(projectId)
      setProjects(prev => prev.filter(item => item.id !== projectId))
      setExpandedProjects(prev => {
        const next = new Set(prev)
        next.delete(projectId)
        return next
      })
      window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId } }))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const toggleStar = (id: string, type: 'project' | 'document', name: string, projectId?: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const items = raw ? (JSON.parse(raw) as Array<{ id: string; type: string }>) : []
      const exists = items.find(item => item.id === id && item.type === type)

      let nextItems
      if (exists) {
        nextItems = items.filter(item => !(item.id === id && item.type === type))
      } else {
        if (items.length >= MAX_STARRED_ITEMS) {
          alert(`最多只能置顶 ${MAX_STARRED_ITEMS} 个项目`)
          return
        }

        nextItems = [...items, { id, type, name, projectId, starredAt: new Date().toISOString() }]
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems))
      loadStarredIds()
      window.dispatchEvent(new CustomEvent('toggleStar', { detail: { id, type, name, projectId } }))
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const handleNewDocInProject = async (projectId: string) => {
    try {
      const { documentStore } = await import('@/storage/documentStore')
      const { projectStore } = await import('@/storage/projectStore')

      const doc = await documentStore.createDocument('新文档', projectId)
      await projectStore.addDocumentToProject(projectId, doc.id)
      setProjectDocs(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), doc],
      }))
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? { ...project, documents: [...project.documents, doc.id] } : project
        )
      )
      onOpenDocument(doc)
    } catch (error) {
      console.error('Failed to create doc in project:', error)
    }
  }

  const handleOpenDocumentById = async (docId: string) => {
    const doc = await loadDocumentById(docId)
    if (doc) {
      onOpenDocument(doc)
    }
  }

  const handleStarredItemClick = async (item: { id: string; type: 'project' | 'document' }) => {
    try {
      if (item.type === 'project') {
        const { projectStore } = await import('@/storage/projectStore')
        const project = await projectStore.getProject(item.id)
        if (project) {
          onSelectProject(item.id)
          setExpandedProjects(prev => new Set([...prev, item.id]))
          await loadProjectDocs(item.id)
        } else {
          const staleItem = starredItems.find(i => i.id === item.id && i.type === item.type)
          if (staleItem) removeStaleItem(staleItem)
        }
      } else {
        const doc = await loadDocumentById(item.id)
        if (doc) {
          onOpenDocument(doc)
        } else {
          const staleItem = starredItems.find(i => i.id === item.id && i.type === item.type)
          if (staleItem) removeStaleItem(staleItem)
        }
      }
    } catch (error) {
      console.error('Failed to handle starred item click:', error)
    }
  }

  const movingDocument = movingDocId ? findDocumentById(movingDocId) : null

  return (
    <ExplorerView
      currentProjectId={currentProjectId}
      projects={projectViewModels}
      starredItems={starredViewModels}
      draggedStarredItemId={draggedItem?.id || null}
      isTouchDevice={isTouchDevice}
      showNewProjectDialog={showNewProjectDialog}
      newProjectName={newProjectName}
      newProjectDescription={newProjectDescription}
      renamingDocId={renamingDocId}
      renameValue={renameValue}
      renameInputRef={renameInputRef}
      renamingProjectId={renamingProjectId}
      renameProjectValue={renameProjectValue}
      renameProjectInputRef={renameProjectInputRef}
      movingDocumentTitle={movingDocument?.title || null}
      movingDocumentProjectId={movingDocument?.projectId || null}
      docActionMenuId={docActionMenuId}
      onSelectToday={onSelectToday}
      onToggleProject={projectId => {
        toggleProject(projectId)
        onSelectProject(projectId)
      }}
      onCreateProject={handleCreateProject}
      onDeleteDoc={handleDeleteDoc}
      onStartRename={startRename}
      onSubmitRename={submitRename}
      onCancelRename={() => setRenamingDocId(null)}
      onMoveDoc={handleMoveDoc}
      onStartRenameProject={startRenameProject}
      onSubmitRenameProject={submitRenameProject}
      onCancelRenameProject={() => setRenamingProjectId(null)}
      onDeleteProject={handleDeleteProject}
      onToggleStar={toggleStar}
      onNewDocInProject={handleNewDocInProject}
      onOpenDocument={handleOpenDocumentById}
      onOpenStarredItem={handleStarredItemClick}
      onUnstar={handleUnstar}
      onDragStarredItem={handleDragStart}
      onDragEndStarred={handleDragEnd}
      onDropStarredItem={handleDrop}
      onSetShowNewProjectDialog={setShowNewProjectDialog}
      onSetNewProjectName={setNewProjectName}
      onSetNewProjectDescription={setNewProjectDescription}
      onSetRenameValue={setRenameValue}
      onSetRenameProjectValue={setRenameProjectValue}
      onSetMovingDocId={setMovingDocId}
      onSetDocActionMenuId={setDocActionMenuId}
    />
  )
}
