import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BlockViewModel } from './types';

interface Props {
  block: BlockViewModel;
  isHighlighted: boolean;
  onClick: () => void;
  onDragStart: () => string;
}

export function BlockItemView({ block, isHighlighted, onClick, onDragStart }: Props) {
  const handleDragStart = (event: React.DragEvent) => {
    const data = onDragStart();
    event.dataTransfer.setData('application/blockos-block', data);
    event.dataTransfer.setData('text/plain', block.content);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card
      data-block-id={block.id}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`查看 Block: ${block.title}`}
      className={cn(
        "p-4 hover:bg-accent hover:border-accent-green/50 transition-all cursor-pointer group",
        isHighlighted && "border-accent-green bg-accent-green/10 animate-pulse"
      )}
    >
      <h4 className="text-sm font-medium mb-2 line-clamp-1 group-hover:text-accent-green transition-colors">
        {block.title}
      </h4>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
        {block.preview}
      </p>
      <div className="flex flex-wrap gap-1">
        {block.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="h-4 px-1.5 text-[10px] border-accent-green/30 text-accent-green"
          >
            <Tag className="h-2.5 w-2.5 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
