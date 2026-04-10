import { useState, useCallback } from 'react'
import type { Tab } from '../types/project'
import { documentStore } from '../storage/documentStore'
import { projectStore } from '../storage/projectStore'
import type { Document } from '../types/document'

interface TabsState {
  tabs: Tab[]
  activeTabId: string
  currentProjectId: string | null
  selectTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  selectToday: () => void
  selectProject: (projectId: string) => void
  openDocument: (doc: Document) => void
  newTab: () => Promise<void>
}

export function useTabs(): TabsState {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'today', type: 'today', title: '今日', isDirty: false },
  ])
  const [activeTabId, setActiveTabId] = useState('today')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>('today')

  const selectToday = () => {
    setCurrentProjectId('today')
    const existing = tabs.find(t => t.type === 'today')
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      const newTab: Tab = { id: 'today-' + Date.now(), type: 'today', title: '今日', isDirty: false }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
  }

  const selectProject = (projectId: string) => {
    setCurrentProjectId(projectId)
    const existing = tabs.find(t => t.projectId === projectId && t.type === 'project')
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      projectStore.getProject(projectId).then(project => {
        if (project) {
          const newTab: Tab = {
            id: 'project-' + projectId,
            type: 'project',
            projectId,
            title: project.name,
            isDirty: false,
          }
          setTabs(prev => [...prev, newTab])
          setActiveTabId(newTab.id)
        }
      })
    }
  }

  // 直接打开一个文档（从侧边栏点击）
  const openDocument = useCallback((doc: Document) => {
    const tabId = 'doc-' + doc.id
    setTabs(prev => {
      const existing = prev.find(t => t.documentId === doc.id)
      if (existing) return prev
      return [...prev, {
        id: tabId,
        type: 'document',
        documentId: doc.id,
        projectId: doc.projectId,
        title: doc.title,
        isDirty: false,
      }]
    })
    setActiveTabId(tabId)
    if (doc.projectId) setCurrentProjectId(doc.projectId)
  }, [])

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeTabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId)
        setActiveTabId(newTabs[Math.max(0, closedIndex - 1)].id)
      }
      return newTabs
    })
  }

  const newTab = async () => {
    const projectId = currentProjectId && currentProjectId !== 'today' ? currentProjectId : undefined
    const doc = await documentStore.createDocument('新文档', projectId)
    if (projectId) await projectStore.addDocumentToProject(projectId, doc.id)
    const tabId = 'doc-' + doc.id
    const newTab: Tab = {
      id: tabId,
      type: 'document',
      documentId: doc.id,
      projectId,
      title: doc.title,
      isDirty: false,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(tabId)
    // 通知 Sidebar 刷新文档列表
    window.dispatchEvent(new CustomEvent('documentCreated', { detail: { projectId, documentId: doc.id } }))
  }

  return {
    tabs,
    activeTabId,
    currentProjectId,
    selectTab: setActiveTabId,
    closeTab,
    selectToday,
    selectProject,
    openDocument,
    newTab,
  }
}
