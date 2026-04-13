import { useState, useEffect, useRef } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Pencil,
  Trash2,
  FolderInput,
  Plus,
  X,
} from 'lucide-react'
import type { Project } from '../../types/project'
import type { Document } from '../../types/document'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'
import { useLongPress } from '../../hooks/useLongPress'
import { useViewport } from '../../hooks/useViewport'
import './ExplorerView.css'

interface ExplorerViewProps {
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
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
  // 文档操作弹出菜单
  const [docActionMenu, setDocActionMenu] = useState<Document | null>(null)
  const docActionMenuRef = useRef<HTMLDivElement>(null)
  const viewport = useViewport()

  const loadProjects = async () => {
    try {
      const allProjects = await projectStore.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const handleDocumentCreated = (e: Event) => {
      const { projectId } = (e as CustomEvent<{ projectId?: string }>).detail
      if (projectId) {
        loadProjectDocs(projectId)
        loadProjects()
        setExpandedProjects(prev => new Set([...prev, projectId]))
      }
    }
    window.addEventListener('documentCreated', handleDocumentCreated)
    return () => window.removeEventListener('documentCreated', handleDocumentCreated)
  }, [])

  // 点击外部关闭文档操作菜单
  useEffect(() => {
    if (!docActionMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (docActionMenuRef.current && !docActionMenuRef.current.contains(e.target as Node)) {
        setDocActionMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [docActionMenu])

  const loadProjectDocs = async (projectId: string) => {
    try {
      const docs = await documentStore.getDocumentsByProject(projectId)
      setProjectDocs(prev => ({ ...prev, [projectId]: docs }))
    } catch (error) {
      console.error('Failed to load project docs:', error)
    }
  }

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
    if (!newProjectName.trim()) return
    const name = newProjectName.trim()
    // 校验项目名唯一
    if (projects.some(p => p.name === name)) {
      alert('项目名称已存在，请使用其他名称')
      return
    }
    try {
      const project = await projectStore.createProject(
        name,
        newProjectDescription.trim() || undefined
      )
      // 创建项目同名主文档
      const doc = await documentStore.createDocument(project.name, project.id)
      await projectStore.addDocumentToProject(project.id, doc.id)
      setProjects(prev => [{ ...project, documents: [doc.id] }, ...prev])
      setShowNewProjectDialog(false)
      setNewProjectName('')
      setNewProjectDescription('')
      // 自动展开项目并打开文档
      setExpandedProjects(prev => new Set([...prev, project.id]))
      setProjectDocs(prev => ({ ...prev, [project.id]: [doc] }))
      onOpenDocument(doc)
    } catch (error) {
      console.error('[ExplorerView] Failed to create project:', error)
      alert('创建项目失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setDocActionMenu(null)
    if (!confirm(`确定删除文档「${doc.title}」？`)) return
    try {
      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(d => d.id !== doc.id),
        }))
        setProjects(prev => prev.map(p =>
          p.id === doc.projectId
            ? { ...p, documents: p.documents.filter(id => id !== doc.id) }
            : p
        ))
      }
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
          [doc.projectId!]: (prev[doc.projectId!] || []).map(d => d.id === doc.id ? updated : d),
        }))
      }
    } catch (error) {
      console.error('Failed to rename doc:', error)
    }
    setRenamingDocId(null)
  }

  const handleMoveDoc = async (doc: Document, targetProjectId: string) => {
    if (doc.projectId === targetProjectId) { setMovingDoc(null); return }
    try {
      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(d => d.id !== doc.id),
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
    if (!newName) { setRenamingProjectId(null); return }
    // 校验项目名唯一（排除自身）
    if (projects.some(p => p.id !== projectId && p.name === newName)) {
      alert('项目名称已存在，请使用其他名称')
      return
    }
    try {
      await projectStore.updateProject(projectId, { name: newName })
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p))
    } catch (error) {
      console.error('Failed to rename project:', error)
    }
    setRenamingProjectId(null)
  }

  const handleDeleteProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (!confirm(`确定删除项目「${project.name}」？项目下的文档不会被删除。`)) return
    try {
      await projectStore.deleteProject(project.id)
      setProjects(prev => prev.filter(p => p.id !== project.id))
      setExpandedProjects(prev => { const n = new Set(prev); n.delete(project.id); return n })
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // 点击文档：打开操作菜单（桌面）或直接打开（触摸设备双击）
  const handleDocClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    // 触摸设备上单击显示菜单
    setDocActionMenu(prev => prev?.id === doc.id ? null : doc)
  }

  // 双击文档：直接打开
  const handleDocDoubleClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setDocActionMenu(null)
    onOpenDocument(doc)
  }

  // 长按文档：显示操作菜单（触摸设备）
  const createDocLongPressHandlers = (doc: Document) => {
    return useLongPress({
      onLongPress: () => {
        if (viewport.isTablet || viewport.isMobile) {
          setDocActionMenu(doc)
        }
      },
      onClick: () => {
        // 触摸设备：单击直接打开
        if (viewport.isTablet || viewport.isMobile) {
          onOpenDocument(doc)
        }
      },
      delay: 500,
    })
  }

  // 从菜单中打开文档
  const handleDocOpen = (doc: Document) => {
    setDocActionMenu(null)
    onOpenDocument(doc)
  }

  // 从菜单中保存到项目
  const handleDocSaveToProject = (doc: Document) => {
    setDocActionMenu(null)
    setMovingDoc(doc)
  }

  // 在项目中新建文档
  const handleNewDocInProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    try {
      const doc = await documentStore.createDocument('新文档', projectId)
      await projectStore.addDocumentToProject(projectId, doc.id)
      setProjectDocs(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), doc],
      }))
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, documents: [...p.documents, doc.id] } : p
      ))
      onOpenDocument(doc)
    } catch (error) {
      console.error('Failed to create doc in project:', error)
    }
  }

  return (
    <div className="explorer-view">
      {/* 今日 */}
      <div
        className={`explorer-item ${currentProjectId === 'today' ? 'active' : ''}`}
        onClick={onSelectToday}
      >
        <CalendarDays size={18} className="explorer-item-icon" />
        <span className="explorer-item-text">今日</span>
      </div>

      {/* 项目列表 */}
      <div className="explorer-section">
        <div className="explorer-section-header">
          <span className="explorer-section-title">项目</span>
        </div>

        <div className="explorer-projects">
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
                    {expandedProjects.has(project.id)
                      ? <ChevronDown size={14} />
                      : <ChevronRight size={14} />
                    }
                  </span>
                  <Folder size={16} className="explorer-project-icon" />
                  {renamingProjectId === project.id ? (
                    <input
                      ref={renameProjectInputRef}
                      className="explorer-rename-input"
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
                        <button className="explorer-action-btn" onClick={e => handleNewDocInProject(e, project.id)} title="新建文档">
                          <Plus size={14} />
                        </button>
                        <button className="explorer-action-btn" onClick={e => startRenameProject(e, project)} title="重命名">
                          <Pencil size={14} />
                        </button>
                        <button className="explorer-action-btn danger" onClick={e => handleDeleteProject(e, project)} title="删除项目">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {expandedProjects.has(project.id) && (
                  <div className="explorer-project-docs">
                    {(projectDocs[project.id] || []).length === 0 ? (
                      <div className="explorer-doc-empty">暂无文档</div>
                    ) : (
                      (projectDocs[project.id] || []).map(doc => {
                        const longPressHandlers = createDocLongPressHandlers(doc)
                        return (
                        <div key={doc.id} className="explorer-doc-item-wrapper">
                          <div
                            className="explorer-doc-item"
                            onClick={e => handleDocClick(e, doc)}
                            onDoubleClick={e => handleDocDoubleClick(e, doc)}
                            {...longPressHandlers}
                          >
                            {renamingDocId === doc.id ? (
                              <input
                                ref={renameInputRef}
                                className="explorer-rename-input"
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onBlur={() => submitRename(doc)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') submitRename(doc)
                                  if (e.key === 'Escape') setRenamingDocId(null)
                                }}
                                onClick={e => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <>
                                <FileText size={14} className="explorer-doc-icon" />
                                <span className="explorer-doc-title">{doc.title}</span>
                              </>
                            )}
                          </div>

                          {/* 文档操作弹出菜单 */}
                          {docActionMenu?.id === doc.id && (
                            <div className="explorer-doc-action-menu" ref={docActionMenuRef}>
                              <button className="explorer-action-menu-item" onClick={() => handleDocOpen(doc)}>
                                <FileText size={14} />
                                <span>打开文档</span>
                              </button>
                              <button className="explorer-action-menu-item" onClick={e => startRename(e, doc)}>
                                <Pencil size={14} />
                                <span>重命名</span>
                              </button>
                              <button className="explorer-action-menu-item" onClick={() => handleDocSaveToProject(doc)}>
                                <FolderInput size={14} />
                                <span>保存到项目</span>
                              </button>
                              <div className="explorer-action-menu-sep" />
                              <button className="explorer-action-menu-item danger" onClick={e => handleDeleteDoc(e, doc)}>
                                <Trash2 size={14} />
                                <span>删除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                      })
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <button
          className="explorer-new-project-button"
          onClick={() => setShowNewProjectDialog(true)}
        >
          <Plus size={16} />
          <span className="explorer-button-text">新建项目</span>
        </button>
      </div>

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="explorer-dialog-overlay" onClick={() => setShowNewProjectDialog(false)}>
          <div className="explorer-dialog-content" onClick={e => e.stopPropagation()}>
            <div className="explorer-dialog-header">
              <h3 className="explorer-dialog-title">新建项目</h3>
              <button className="explorer-dialog-close" onClick={() => setShowNewProjectDialog(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="explorer-dialog-body">
              <div className="explorer-form-group">
                <label className="explorer-form-label">项目名称</label>
                <input
                  type="text"
                  className="explorer-form-input"
                  placeholder="输入项目名称..."
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                  autoFocus
                />
              </div>
              <div className="explorer-form-group">
                <label className="explorer-form-label">项目描述（可选）</label>
                <textarea
                  className="explorer-form-textarea"
                  placeholder="输入项目描述..."
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="explorer-dialog-footer">
              <button className="explorer-btn-secondary" onClick={() => setShowNewProjectDialog(false)}>取消</button>
              <button className="explorer-btn-primary" onClick={handleCreateProject} disabled={!newProjectName.trim()}>创建</button>
            </div>
          </div>
        </div>
      )}

      {/* 移动文档对话框 */}
      {movingDoc && (
        <div className="explorer-dialog-overlay" onClick={() => setMovingDoc(null)}>
          <div className="explorer-dialog-content" onClick={e => e.stopPropagation()}>
            <div className="explorer-dialog-header">
              <h3 className="explorer-dialog-title">保存到项目</h3>
              <button className="explorer-dialog-close" onClick={() => setMovingDoc(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="explorer-dialog-body">
              <p className="explorer-move-hint">将「{movingDoc.title}」保存到：</p>
              <div className="explorer-move-list">
                {projects
                  .filter(p => p.id !== movingDoc.projectId)
                  .map(p => (
                    <button
                      key={p.id}
                      className="explorer-move-option"
                      onClick={() => handleMoveDoc(movingDoc, p.id)}
                    >
                      <Folder size={16} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                {projects.filter(p => p.id !== movingDoc.projectId).length === 0 && (
                  <p className="explorer-doc-empty">没有其他项目</p>
                )}
              </div>
            </div>
            <div className="explorer-dialog-footer">
              <button className="explorer-btn-secondary" onClick={() => setMovingDoc(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
