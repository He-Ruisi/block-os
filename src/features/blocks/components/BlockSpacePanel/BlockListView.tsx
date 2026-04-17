import { BlockItemView } from './BlockItemView';
import type { BlockViewModel } from './types';

interface Props {
  blocks: BlockViewModel[];
  highlightedBlockId: string | null;
  onBlockClick: (blockId: string) => void;
  onBlockDragStart: (blockId: string, block: BlockViewModel) => string;
}

export function BlockListView({ blocks, highlightedBlockId, onBlockClick, onBlockDragStart }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
      {blocks.map(block => (
        <BlockItemView
          key={block.id}
          block={block}
          isHighlighted={block.id === highlightedBlockId}
          onClick={() => onBlockClick(block.id)}
          onDragStart={() => onBlockDragStart(block.id, block)}
        />
      ))}
    </div>
  );
}
