import { useState, useEffect } from 'react';
import { documentStore } from '@/storage/documentStore';
import { DocumentBlocksPanelView } from './DocumentBlocksPanelView';
import type { BlockViewModel, DocumentBlocksStats } from './types';

export function DocumentBlocksPanelContainer() {
  const [blocks, setBlocks] = useState<BlockViewModel[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>('当前文档');
  const [isLoading, setIsLoading] = useState(true);

  // 加载文档 Blocks
  const loadDocumentBlocks = async () => {
    try {
      setIsLoading(true);
      const docId = documentStore.getCurrentDocumentId();

      if (!docId) {
        setBlocks([]);
        return;
      }

      const doc = await documentStore.getDocument(docId);
      if (doc) {
        // 转换为 ViewModel
        const blockViewModels: BlockViewModel[] = doc.blocks.map((block, index) => ({
          id: block.id,
          nodeType: block.nodeType,
          content: block.content,
          links: block.links,
          index: index + 1,
        }));
        
        setBlocks(blockViewModels);
        setDocumentTitle(doc.title);
      }
    } catch (error) {
      console.error('Failed to load document blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 定时刷新
  useEffect(() => {
    void loadDocumentBlocks();
    const interval = setInterval(() => {
      void loadDocumentBlocks();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 计算统计数据
  const stats: DocumentBlocksStats = {
    totalBlocks: blocks.length,
    totalLinks: blocks.reduce((sum, block) => sum + block.links.length, 0),
  };

  return (
    <DocumentBlocksPanelView
      blocks={blocks}
      documentTitle={documentTitle}
      isLoading={isLoading}
      stats={stats}
    />
  );
}
