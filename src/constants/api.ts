// API 相关常量

// API 端点
export const API_ENDPOINTS = {
  MIMO: 'https://api.xiaomi.com/v1/chat/completions',
  DEEPSEEK: 'https://api.deepseek.com/v1/chat/completions',
  PADDLE_OCR: '/api/ocr/layout-parsing',
} as const;

// 超时时间（毫秒）
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  OCR: 60000,
  UPLOAD: 120000,
} as const;

// 重试次数
export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;
