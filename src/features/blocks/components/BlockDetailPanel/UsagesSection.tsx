import { Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { UsageViewModel } from './types';

interface Props {
  usages: UsageViewModel[];
}

export function UsagesSection({ usages }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Link2 className="h-3 w-3" />
        引用记录 ({usages.length})
      </h3>
      {usages.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          暂无引用记录
        </div>
      ) : (
        <div className="space-y-2">
          {usages.map(usage => (
            <Card key={usage.id} className="p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex-1 font-medium">{usage.documentTitle}</span>
                <Badge className="bg-accent-green text-white text-[10px]">
                  v{usage.releaseVersion}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {usage.insertedAt}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
