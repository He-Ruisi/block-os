import { useState, useEffect, useCallback } from 'react';
import type { Block } from '@/types/models/block';
import { blockStore } from '@/storage/blockStore';
import { documentStore } from '@/storage/documentStore';

/**
 * usePreview Hook - 封装预览面板的数据访问逻辑
 */
export function usePreview() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载当前文档的 Block
  const loadBlocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const docId = documentStore.getCurrentDocumentId();
      
      if (!docId) {
        // 没有文档时加载所有显式 Block
        const allBlocks = await blockStore.getAllBlocks();
        setBlocks(allBlocks.filter(b => !b.implicit));
        return;
      }
      
      const doc = await documentStore.getDocument(docId);
      if (!doc) {
        setBlocks([]);
        return;
      }

      // 从文档的隐式 Block 构建预览用 Block 列表
      const previewBlocks: Block[] = doc.blocks.map(db => ({
        id: db.id,
        content: db.content,
        type: db.nodeType === 'heading' ? 'heading' as const : 'text' as const,
        source: { type: 'editor' as const, documentId: docId, capturedAt: new Date() },
        metadata: { tags: [], createdAt: new Date(), updatedAt: new Date() },
        template: {
          role: db.nodeType === 'heading' ? 'heading' as const : 'paragraph' as const,
          level: db.nodeType === 'heading' ? 1 : undefined,
        },
      }));
      
      setBlocks(previewBlocks);
    } catch (error) {
      console.error('Failed to load blocks for preview:', error);
      setBlocks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // 定期刷新
  useEffect(() => {
    const interval = setInterval(loadBlocks, 3000);
    return () => clearInterval(interval);
  }, [loadBlocks]);

  return {
    blocks,
    isLoading,
    refresh: loadBlocks,
  };
}
