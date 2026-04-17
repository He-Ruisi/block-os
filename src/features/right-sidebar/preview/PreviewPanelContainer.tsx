import { useState, useEffect } from 'react';
import { DEFAULT_DOCUMENT_TEMPLATES } from '@/types/models/block';
import { exportBlocks } from '@/features/blocks';
import { usePreview } from './hooks/usePreview';
import { toPreviewBlockViewModels, getTemplateName, getModeName } from './mappers';
import { PreviewPanelView } from './PreviewPanelView';

export function PreviewPanelContainer() {
  const { blocks, isLoading } = usePreview();
  const [selectedThemeId, setSelectedThemeId] = useState('preview');
  const [selectedTemplateId, setSelectedTemplateId] = useState('blog');
  const [exportFormat, setExportFormat] = useState('md');
  const [previewContent, setPreviewContent] = useState('');

  const selectedTemplate = DEFAULT_DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplateId) ?? DEFAULT_DOCUMENT_TEMPLATES[0];

  // 生成预览
  useEffect(() => {
    if (blocks.length === 0) {
      setPreviewContent('');
      return;
    }
    const result = exportBlocks(blocks, selectedTemplateId, selectedThemeId);
    setPreviewContent(result.content);
  }, [blocks, selectedTemplateId, selectedThemeId]);

  // 下载处理
  const handleDownload = () => {
    if (!previewContent) return;
    const ext = exportFormat;
    const blob = new Blob([previewContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${selectedTemplate.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 转换为 ViewModel
  const blockViewModels = toPreviewBlockViewModels(blocks);

  return (
    <PreviewPanelView
      blocks={blockViewModels}
      isLoading={isLoading}
      selectedThemeId={selectedThemeId}
      selectedTemplateId={selectedTemplateId}
      exportFormat={exportFormat}
      previewContent={previewContent}
      templateName={getTemplateName(selectedTemplateId)}
      modeName={getModeName(selectedThemeId)}
      onThemeChange={setSelectedThemeId}
      onTemplateChange={setSelectedTemplateId}
      onFormatChange={setExportFormat}
      onDownload={handleDownload}
    />
  );
}
