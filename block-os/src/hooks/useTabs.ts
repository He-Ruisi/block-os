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

  const selectToday = useCallback(() => {
    setCurrentProjectId('today')
    setTabs(prev => {
      const existing = prev.find(t => t.type === 'today')
      if (existing) {
        setActiveTabId(existing.id)
        return prev
      }
      const tab: Tab = { id: 'today-' + Date.now(), type: 'today', title: '今日', isDirty: false }
      setActiveTabId(tab.id)
      return [...prev, tab]
    })
  }, [])

  const selectProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId)
    setTabs(prev => {
      const existing = prev.find(t => t.projectId === projectId && t.type === 'project')
      if (existing) {
        setActiveTabId(existing.id)
        return prev
      }
      projectStore.getProject(projectId).then(project => {
        if (project) {
          const tab: Tab = {
            id: 'project-' + projectId,
            type: 'project',
            projectId,
            title: project.name,
            isDirty: false,
          }
          setTabs(p => [...p, tab])
          setActiveTabId(tab.id)
        }
      })
      return prev
    })
  }, [])

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

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeTabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId)
        setActiveTabId(newTabs[Math.max(0, closedIndex - 1)].id)
      }
      return newTabs
    })
  }, [activeTabId])

  const newTab = useCallback(async () => {
    const projectId = currentProjectId && currentProjectId !== 'today' ? currentProjectId : undefined
    const doc = await documentStore.createDocument('新文档', projectId)
    if (projectId) await projectStore.addDocumentToProject(projectId, doc.id)
    const tabId = 'doc-' + doc.id
    const tab: Tab = {
      id: tabId,
      type: 'document',
      documentId: doc.id,
      projectId,
      title: doc.title,
      isDirty: false,
    }
    setTabs(prev => [...prev, tab])
    setActiveTabId(tabId)
    window.dispatchEvent(new CustomEvent('documentCreated', { detail: { projectId, documentId: doc.id } }))
  }, [currentProjectId])

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
