import { Sprout } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BlockSummaryViewModel } from './types';

interface Props {
  derivatives: BlockSummaryViewModel[];
  selectedBlockId: string;
  onSelect: (blockId: string) => void;
}

export function DerivativesSection({ derivatives, selectedBlockId, onSelect }: Props) {
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Sprout className="h-3 w-3" />
        派生版本 ({derivatives.length})
      </h4>
      <div className="space-y-2">
        {derivatives.map(derivative => (
          <Card
            key={derivative.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:border-accent-green/50",
              selectedBlockId === derivative.id && "border-accent-green bg-accent-green/5"
            )}
            onClick={() => onSelect(derivative.id)}
            role="radio"
            aria-checked={selectedBlockId === derivative.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(derivative.id);
              }
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <input
                type="radio"
                checked={selectedBlockId === derivative.id}
                onChange={() => onSelect(derivative.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <h5 className="text-sm font-medium mb-2">{derivative.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {derivative.content}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {derivative.contextTitle && (
                <Badge variant="outline" className="text-[10px]">
                  {derivative.contextTitle}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {derivative.createdAt}
              </Badge>
            </div>
            {derivative.modifications && (
              <div className="ml-6 mt-2 text-xs text-muted-foreground italic">
                {derivative.modifications}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
