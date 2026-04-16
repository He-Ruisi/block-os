import { useState, useEffect } from 'react'
import { Search, Plus, MoreVertical, Folder, FileText, Link as LinkIcon } from 'lucide-react'
import type { Project } from '../../types/models/project'
import { projectStore } from '../../storage/projectStore'
import { documentStore } from '../../storage/documentStore'
import { formatDistanceToNow } from '../../utils/date'
import '../../styles/components/ProjectOverview.css'

interface ProjectOverviewProps {
  onSelectProject: (projectId: string) => void
  onCreateProject: () => void
}

interface ProjectStats {
  documentCount: number
  blockReferenceCount: number
}

type SortBy = 'activity' | 'name' | 'documents'

export function ProjectOverview({ onSelectProject, onCreateProject }: ProjectOverviewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('activity')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const allProjects = await projectStore.getAllProjects()
      setProjects(allProjects)
      
      // 加载每个项目的统计信息
      const stats: Record<string, ProjectStats> = {}
      for (const project of allProjects) {
        const docs = await documentStore.getDocumentsByProject(project.id)
        
        // 统计引用的 Block 数量
        let blockReferenceCount = 0
        for (const doc of docs) {
          // 从文档内容中提取 Block 引用 ((block-id))
          const blockReferences = doc.content.match(/\(\([a-f0-9-]+\)\)/g) || []
          blockReferenceCount += blockReferences.length
        }
        
        stats[project.id] = {
          documentCount: docs.length,
          blockReferenceCount,
        }
      }
      setProjectStats(stats)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定删除此项目？项目下的文档不会被删除。')) return
    
    try {
      await projectStore.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      setMenuOpenId(null)
      window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId } }))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // 过滤和排序项目
  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'documents':
          return (projectStats[b.id]?.documentCount || 0) - (projectStats[a.id]?.documentCount || 0)
        case 'activity':
        default:
          return new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      }
    })

  return (
    <div className="project-overview">
      {/* 头部 */}
      <div className="project-overview-header">
        <h1 className="project-overview-title">Projects</h1>
        <button className="project-new-btn" onClick={onCreateProject}>
          <Plus size={18} />
          <span>New project</span>
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="project-search-bar">
        <Search size={20} className="project-search-icon" />
        <input
          type="text"
          className="project-search-input"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 排序选择器 */}
      <div className="project-sort-bar">
        <span className="project-sort-label">Sort by</span>
        <select
          className="project-sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
        >
          <option value="activity">Activity</option>
          <option value="name">Name</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      {/* 项目网格 */}
      <div className="project-grid">
        {filteredProjects.length === 0 ? (
          <div className="project-empty">
            <Folder size={48} className="project-empty-icon" />
            <p className="project-empty-text">
              {searchQuery ? '未找到匹配的项目' : '还没有项目'}
            </p>
            {!searchQuery && (
              <button className="project-empty-btn" onClick={onCreateProject}>
                <Plus size={16} />
                <span>创建第一个项目</span>
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => {
            const stats = projectStats[project.id] || { documentCount: 0, blockReferenceCount: 0 }
            
            return (
              <div
                key={project.id}
                className="project-card"
                onClick={() => onSelectProject(project.id)}
              >
                <div className="project-card-header">
                  <div className="project-card-icon">
                    {project.icon || <Folder size={20} />}
                  </div>
                  <button
                    className="project-card-menu"
                    onClick={e => {
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === project.id ? null : project.id)
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {menuOpenId === project.id && (
                    <div className="project-card-menu-dropdown">
                      <button
                        className="project-menu-item"
                        onClick={e => {
                          e.stopPropagation()
                          onSelectProject(project.id)
                          setMenuOpenId(null)
                        }}
                      >
                        打开项目
                      </button>
                      <button
                        className="project-menu-item danger"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                      >
                        删除项目
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="project-card-title">{project.name}</h3>
                
                {project.description && (
                  <p className="project-card-description">{project.description}</p>
                )}

                <div className="project-card-stats">
                  <div className="project-stat">
                    <FileText size={14} />
                    <span>{stats.documentCount} 文档</span>
                  </div>
                  <div className="project-stat">
                    <LinkIcon size={14} />
                    <span>{stats.blockReferenceCount} 引用</span>
                  </div>
                </div>

                <div className="project-card-footer">
                  <span className="project-card-updated">
                    Updated {formatDistanceToNow(project.metadata.updatedAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
