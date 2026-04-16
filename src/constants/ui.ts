// UI 相关常量

// 尺寸
export const UI_SIZES = {
  SIDEBAR_WIDTH: 240,
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 400,
  RIGHT_PANEL_WIDTH: 320,
  RIGHT_PANEL_MIN_WIDTH: 280,
  RIGHT_PANEL_MAX_WIDTH: 600,
  ACTIVITY_BAR_WIDTH: 48,
  TAB_HEIGHT: 36,
  TOOLBAR_HEIGHT: 40,
  STATUS_BAR_HEIGHT: 24,
} as const;

// 间距
export const UI_SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

// 动画时长（毫秒）
export const UI_ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// 断点（响应式）
export const UI_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;
