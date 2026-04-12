import { useState, useCallback, useRef } from 'react'
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
  closeOtherTabs: (tabId: string) => void
  closeTabsToRight: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
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
  // 用 ref 同步跟踪 documentIds，避免 React 批处理导致重复添加
  const documentIdsRef = useRef<Set<string>>(new Set())

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

  const openDocument = useCallback((doc: Document) => {
    const tabId = 'doc-' + doc.id

    // 同步检查是否已有该文档的 tab（防止 React 批处理导致重复添加）
    if (documentIdsRef.current.has(doc.id)) {
      setActiveTabId(tabId)
      if (doc.projectId) setCurrentProjectId(doc.projectId)
      return
    }
    documentIdsRef.current.add(doc.id)

    setTabs(prev => [...prev, {
      id: tabId,
      type: 'document',
      documentId: doc.id,
      projectId: doc.projectId,
      title: doc.title,
      isDirty: false,
    }])
    setActiveTabId(tabId)
    if (doc.projectId) setCurrentProjectId(doc.projectId)
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const closing = prev.find(t => t.id === tabId)
      if (closing?.documentId) documentIdsRef.current.delete(closing.documentId)
      const newTabs = prev.filter(t => t.id !== tabId)
      if (tabId === activeTabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId)
        setActiveTabId(newTabs[Math.max(0, closedIndex - 1)].id)
      }
      return newTabs
    })
  }, [activeTabId])

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs(prev => {
      const kept = prev.find(t => t.id === tabId)
      // 清理 ref，只保留当前 tab
      documentIdsRef.current.clear()
      if (kept?.documentId) documentIdsRef.current.add(kept.documentId)
      return kept ? [kept] : prev
    })
    setActiveTabId(tabId)
  }, [])

  const closeTabsToRight = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId)
      if (idx === -1) return prev
      const removed = prev.slice(idx + 1)
      for (const t of removed) {
        if (t.documentId) documentIdsRef.current.delete(t.documentId)
      }
      const kept = prev.slice(0, idx + 1)
      if (activeTabId !== tabId && !kept.find(t => t.id === activeTabId)) {
        setActiveTabId(tabId)
      }
      return kept
    })
  }, [activeTabId])

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      if (fromIndex === toIndex) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const newTab = useCallback(async () => {
    const projectId = currentProjectId && currentProjectId !== 'today' ? currentProjectId : undefined
    const doc = await documentStore.createDocument('新文档', projectId)
    if (projectId) await projectStore.addDocumentToProject(projectId, doc.id)
    const tabId = 'doc-' + doc.id
    documentIdsRef.current.add(doc.id)
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
    closeOtherTabs,
    closeTabsToRight,
    reorderTabs,
    selectToday,
    selectProject,
    openDocument,
    newTab,
  }
}
