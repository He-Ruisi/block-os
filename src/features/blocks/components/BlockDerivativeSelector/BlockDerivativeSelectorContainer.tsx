import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Block } from '@/types/models/block';
import { blockStore } from '@/storage/blockStore';
import { BlockDerivativeSelectorView } from './BlockDerivativeSelectorView';
import { toDerivativeTreeViewModel } from './mappers';
import type { DerivativeTreeViewModel } from './types';

interface Props {
  sourceBlockId: string;
  onSelect: (block: Block) => void;
  onCancel: () => void;
}

export function BlockDerivativeSelectorContainer({ sourceBlockId, onSelect, onCancel }: Props) {
  const [tree, setTree] = useState<{ source: Block | null; derivatives: Block[] } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(sourceBlockId);
  const [isLoading, setIsLoading] = useState(true);

  // 加载派生树
  useEffect(() => {
    const loadDerivativeTree = async () => {
      try {
        setIsLoading(true);
        const loadedTree = await blockStore.getDerivativeTree(sourceBlockId);
        setTree(loadedTree);
      } catch (error) {
        console.error('Failed to load derivative tree:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDerivativeTree();
  }, [sourceBlockId]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      } else if (event.key === 'Enter' && selectedBlockId) {
        handleSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, onCancel]);

  // 转换为 ViewModel
  const treeViewModel: DerivativeTreeViewModel | null = useMemo(
    () => (tree && tree.source) ? toDerivativeTreeViewModel(tree as { source: Block; derivatives: Block[] }) : null,
    [tree]
  );

  // 事件处理
  const handleSelect = useCallback(() => {
    if (!tree || !tree.source) return;
    
    const selectedBlock = selectedBlockId === tree.source.id
      ? tree.source
      : tree.derivatives.find(item => item.id === selectedBlockId);

    if (selectedBlock) {
      onSelect(selectedBlock);
    }
  }, [tree, selectedBlockId, onSelect]);

  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  return (
    <BlockDerivativeSelectorView
      tree={treeViewModel}
      isLoading={isLoading}
      selectedBlockId={selectedBlockId}
      onSelect={handleSelect}
      onCancel={onCancel}
      onBlockSelect={handleBlockSelect}
    />
  );
}
