import { useState, useEffect, useCallback } from 'react';
import type { Block } from '@/types/models/block';
import { blockStore } from '@/storage/blockStore';

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBlocks = await blockStore.getAllBlocks();
      // 只返回显式 Block
      const explicitBlocks = allBlocks.filter(block => !block.implicit);
      setBlocks(explicitBlocks);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks]);

  // 订阅 block 更新事件
  useEffect(() => {
    const handleBlockUpdate = () => {
      void loadBlocks();
    };

    window.addEventListener('blockUpdated', handleBlockUpdate);
    return () => window.removeEventListener('blockUpdated', handleBlockUpdate);
  }, [loadBlocks]);

  return {
    blocks,
    isLoading,
    reload: loadBlocks,
  };
}
