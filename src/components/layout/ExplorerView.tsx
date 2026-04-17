import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderInput,
  MoreVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import type { Project } from '../../types/models/project'
import type { Document } from '../../types/models/document'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'
import { useLongPress } from '../../hooks/useLongPress'
import { useViewport } from '../../hooks/useViewport'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'

const STORAGE_KEY = 'blockos-starred-items'
const MAX_STARRED_ITEMS = 10

interface ExplorerViewProps {
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
}

interface ExplorerDocItemProps {
  doc: Document
  isRenaming: boolean
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement | null>
  isStarred: boolean
  isTouchDevice: boolean
  isMenuOpen: boolean
  onRenameValueChange: (value: string) => void
  onSubmitRename: (doc: Document) => void
  onCancelRename: () => void
  onToggleMenu: (e: React.MouseEvent, doc: Document) => void
  onOpen: (doc: Document) => void
  onDoubleClickOpen: (e: React.MouseEvent, doc: Document) => void
  onStartRename: (e: React.MouseEvent, doc: Document) => void
  onSaveToProject: (doc: Document) => void
  onDelete: (e: React.MouseEvent, doc: Document) => void
  onToggleStar: (e: React.MouseEvent, id: string, type: 'project' | 'document', name: string, projectId?: string) => void
  onShowMenu: (doc: Document) => void
}

function ExplorerDocItem({
  doc,
  isRenaming,
  renameValue,
  renameInputRef,
  isStarred,
  isTouchDevice,
  isMenuOpen,
  onRenameValueChange,
  onSubmitRename,
  onCancelRename,
  onToggleMenu,
  onOpen,
  onDoubleClickOpen,
  onStartRename,
  onSaveToProject,
  onDelete,
  onToggleStar,
  onShowMenu,
}: ExplorerDocItemProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (isTouchDevice) {
        onShowMenu(doc)
      }
    },
    onClick: () => {
      if (isTouchDevice) {
        onOpen(doc)
      }
    },
    delay: 500,
  })

  return (
    <div className="explorer-doc-item-wrapper group">
      <div
        className="explorer-doc-item"
        onDoubleClick={e => onDoubleClickOpen(e, doc)}
        {...longPressHandlers}
      >
        {isRenaming ? (
          <Input
            ref={renameInputRef as React.RefObject<HTMLInputElement>}
            className="h-7 text-sm"
            value={renameValue}
            onChange={e => onRenameValueChange(e.target.value)}
            onBlur={() => onSubmitRename(doc)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSubmitRename(doc)
              if (e.key === 'Escape') onCancelRename()
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <>
            <FileText size={14} className="explorer-doc-icon" />
            <span className="explorer-doc-title">{doc.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'explorer-action-btn explorer-star-btn explorer-doc-star h-6 w-6',
                isStarred && 'starred'
              )}
              onClick={e => onToggleStar(e, doc.id, 'document', doc.title, doc.projectId)}
              title={isStarred ? '取消置顶' : '置顶'}
            >
              <Star size={12} fill={isStarred ? 'currentColor' : 'none'} />
            </Button>
            <DropdownMenu open={isMenuOpen} onOpenChange={open => !open && onToggleMenu({} as React.MouseEvent, doc)}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={e => onToggleMenu(e, doc)}
                >
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(doc)}>
                  <FileText size={14} />
                  <span>打开文档</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => onStartRename(e, doc)}>
                  <Pencil size={14} />
                  <span>重命名</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSaveToProject(doc)}>
                  <FolderInput size={14} />
                  <span>保存到项目</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={e => onDelete(e, doc)} className="text-destructive">
                  <Trash2 size={14} />
                  <span>删除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}

