import { useState, useEffect, useRef } from 'react'
import type { Project } from '../../types/project'
import type { Document } from '../../types/document'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  onOpenDocument: (doc: Document) => void
  currentProjectId: string | null
}

export function Sidebar({
  collapsed,
  onToggle,
  onSelectToday,
  onSelectProject,
  onOpenDocument,
  currentProjectId,
}: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [projectDocs, setProjectDocs] = useState<Record<string, Document[]>>({})
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  // 重命名文档状态
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  // 重命名项目状态
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameProjectValue, setRenameProjectValue] = useState('')
  const renameProjectInputRef = useRef<HTMLInputElement>(null)
  // 移动文档状态
  const [movingDoc, setMovingDoc] = useState<Document | null>(null)

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

  // 监听文档创建事件，自动刷新对应项目的文档列表
  useEffect(() => {
    const handleDocumentCreated = (e: Event) => {
      const { projectId } = (e as CustomEvent<{ projectId?: string }>).detail
      if (projectId) {
        // 刷新项目文档列表
        loadProjectDocs(projectId)
        // 刷新项目列表（更新文档数量）
        loadProjects()
        // 自动展开该项目
        setExpandedProjects(prev => new Set([...prev, projectId]))
      }
    }
    window.addEventListener('documentCreated', handleDocumentCreated)
    return () => window.removeEventListener('documentCreated', handleDocumentCreated)
  }, [])

  // 加载项目下的文档
  const loadProjectDocs = async (projectId: string) => {
    try {
      const docs = await documentStore.getDocumentsByProject(projectId)
      setProjectDocs(prev => ({ ...prev, [projectId]: docs }))
    } catch (error) {
      console.error('Failed to load project docs:', error)
    }
  }

  // 展开/收起项目
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

  // 创建新项目
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      const project = await projectStore.createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      )
      setProjects(prev => [project, ...prev])
      setShowNewProjectDialog(false)
      setNewProjectName('')
      setNewProjectDescription('')
      onSelectProject(project.id)
    } catch (error) {
      console.error('[Sidebar] Failed to create project:', error)
      alert('创建项目失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 删除文档
  const handleDeleteDoc = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    if (!confirm(`确定删除文档「${doc.title}」？`)) return
    try {
      // 从项目中移除
      if (doc.projectId) {
        await projectStore.removeDocumentFromProject(doc.projectId, doc.id)
      }
      // 从 documentStore 删除（直接覆盖为已删除标记，或直接删除）
      // 这里用 saveDocument 标记 title 为 [已删除] 并清空内容，保留 id 避免孤立 block
      // 简单方案：直接从列表移除，不物理删除（避免 block 孤立）
      if (doc.projectId) {
        setProjectDocs(prev => ({
          ...prev,
          [doc.projectId!]: (prev[doc.projectId!] || []).filter(d => d.id !== doc.id),
        }))
        // 更新项目文档数量
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

  // 开始重命名
  const startRename = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation()
    setRenamingDocId(doc.id)
    setRenameValue(doc.title)
    setTimeout(() => renameInputRef.current?.select(), 50)
  }

  // 提交重命名
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

  // 移动文档到另一个项目
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

  // 开始重命名项目
  const startRenameProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setRenamingProjectId(project.id)
    setRenameProjectValue(project.name)
    setTimeout(() => renameProjectInputRef.current?.select(), 50)
  }

  // 提交项目重命名
  const submitRenameProject = async (projectId: string) => {
    const newName = renameProjectValue.trim()
    if (!newName) { setRenamingProjectId(null); return }
    try {
      await projectStore.updateProject(projectId, { name: newName })
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p))
    } catch (error) {
      console.error('Failed to rename project:', error)
    }
    setRenamingProjectId(null)
  }

  // 删除项目
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

  if (collapsed) {
    return (
      <div className="sidebar sidebar-collapsed">
        <button className="sidebar-toggle" onClick={onToggle} title="展开侧边栏">☰</button>
        <div className="sidebar-icons">
          <button className="sidebar-icon-button" onClick={onSelectToday} title="今日">📅</button>
          <button className="sidebar-icon-button" title="项目">📁</button>
        </div>
      </div>
    )
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle} title="收起侧边栏">☰</button>
        <h2 className="sidebar-title">BlockOS</h2>
      </div>

      <div className="sidebar-content">
        {/* 今日 */}
        <div
          className={`sidebar-item ${currentProjectId === 'today' ? 'active' : ''}`}
          onClick={onSelectToday}
        >
          <span className="sidebar-item-icon">📅</span>
          <span className="sidebar-item-text">今日</span>
        </div>

        {/* 项目列表 */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">📁 项目</span>
          </div>

          <div className="sidebar-projects">
            {projects.length === 0 ? (
              <div className="sidebar-empty">
                <div className="sidebar-empty-text">还没有项目</div>
                <div className="sidebar-empty-hint">点击下方按钮创建</div>
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="project-group">
                  {/* 项目行 */}
                  <div
                    className={`sidebar-project-item ${currentProjectId === project.id ? 'active' : ''}`}
                    onClick={() => toggleProject(project.id)}
                  >
                    <span className="project-expand">
                      {expandedProjects.has(project.id) ? '▾' : '▸'}
                    </span>
                    <span className="project-icon">{project.metadata.icon || '📁'}</span>
                    {renamingProjectId === project.id ? (
                      <input
                        ref={renameProjectInputRef}
                        className="doc-rename-input"
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
                        <span className="project-name">{project.name}</span>
                        {project.documents.length > 0 && (
                          <span className="project-count">{project.documents.length}</span>
                        )}
                        <div className="doc-actions project-actions">
                          <button className="doc-action-btn" onClick={e => startRenameProject(e, project)} title="重命名">✏️</button>
                          <button className="doc-action-btn danger" onClick={e => handleDeleteProject(e, project)} title="删除项目">🗑</button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 文档列表（展开时显示） */}
                  {expandedProjects.has(project.id) && (
                    <div className="project-docs">
                      {(projectDocs[project.id] || []).length === 0 ? (
                        <div className="doc-empty">暂无文档</div>
                      ) : (
                        (projectDocs[project.id] || []).map(doc => (
                          <div
                            key={doc.id}
                            className="doc-item"
                            onClick={() => onOpenDocument(doc)}
                          >
                            {renamingDocId === doc.id ? (
                              <input
                                ref={renameInputRef}
                                className="doc-rename-input"
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
                                <span className="doc-icon">📄</span>
                                <span className="doc-title">{doc.title}</span>
                                <div className="doc-actions">
                                  <button
                                    className="doc-action-btn"
                                    onClick={e => startRename(e, doc)}
                                    title="重命名"
                                  >✏️</button>
                                  <button
                                    className="doc-action-btn"
                                    onClick={e => { e.stopPropagation(); setMovingDoc(doc) }}
                                    title="移动到..."
                                  >↗</button>
                                  <button
                                    className="doc-action-btn danger"
                                    onClick={e => handleDeleteDoc(e, doc)}
                                    title="删除"
                                  >🗑</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            className="sidebar-new-project-button"
            onClick={() => setShowNewProjectDialog(true)}
          >
            <span className="button-icon">+</span>
            <span className="button-text">新建项目</span>
          </button>
        </div>
      </div>

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div className="dialog-overlay" onClick={() => setShowNewProjectDialog(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">新建项目</h3>
              <button className="dialog-close" onClick={() => setShowNewProjectDialog(false)}>×</button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">项目名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="输入项目名称..."
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">项目描述（可选）</label>
                <textarea
                  className="form-textarea"
                  placeholder="输入项目描述..."
                  value={newProjectDescription}
                  onChange={e => setNewProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setShowNewProjectDialog(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreateProject} disabled={!newProjectName.trim()}>创建</button>
            </div>
          </div>
        </div>
      )}

      {/* 移动文档对话框 */}
      {movingDoc && (
        <div className="dialog-overlay" onClick={() => setMovingDoc(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">移动文档</h3>
              <button className="dialog-close" onClick={() => setMovingDoc(null)}>×</button>
            </div>
            <div className="dialog-body">
              <p className="move-doc-hint">将「{movingDoc.title}」移动到：</p>
              <div className="move-doc-list">
                {projects
                  .filter(p => p.id !== movingDoc.projectId)
                  .map(p => (
                    <button
                      key={p.id}
                      className="move-doc-option"
                      onClick={() => handleMoveDoc(movingDoc, p.id)}
                    >
                      <span>{p.metadata.icon || '📁'}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                {projects.filter(p => p.id !== movingDoc.projectId).length === 0 && (
                  <p className="doc-empty">没有其他项目</p>
                )}
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setMovingDoc(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
