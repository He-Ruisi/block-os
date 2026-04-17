import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BlockSummaryViewModel } from './types';

interface Props {
  source: BlockSummaryViewModel;
  isSelected: boolean;
  onSelect: () => void;
}

export function SourceBlockSection({ source, isSelected, onSelect }: Props) {
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Star className="h-3 w-3" />
        源 Block
      </h4>
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all hover:border-accent-green/50",
          isSelected && "border-accent-green bg-accent-green/5"
        )}
        onClick={onSelect}
        role="radio"
        aria-checked={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
            className="mt-0.5"
          />
          <div className="flex-1">
            <h5 className="text-sm font-medium mb-2">{source.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {source.content}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ml-6">
          <Badge variant="outline" className="text-[10px]">
            {source.createdAt}
          </Badge>
          {source.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] border-accent-green/30 text-accent-green">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </section>
  );
}
