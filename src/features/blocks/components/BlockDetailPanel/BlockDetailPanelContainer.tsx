import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Block, BlockRelease } from '@/types/models/block';
import { blockStore } from '@/storage/blockStore';
import { usageStore } from '@/storage/usageStore';
import { publishBlockVersion } from '../../services/blockReleaseService';
import { BlockDetailPanelView } from './BlockDetailPanelView';
import { toBlockDetailViewModel, toReleaseViewModels, toUsageViewModels } from './mappers';
import type { BlockDetailViewModel, ReleaseViewModel, UsageViewModel } from './types';

interface Props {
  blockId: string;
  onClose: () => void;
  onInsertRelease: (block: Block, release: BlockRelease) => void;
}

export function BlockDetailPanelContainer({ blockId, onClose, onInsertRelease }: Props) {
  const [block, setBlock] = useState<Block | null>(null);
  const [usages, setUsages] = useState<UsageViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [newReleaseTitle, setNewReleaseTitle] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [hoveredVersion, setHoveredVersion] = useState<number | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedBlock, loadedUsages] = await Promise.all([
        blockStore.getBlock(blockId),
        usageStore.getUsagesByBlock(blockId),
      ]);
      setBlock(loadedBlock);
      setUsages(toUsageViewModels(loadedUsages));
    } catch (error) {
      console.error('Failed to load block detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // 转换为 ViewModel
  const blockViewModel: BlockDetailViewModel | null = useMemo(
    () => block ? toBlockDetailViewModel(block) : null,
    [block]
  );

  const releaseViewModels: ReleaseViewModel[] = useMemo(
    () => block?.releases ? toReleaseViewModels(block.releases) : [],
    [block?.releases]
  );

  // 事件处理
  const handleCreateRelease = useCallback(async () => {
    if (!block) return;

    try {
      await publishBlockVersion({
        blockId,
        title: newReleaseTitle.trim(),
        contentOverride: block.content,
      });
      setNewReleaseTitle('');
      setShowNewRelease(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create release:', error);
    }
  }, [block, blockId, newReleaseTitle, loadData]);

  const handleInsert = useCallback(() => {
    if (!block || selectedVersion === null) return;
    const release = block.releases?.find(item => item.version === selectedVersion);
    if (release) {
      onInsertRelease(block, release);
    }
  }, [block, selectedVersion, onInsertRelease]);

  const handleVersionSelect = useCallback((version: number) => {
    setSelectedVersion(selectedVersion === version ? null : version);
  }, [selectedVersion]);

  const handleVersionHover = useCallback((version: number | null) => {
    setHoveredVersion(version);
  }, []);

  const handleShowNewRelease = useCallback(() => {
    setShowNewRelease(true);
  }, []);

  const handleCancelNewRelease = useCallback(() => {
    setShowNewRelease(false);
    setNewReleaseTitle('');
  }, []);

  return (
    <BlockDetailPanelView
      block={blockViewModel}
      releases={releaseViewModels}
      usages={usages}
      isLoading={isLoading}
      showNewRelease={showNewRelease}
      newReleaseTitle={newReleaseTitle}
      selectedVersion={selectedVersion}
      hoveredVersion={hoveredVersion}
      onClose={onClose}
      onCreateRelease={handleCreateRelease}
      onInsert={handleInsert}
      onVersionSelect={handleVersionSelect}
      onVersionHover={handleVersionHover}
      onShowNewRelease={handleShowNewRelease}
      onCancelNewRelease={handleCancelNewRelease}
      onNewReleaseTitleChange={setNewReleaseTitle}
    />
  );
}
