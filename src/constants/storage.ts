// 存储相关常量

// IndexedDB 数据库名
export const DB_NAME = 'blockos-db';
export const DB_VERSION = 6;  // 升级到 6，添加 OCR 历史记录 store

// 对象存储名称
export const STORE_NAMES = {
  PROJECTS: 'projects',
  DOCUMENTS: 'documents',
  BLOCKS: 'blocks',
  SESSIONS: 'sessions',
  OCR_PHOTOS: 'ocr-photos',
  PLUGIN_CONFIGS: 'plugin-configs',
  USAGES: 'usages',
} as const;

// localStorage 键名
export const LOCAL_STORAGE_KEYS = {
  LAYOUT_PREFERENCES: 'blockos-layout-preferences',
  STARRED_ITEMS: 'blockos-starred-items',
  CURRENT_PROJECT: 'blockos-current-project',
  CURRENT_DOCUMENT: 'blockos-current-document',
  VIEW_MODE: 'blockos-view-mode',
  THEME: 'blockos-theme',
} as const;
