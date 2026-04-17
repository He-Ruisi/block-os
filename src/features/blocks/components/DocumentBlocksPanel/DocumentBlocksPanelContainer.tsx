import { useState, useEffect } from 'react'
import { documentStore } from '@/storage/documentStore'
import { DocumentBlocksPanelView } from './DocumentBlocksPanelView'
import type { BlockViewModel, DocumentBlocksStats } from './types'

export function DocumentBlocksPanelContainer() {
  const [blocks, setBlocks] = useState<BlockViewModel[]>([])
  const [documentTitle, setDocumentTitle] = useState<string>('Current Document')
  const [isLoading, setIsLoading] = useState(true)

  const loadDocumentBlocks = async () => {
    try {
      setIsLoading(true)
      const docId = documentStore.getCurrentDocumentId()

      if (!docId) {
        setBlocks([])
        return
      }

      const doc = await documentStore.getDocument(docId)
      if (doc) {
        const blockViewModels: BlockViewModel[] = doc.blocks.map((block, index) => ({
          id: block.id,
          nodeType: block.nodeType,
          content: block.content,
          links: block.links,
          index: index + 1,
        }))

        setBlocks(blockViewModels)
        setDocumentTitle(doc.title)
      }
    } catch (error) {
      console.error('Failed to load document blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDocumentBlocks()
    const interval = setInterval(() => {
      void loadDocumentBlocks()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const stats: DocumentBlocksStats = {
    totalBlocks: blocks.length,
    totalLinks: blocks.reduce((sum, block) => sum + block.links.length, 0),
  }

  return (
    <DocumentBlocksPanelView
      blocks={blocks}
      documentTitle={documentTitle}
      isLoading={isLoading}
      stats={stats}
    />
  )
}
