import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  content: string;
  type: string;
  tags: string[];
  createdAt: string;
}

export function CurrentContentSection({ content, type, tags, createdAt }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground">当前内容</h3>
      <Card className="p-3">
        <ScrollArea className="h-[200px]">
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap pr-4">
            {content}
          </p>
        </ScrollArea>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {type === 'ai-generated' ? 'AI' : '编辑器'}
        </Badge>
        <Badge variant="outline">{createdAt}</Badge>
        {tags.map(tag => (
          <Badge key={tag} variant="outline" className="border-accent-green/30 text-accent-green">
            #{tag}
          </Badge>
        ))}
      </div>
    </section>
  );
}
