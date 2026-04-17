import { BlockItemView } from './BlockItemView'
import type { BlockViewModel } from './types'

interface Props {
  blocks: BlockViewModel[]
}

export function BlockListView({ blocks }: Props) {
  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <BlockItemView key={block.id} block={block} />
      ))}
    </div>
  )
}
