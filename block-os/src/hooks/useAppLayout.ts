import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'blockos-layout'

interface LayoutPrefs {
  sidebarCollapsed: boolean
  editorWidthRatio: number // 0-1，编辑器占可用宽度的比例
}

function loadPrefs(): LayoutPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LayoutPrefs
  } catch { /* ignore */ }
  return { sidebarCollapsed: false, editorWidthRatio: 0.6 }
}

function savePrefs(prefs: LayoutPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

interface AppLayoutState {
  sidebarCollapsed: boolean
  isFullscreen: boolean
  editorWidth: number
  toggleSidebar: () => void
  toggleFullscreen: () => void
  setEditorWidth: (width: number) => void
  minEditorWidth: number
  maxEditorWidth: number
}

export function useAppLayout(): AppLayoutState {
  const [prefs, setPrefs] = useState<LayoutPrefs>(loadPrefs)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorWidth, setEditorWidthState] = useState(0)

  const sidebarWidth = prefs.sidebarCollapsed ? 60 : 240

  // 根据比例计算实际宽度
  useEffect(() => {
    const calculate = () => {
      const available = window.innerWidth - sidebarWidth
      return available * prefs.editorWidthRatio
    }
    setEditorWidthState(calculate())

    const handleResize = () => setEditorWidthState(calculate())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [prefs.sidebarCollapsed, prefs.editorWidthRatio, sidebarWidth])

  // 持久化偏好
  useEffect(() => {
    savePrefs(prefs)
  }, [prefs])

  const toggleSidebar = useCallback(() => {
    setPrefs(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(v => !v)
  }, [])

  const setEditorWidth = useCallback((width: number) => {
    setEditorWidthState(width)
    // 同步更新比例
    const available = window.innerWidth - sidebarWidth
    if (available > 0) {
      const ratio = Math.max(0.2, Math.min(0.9, width / available))
      setPrefs(prev => ({ ...prev, editorWidthRatio: ratio }))
    }
  }, [sidebarWidth])

  const availableWidth = window.innerWidth - sidebarWidth

  return {
    sidebarCollapsed: prefs.sidebarCollapsed,
    isFullscreen,
    editorWidth,
    toggleSidebar,
    toggleFullscreen,
    setEditorWidth,
    minEditorWidth: 400,
    maxEditorWidth: availableWidth * 0.8,
  }
}
