import { FileText, Hash, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { BlockViewModel } from './types';

interface Props {
  block: BlockViewModel;
}

export function BlockItemView({ block }: Props) {
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'heading':
        return <Hash className="h-3 w-3" />;
      case 'paragraph':
        return <FileText className="h-3 w-3" />;
      case 'listItem':
        return <span className="text-xs">•</span>;
      default:
        return <span className="text-xs">○</span>;
    }
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{getNodeIcon(block.nodeType)}</span>
        <Badge variant="outline" className="text-[10px]">
          #{block.index}
        </Badge>
        {block.links.length > 0 && (
          <Badge
            className="bg-accent-green text-white text-[10px]"
            title={`${block.links.length} 个链接`}
          >
            <Link2 className="h-2.5 w-2.5 mr-1" />
            {block.links.length}
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-foreground leading-relaxed line-clamp-2 mb-2">
        {block.content}
      </p>
      
      {block.links.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {block.links.map((linkId, i) => (
            <Badge key={i} variant="outline" className="text-[10px]" title={linkId}>
              → {linkId.substring(0, 8)}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
