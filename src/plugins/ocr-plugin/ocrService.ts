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

/** 调用 PaddleOCR API 识别文字 */
export async function recognizeText(
  base64Image: string,
  apiUrl: string,
  apiToken: string
): Promise<string> {
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
    return '（未识别到文字内容）'
  }
  
  return texts.join('\n\n---\n\n')
}
