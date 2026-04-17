import { Eye, FileCheck, FileText, FileCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PreviewBlockViewModel } from './types';

interface PreviewPanelViewProps {
  blocks: PreviewBlockViewModel[];
  isLoading: boolean;
  selectedThemeId: string;
  selectedTemplateId: string;
  exportFormat: string;
  previewContent: string;
  templateName: string;
  modeName: string;
  onThemeChange: (themeId: string) => void;
  onTemplateChange: (templateId: string) => void;
  onFormatChange: (format: string) => void;
  onDownload: () => void;
}

export function PreviewPanelView({
  blocks,
  isLoading,
  selectedThemeId,
  selectedTemplateId,
  exportFormat,
  previewContent,
  templateName,
  modeName,
  onThemeChange,
  onTemplateChange,
  onFormatChange,
  onDownload,
}: PreviewPanelViewProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Settings */}
      <div className="space-y-4 mb-4 shrink-0">
        {/* Mode Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">模式:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedThemeId === 'preview' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onThemeChange('preview')}
              className={cn(
                selectedThemeId === 'preview' && 'bg-accent-green hover:bg-accent-green/90 text-white'
              )}
            >
              <Eye className="h-4 w-4 mr-1" />
              预览
            </Button>
            <Button
              variant={selectedThemeId === 'review' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onThemeChange('review')}
              className={cn(
                selectedThemeId === 'review' && 'bg-accent-green hover:bg-accent-green/90 text-white'
              )}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              审阅
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">模板:</span>
          <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
            <SelectTrigger className="flex-1 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novel">小说</SelectItem>
              <SelectItem value="blog">博客</SelectItem>
              <SelectItem value="outline">大纲</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0">格式:</span>
          <Select value={exportFormat} onValueChange={onFormatChange}>
            <SelectTrigger className="flex-1 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="md">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2 text-accent-green" />
                  Markdown
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  纯文本
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Word
                </div>
              </SelectItem>
              <SelectItem value="html">
                <div className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                  HTML
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="icon" 
            className="bg-accent-green hover:bg-accent-green/90 text-white shrink-0"
            onClick={onDownload}
            disabled={!previewContent}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 rounded-lg border border-border bg-secondary/50 overflow-hidden min-h-0">
        <div className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-secondary flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground">
              {modeName} · {templateName}
            </span>
            <Badge variant="outline" className="text-[10px] border-accent-green/30 text-accent-green">
              .{exportFormat}
            </Badge>
          </div>
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 text-5xl opacity-50">⏳</div>
                <div className="mb-1.5 text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : blocks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 text-5xl opacity-50">📄</div>
                <div className="mb-1.5 text-sm text-muted-foreground">当前文档为空</div>
                <div className="text-xs text-muted-foreground">在编辑器中写入内容后，这里会显示预览</div>
              </div>
            ) : (
              <div className={cn(
                'prose prose-invert prose-sm max-w-none',
                selectedThemeId === 'review' && 'bg-yellow-500/5 rounded p-2'
              )}>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {previewContent}
                </pre>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
