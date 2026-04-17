import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ReleaseViewModel } from './types';

interface Props {
  releases: ReleaseViewModel[];
  showNewRelease: boolean;
  newReleaseTitle: string;
  selectedVersion: number | null;
  hoveredVersion: number | null;
  onShowNewRelease: () => void;
  onCancelNewRelease: () => void;
  onNewReleaseTitleChange: (title: string) => void;
  onCreateRelease: () => void;
  onVersionSelect: (version: number) => void;
  onVersionHover: (version: number | null) => void;
}

export function ReleasesSection({
  releases,
  showNewRelease,
  newReleaseTitle,
  selectedVersion,
  hoveredVersion,
  onShowNewRelease,
  onCancelNewRelease,
  onNewReleaseTitleChange,
  onCreateRelease,
  onVersionSelect,
  onVersionHover,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          版本 ({releases.length})
        </h3>
        <Button
          variant="default"
          size="sm"
          onClick={onShowNewRelease}
          className="h-7 text-xs bg-accent-green hover:bg-accent-green/90"
        >
          + 发布新版本
        </Button>
      </div>

      {showNewRelease && (
        <Card className="p-3 space-y-2">
          <Input
            placeholder="版本标题，例如：偏历史叙述语气"
            value={newReleaseTitle}
            onChange={e => onNewReleaseTitleChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onCreateRelease()}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={onCancelNewRelease}>
              取消
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onCreateRelease}
              className="bg-accent-green hover:bg-accent-green/90"
            >
              发布
            </Button>
          </div>
        </Card>
      )}

      {releases.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          暂无发布版本，点击上方按钮发布
        </div>
      ) : (
        <div className="space-y-2">
          {[...releases].reverse().map(release => (
            <Popover
              key={release.version}
              open={hoveredVersion === release.version}
              onOpenChange={(open) => {
                if (!open) onVersionHover(null);
              }}
            >
              <PopoverTrigger asChild>
                <Card
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:border-accent-green/50",
                    selectedVersion === release.version && "border-accent-green bg-accent-green/5"
                  )}
                  onClick={() => onVersionSelect(release.version)}
                  onMouseEnter={() => onVersionHover(release.version)}
                  onMouseLeave={() => onVersionHover(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`版本 ${release.version}: ${release.title}`}
                  aria-pressed={selectedVersion === release.version}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onVersionSelect(release.version);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-accent-green text-white">v{release.version}</Badge>
                    <span className="text-xs font-medium flex-1">{release.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {release.releasedAt}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {release.content}
                  </p>
                </Card>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 max-h-[400px] overflow-hidden p-0"
                side="left"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onMouseEnter={() => onVersionHover(release.version)}
                onMouseLeave={() => onVersionHover(null)}
              >
                <div className="p-3 border-b bg-secondary">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent-green text-white">v{release.version}</Badge>
                    <span className="text-xs font-medium">{release.title}</span>
                  </div>
                </div>
                <ScrollArea className="h-[350px]">
                  <div className="p-4">
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {release.content}
                    </p>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}
    </section>
  );
}
