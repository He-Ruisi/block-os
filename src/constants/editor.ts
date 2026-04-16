// 编辑器相关常量

// 快捷键
export const EDITOR_SHORTCUTS = {
  NEW_TAB: 'Mod-t',
  CLOSE_TAB: 'Mod-w',
  TOGGLE_SIDEBAR: 'Mod-b',
  SAVE: 'Mod-s',
  SEND_TO_AI: 'Mod-Shift-a',
} as const;

// 默认内容
export const EDITOR_DEFAULTS = {
  UNTITLED_DOCUMENT: '无标题文档',
  AI_CONVERSATION_NOTE: 'AI 对话笔记',
  PLACEHOLDER: '开始写作...',
} as const;

// 编辑器配置
export const EDITOR_CONFIG = {
  MAX_CONTENT_WIDTH: 760,
  AUTO_SAVE_DELAY: 2000,
  DEBOUNCE_DELAY: 500,
} as const;
