// src/plugins/ocr-plugin/ocrService.ts

/** PaddleOCR API 请求参数 */
interface OCRRequest {
  file: string                      // Base64 编码的图片
  fileType: number                  // 1 = 图片, 0 = PDF
  useDocOrientationClassify: boolean
  useDocUnwarping: boolean
  useChartRecognition: boolean
}

/** PaddleOCR API 响应 */
interface OCRResponse {
  result: {
    layoutParsingResults: Array<{
      markdown: {
        text: string
      }
    }>
  }
}

export interface OCRRecognizeResult {
  text: string
  rawText: string
}

function cleanOCRText(rawText: string): string {
  const withoutImageBlocks = rawText
    .replace(/<div[^>]*>\s*<img[^>]*\/?>\s*<\/div>/gi, '')
    .replace(/<img[^>]*\/?>/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')

  const normalizedLines = withoutImageBlocks
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => {
      if (line.trim() !== '') {
        return true
      }

      const prevLine = lines[index - 1]?.trim()
      return prevLine !== ''
    })

  const cleanedText = normalizedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return cleanedText || '（未识别到可用文本内容）'
}

/** 调用 PaddleOCR API 识别文字 */
export async function recognizeText(
  base64Image: string,
  apiUrl: string,
  apiToken: string
): Promise<OCRRecognizeResult> {
  console.log('[OCRService] Calling API:', apiUrl)
  
  const payload: OCRRequest = {
    file: base64Image,
    fileType: 1,
    useDocOrientationClassify: false,
    useDocUnwarping: false,
    useChartRecognition: false,
  }
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${apiToken}`,
    },
    body: JSON.stringify(payload),
  })
  
  console.log('[OCRService] Response status:', response.status)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  
  const data: OCRResponse = await response.json()
  const results = data?.result?.layoutParsingResults || []
  const texts = results.map(r => r?.markdown?.text || '').filter(Boolean)
  
  if (texts.length === 0) {
    return {
      text: '（未识别到文字内容）',
      rawText: '',
    }
  }

  const rawText = texts.join('\n\n---\n\n')

  return {
    text: cleanOCRText(rawText),
    rawText,
  }
}
