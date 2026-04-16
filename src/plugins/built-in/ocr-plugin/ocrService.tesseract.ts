// src/plugins/ocr-plugin/ocrService.tesseract.ts
// 备用 OCR 实现：使用 Tesseract.js（纯前端，无需后端）

/**
 * 使用 Tesseract.js 识别文字（备用方案）
 * 
 * 安装依赖：bun add tesseract.js
 * 
 * 优点：
 * - 完全免费，无需 API Key
 * - 纯前端实现，无 CORS 问题
 * - 支持中文和英文
 * 
 * 缺点：
 * - 识别速度较慢（3-10 秒）
 * - 准确率略低于 PaddleOCR
 */

export async function recognizeTextWithTesseract(
  base64Image: string
): Promise<string> {
  try {
    // 动态导入 Tesseract.js（避免打包体积过大）
    // 注意：需要先安装 tesseract.js: bun add tesseract.js
    const Tesseract = await import('tesseract.js' as any)
    
    console.log('[OCRService] Using Tesseract.js for recognition')
    
    const { data: { text } } = await Tesseract.recognize(
      `data:image/jpeg;base64,${base64Image}`,
      'chi_sim+eng', // 中文简体 + 英文
      {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )
    
    if (!text || !text.trim()) {
      return '（未识别到文字内容）'
    }
    
    return text.trim()
  } catch (error) {
    console.error('[OCRService] Tesseract error:', error)
    throw new Error(`识别失败：${(error as Error).message}`)
  }
}

/**
 * 使用说明：
 * 
 * 1. 安装依赖：
 *    bun add tesseract.js
 * 
 * 2. 在 OCRPanel.tsx 中替换 recognizeText 调用：
 *    import { recognizeTextWithTesseract } from './ocrService.tesseract'
 *    const text = await recognizeTextWithTesseract(capturedBase64)
 * 
 * 3. 无需配置 API URL 和 Token
 */
