import { useState, useEffect } from 'react'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorWidth, setEditorWidth] = useState(0)

  useEffect(() => {
    const sidebarWidth = sidebarCollapsed ? 60 : 240

    const calculate = () => {
      return (window.innerWidth - sidebarWidth) * 0.6
    }

    setEditorWidth(calculate())

    const handleResize = () => setEditorWidth(calculate())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarCollapsed])

  const sidebarWidth = sidebarCollapsed ? 60 : 240
  const availableWidth = window.innerWidth - sidebarWidth

  return {
    sidebarCollapsed,
    isFullscreen,
    editorWidth,
    toggleSidebar: () => setSidebarCollapsed(v => !v),
    toggleFullscreen: () => setIsFullscreen(v => !v),
    setEditorWidth,
    minEditorWidth: 400,
    maxEditorWidth: availableWidth * 0.8,
  }
}
