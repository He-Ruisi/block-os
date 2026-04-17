import { useState, useEffect, useCallback } from 'react';
import { projectStore } from '@/storage/projectStore';
import { documentStore } from '@/storage/documentStore';
import type { Project } from '@/types/models/project';

export interface ProjectStats {
  documentCount: number;
  blockReferenceCount: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const allProjects = await projectStore.getAllProjects();
      setProjects(allProjects);
      
      // 加载每个项目的统计信息
      const stats: Record<string, ProjectStats> = {};
      for (const project of allProjects) {
        const docs = await documentStore.getDocumentsByProject(project.id);
        
        // 统计引用的 Block 数量
        let blockReferenceCount = 0;
        for (const doc of docs) {
          // 从文档内容中提取 Block 引用 ((block-id))
          const blockReferences = doc.content.match(/\(\([a-f0-9-]+\)\)/g) || [];
          blockReferenceCount += blockReferences.length;
        }
        
        stats[project.id] = {
          documentCount: docs.length,
          blockReferenceCount,
        };
      }
      setProjectStats(stats);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    await projectStore.deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId } }));
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    projectStats,
    loading,
    loadProjects,
    deleteProject,
  };
}
