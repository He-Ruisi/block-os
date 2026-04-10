import { useState, useEffect } from 'react'
import type { Project } from '../../types/project'
import { projectStore } from '../../storage/projectStore'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onSelectToday: () => void
  onSelectProject: (projectId: string) => void
  currentProjectId: string | null
}

export function Sidebar({ 
  collapsed, 
  onToggle, 
  onSelectToday, 
  onSelectProject,
  currentProjectId 
}: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  // 加载项目列表
  const loadProjects = async () => {
    try {
      if (!projectStore.isInitialized()) {
        await projectStore.init()
      }
      const allProjects = await projectStore.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // 创建新项目
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      console.log('[Sidebar] Project name is empty')
      return
    }

    try {
      console.log('[Sidebar] Creating project:', newProjectName.trim())
      
      // 确保 projectStore 已初始化
      if (!projectStore.isInitialized()) {
        console.log('[Sidebar] Initializing projectStore...')
        await projectStore.init()
      }
      
      const project = await projectStore.createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      )
      
      console.log('[Sidebar] Project created:', project.id)
      
      setProjects(prev => [project, ...prev])
      setShowNewProjectDialog(false)
      setNewProjectName('')
      setNewProjectDescription('')
      
      // 自动选中新项目
      onSelectProject(project.id)
    } catch (error) {
      console.error('[Sidebar] Failed to create project:', error)
      alert('创建项目失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  if (collapsed) {
    return (
      <div className="sidebar sidebar-collapsed">
        <button className="sidebar-toggle" onClick={onToggle} title="展开侧边栏">
          ☰
        </button>
        <div className="sidebar-icons">
          <button 
            className="sidebar-icon-button" 
            onClick={onSelectToday}
            title="今日"
          >
            📅
          </button>
          <button 
            className="sidebar-icon-button"
            title="项目"
          >
            📁
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle} title="收起侧边栏">
          ☰
        </button>
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
                <div
                  key={project.id}
                  className={`sidebar-project-item ${currentProjectId === project.id ? 'active' : ''}`}
                  onClick={() => onSelectProject(project.id)}
                >
                  <span className="project-icon">
                    {project.metadata.icon || '📄'}
                  </span>
                  <span className="project-name">{project.name}</span>
                  {project.documents.length > 0 && (
                    <span className="project-count">{project.documents.length}</span>
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
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">新建项目</h3>
              <button 
                className="dialog-close"
                onClick={() => setShowNewProjectDialog(false)}
              >
                ×
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">项目名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="输入项目名称..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject()
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">项目描述（可选）</label>
                <textarea
                  className="form-textarea"
                  placeholder="输入项目描述..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="dialog-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowNewProjectDialog(false)}
              >
                取消
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