export function ExplorerView({
  onSelectToday,
  onSelectProject,
  onOpenDocument,
  currentProjectId,
}: ExplorerViewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [projectDocs, setProjectDocs] = useState<Record<string, Document[]>>({})
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameProjectValue, setRenameProjectValue] = useState('')
  const renameProjectInputRef = useRef<HTMLInputElement>(null)
  const [movingDoc, setMovingDoc] = useState<Document | null>(null)
  const [docActionMenu, setDocActionMenu] = useState<Document | null>(null)
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const viewport = useViewport()
  const isTouchDevice = viewport.isTablet || viewport.isMobile

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
    onSelectProject(projectId)
  }

  const handleCreateProject = async () => {
    const name = newProjectName.trim()
    if (!name) return

    if (projects.some(project => project.name === name)) {
      alert('项目名称已存在，请使用其他名称')
      return
    }

    try {
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
      console.error('[ExplorerView] Failed to create project:', error)
      alert(`创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setDocActionMenu(null)

    if (!confirm(`确定删除文档"${doc.title}"吗？`)) return

    try {
      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(item => item.id !== doc.id),
        }))
        setProjects(prev => prev.map(project => (
          project.id === doc.projectId
            ? { ...project, documents: project.documents.filter(id => id !== doc.id) }
            : project
        )))
      }

      await documentStore.deleteDocument(doc.id)
      window.dispatchEvent(new CustomEvent('documentDeleted', { detail: { documentId: doc.id } }))
    } catch (error) {
      console.error('Failed to delete doc:', error)
    }
  }

  const startRename = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setDocActionMenu(null)
    setRenamingDocId(doc.id)
    setRenameValue(doc.title)
    setTimeout(() => renameInputRef.current?.select(), 50)
  }

  const submitRename = async (doc: Document) => {
    const newTitle = renameValue.trim()
    if (!newTitle || newTitle === doc.title) {
      setRenamingDocId(null)
      return
    }

    try {
      const updated = { ...doc, title: newTitle, metadata: { ...doc.metadata, updatedAt: new Date() } }
      await documentStore.saveDocument(updated)

      if (doc.projectId) {
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).map(item => item.id === doc.id ? updated : item),
        }))
      }
    } catch (error) {
      console.error('Failed to rename doc:', error)
    }

    setRenamingDocId(null)
  }

  const handleMoveDoc = async (doc: Document, targetProjectId: string) => {
    if (doc.projectId === targetProjectId) {
      setMovingDoc(null)
      return
    }

    try {
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

    setMovingDoc(null)
  }

  const startRenameProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setRenamingProjectId(project.id)
    setRenameProjectValue(project.name)
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
      await projectStore.updateProject(projectId, { name: newName })
      setProjects(prev => prev.map(project => (
        project.id === projectId ? { ...project, name: newName } : project
      )))
    } catch (error) {
      console.error('Failed to rename project:', error)
    }

    setRenamingProjectId(null)
  }

  const handleDeleteProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()

    if (!confirm(`确定删除项目"${project.name}"吗？项目下的文档不会被删除。`)) return

    try {
      await projectStore.deleteProject(project.id)
      setProjects(prev => prev.filter(item => item.id !== project.id))
      setExpandedProjects(prev => {
        const next = new Set(prev)
        next.delete(project.id)
        return next
      })
      window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId: project.id } }))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleDocClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    if (isTouchDevice) return
    setDocActionMenu(prev => prev?.id === doc.id ? null : doc)
  }

  const handleDocDoubleClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setDocActionMenu(null)
    onOpenDocument(doc)
  }

  const handleDocOpen = (doc: Document) => {
    setDocActionMenu(null)
    onOpenDocument(doc)
  }

  const handleDocSaveToProject = (doc: Document) => {
    setDocActionMenu(null)
    setMovingDoc(doc)
  }

  const showDocActionMenu = (doc: Document) => {
    setDocActionMenu(doc)
  }

  const toggleStar = (
    e: React.MouseEvent,
    id: string,
    type: 'project' | 'document',
    name: string,
    projectId?: string
  ) => {
    e.stopPropagation()

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const items = raw ? JSON.parse(raw) as Array<{ id: string; type: string }> : []
      const exists = items.find(item => item.id === id && item.type === type)

      let nextItems
      if (exists) {
        nextItems = items.filter(item => !(item.id === id && item.type === type))
      } else {
        if (items.length >= MAX_STARRED_ITEMS) {
          alert(`最多只能置顶 ${MAX_STARRED_ITEMS} 个项目`)
          return
        }

        nextItems = [
          ...items,
          {
            id,
            type,
            name,
            projectId,
            starredAt: new Date().toISOString(),
          },
        ]
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems))
      loadStarredIds()
      window.dispatchEvent(new CustomEvent('toggleStar', { detail: { id, type, name, projectId } }))
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const isStarred = (id: string, type: 'project' | 'document') => {
    return starredIds.has(`${type}-${id}`)
  }

  const handleNewDocInProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()

    try {
      const doc = await documentStore.createDocument('新文档', projectId)
      await projectStore.addDocumentToProject(projectId, doc.id)
      setProjectDocs(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), doc],
      }))
      setProjects(prev => prev.map(project => (
        project.id === projectId ? { ...project, documents: [...project.documents, doc.id] } : project
      )))
      onOpenDocument(doc)
    } catch (error) {
      console.error('Failed to create doc in project:', error)
    }
  }

  return (
    <div className="explorer-view">
      <div
        className={`explorer-item ${currentProjectId === 'today' ? 'active' : ''}`}
        onClick={onSelectToday}
      >
        <CalendarDays size={18} className="explorer-item-icon" />
        <span className="explorer-item-text">今天</span>
      </div>

      <div className="explorer-section">
        <div className="explorer-section-header">
          <span className="explorer-section-title">项目</span>
        </div>

        <ScrollArea className="explorer-projects">
          {projects.length === 0 ? (
            <div className="explorer-empty">
              <div className="explorer-empty-text">还没有项目</div>
              <div className="explorer-empty-hint">点击下方按钮创建</div>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="explorer-project-group">
                <div
                  className={`explorer-project-item ${currentProjectId === project.id ? 'active' : ''}`}
                  onClick={() => toggleProject(project.id)}
                >
                  <span className="explorer-project-expand">
                    {expandedProjects.has(project.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <Folder size={16} className="explorer-project-icon" />
                  {renamingProjectId === project.id ? (
                    <Input
                      ref={renameProjectInputRef}
                      className="h-7 text-sm"
                      value={renameProjectValue}
                      onChange={e => setRenameProjectValue(e.target.value)}
                      onBlur={() => submitRenameProject(project.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') submitRenameProject(project.id)
                        if (e.key === 'Escape') setRenamingProjectId(null)
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="explorer-project-name">{project.name}</span>
                      {project.documents.length > 0 && (
                        <span className="explorer-project-count">{project.documents.length}</span>
                      )}
                      <div className="explorer-doc-actions explorer-project-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'explorer-action-btn explorer-star-btn h-6 w-6',
                            isStarred(project.id, 'project') && 'starred'
                          )}
                          onClick={e => toggleStar(e, project.id, 'project', project.name)}
                          title={isStarred(project.id, 'project') ? '取消置顶' : '置顶'}
                        >
                          <Star size={14} fill={isStarred(project.id, 'project') ? 'currentColor' : 'none'} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn h-6 w-6"
                          onClick={e => handleNewDocInProject(e, project.id)}
                          title="新建文档"
                        >
                          <Plus size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn h-6 w-6"
                          onClick={e => startRenameProject(e, project)}
                          title="重命名"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="explorer-action-btn danger h-6 w-6"
                          onClick={e => handleDeleteProject(e, project)}
                          title="删除项目"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {expandedProjects.has(project.id) && (
                  <div className="explorer-project-docs">
                    {(projectDocs[project.id] || []).length === 0 ? (
                      <div className="explorer-doc-empty">暂无文档。</div>
                    ) : (
                      (projectDocs[project.id] || []).map(doc => (
                        <ExplorerDocItem
                          key={doc.id}
                          doc={doc}
                          isRenaming={renamingDocId === doc.id}
                          renameValue={renameValue}
                          renameInputRef={renameInputRef}
                          isStarred={isStarred(doc.id, 'document')}
                          isTouchDevice={isTouchDevice}
                          isMenuOpen={docActionMenu?.id === doc.id}
                          onRenameValueChange={setRenameValue}
                          onSubmitRename={submitRename}
                          onCancelRename={() => setRenamingDocId(null)}
                          onToggleMenu={handleDocClick}
                          onOpen={handleDocOpen}
                          onDoubleClickOpen={handleDocDoubleClick}
                          onStartRename={startRename}
                          onSaveToProject={handleDocSaveToProject}
                          onDelete={handleDeleteDoc}
                          onToggleStar={toggleStar}
                          onShowMenu={showDocActionMenu}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>

        <Button
          className="explorer-new-project-button w-full justify-start"
          variant="ghost"
          onClick={() => setShowNewProjectDialog(true)}
        >
          <Plus size={16} />
          <span className="explorer-button-text">新建项目</span>
        </Button>
      </div>

      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
            <DialogDescription>创建一个新的项目来组织你的文档</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">项目名称</label>
              <Input
                type="text"
                placeholder="输入项目名称..."
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">项目描述（可选）</label>
              <Textarea
                placeholder="输入项目描述..."
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!movingDoc} onOpenChange={open => !open && setMovingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存到项目</DialogTitle>
            <DialogDescription>
              将"{movingDoc?.title}"保存到：
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {projects
                .filter(project => project.id !== movingDoc?.projectId)
                .map(project => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => movingDoc && handleMoveDoc(movingDoc, project.id)}
                  >
                    <Folder size={16} />
                    <span>{project.name}</span>
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
