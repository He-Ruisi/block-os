import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Block, BlockRelease } from '@/types/models/block'
import { useBlocks } from '../../hooks/useBlocks'
import { BlockSpacePanelView } from './BlockSpacePanelView'
import { toBlockViewModels } from './mappers'
import type { BlockViewModel, BlockSpaceStats } from './types'

export function BlockSpacePanelContainer() {
  const { blocks, isLoading } = useBlocks()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null)
  const [detailBlockId, setDetailBlockId] = useState<string | null>(null)

  const allTags = useMemo(() => {
    return Array.from(new Set(blocks.flatMap((block) => block.metadata.tags))).sort()
  }, [blocks])

  const filteredBlocks = useMemo(() => {
    let result = blocks

    if (selectedTag !== 'All') {
      result = result.filter((block) => block.metadata.tags.includes(selectedTag))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (block) =>
          block.content.toLowerCase().includes(query) ||
          block.metadata.title?.toLowerCase().includes(query) ||
          block.metadata.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    return result
  }, [blocks, selectedTag, searchQuery])

  const blockViewModels: BlockViewModel[] = useMemo(
    () => toBlockViewModels(filteredBlocks),
    [filteredBlocks]
  )

  const stats: BlockSpaceStats = {
    totalBlocks: blocks.length,
    filteredBlocks: filteredBlocks.length,
    allTags,
  }

  useEffect(() => {
    const handleShowBlock = (event: Event) => {
      const blockId = (event as CustomEvent<string>).detail
      setHighlightedBlockId(blockId)
      setTimeout(() => setHighlightedBlockId(null), 3000)
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${blockId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }

    window.addEventListener('showBlockInSpace', handleShowBlock)
    return () => window.removeEventListener('showBlockInSpace', handleShowBlock)
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const blockId = (event as CustomEvent<string>).detail
      if (blockId) {
        setDetailBlockId(blockId)
      }
    }

    window.addEventListener('openBlockDetail', handler)
    return () => window.removeEventListener('openBlockDetail', handler)
  }, [])

  const handleBlockClick = useCallback((blockId: string) => {
    setDetailBlockId(blockId)
  }, [])

  const handleBlockDragStart = useCallback((blockId: string, block: BlockViewModel) => {
    return JSON.stringify({
      id: blockId,
      title: block.title,
      content: block.content,
      type: block.type,
    })
  }, [])

  const handleInsertRelease = useCallback((block: Block, release: BlockRelease) => {
    window.dispatchEvent(new CustomEvent('insertBlockRelease', {
      detail: {
        blockId: block.id,
        releaseVersion: release.version,
        content: release.content,
        title: release.title,
      },
    }))
    setDetailBlockId(null)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailBlockId(null)
  }, [])

  return (
    <BlockSpacePanelView
      blocks={blockViewModels}
      isLoading={isLoading}
      searchQuery={searchQuery}
      selectedTag={selectedTag}
      allTags={allTags}
      highlightedBlockId={highlightedBlockId}
      detailBlockId={detailBlockId}
      stats={stats}
      onSearchChange={setSearchQuery}
      onTagSelect={setSelectedTag}
      onBlockClick={handleBlockClick}
      onBlockDragStart={handleBlockDragStart}
      onInsertRelease={handleInsertRelease}
      onCloseDetail={handleCloseDetail}
    />
  )
}
