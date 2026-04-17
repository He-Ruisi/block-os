import { BlockItemView } from './BlockItemView';
import type { BlockViewModel } from './types';

interface Props {
  blocks: BlockViewModel[];
}

export function BlockListView({ blocks }: Props) {
  return (
    <div className="p-4 space-y-2">
      {blocks.map((block) => (
        <BlockItemView key={block.id} block={block} />
      ))}
    </div>
  );
}
