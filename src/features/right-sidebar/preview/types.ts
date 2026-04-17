// ViewModel 类型定义
export interface PreviewViewModel {
  blocks: PreviewBlockViewModel[];
  isLoading: boolean;
  selectedThemeId: string;
  selectedTemplateId: string;
  exportFormat: string;
  previewContent: string;
  templateName: string;
  modeName: string;
}

export interface PreviewBlockViewModel {
  id: string;
  content: string;
  type: 'heading' | 'text' | 'list' | 'code' | 'ai-generated';
}

export interface PreviewSettings {
  themeId: string;
  templateId: string;
  format: string;
}
