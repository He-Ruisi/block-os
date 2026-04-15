// src/plugins/ocr-plugin/OCRPanel.tsx

import { useRef, useState, useCallback } from 'react'
import type { IPluginAPI } from '../../services/pluginAPI'
import { recognizeText } from './ocrService'
import './OCRPanel.css'

type OCRStatus = 'idle' | 'camera' | 'captured' | 'loading' | 'done' | 'error'

interface OCRPanelProps {
  api: IPluginAPI
}

export function OCRPanel({ api }: OCRPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [status, setStatus] = useState<OCRStatus>('idle')
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [capturedBase64, setCapturedBase64] = useState<string>('')
  const [resultText, setResultText] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  
  // 开启摄像头
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('camera')
      setErrorMsg('')
    } catch (err) {
      setErrorMsg('无法访问摄像头：' + (err as Error).message)
      api.showError('无法访问摄像头')
    }
  }, [api])
  
  // 拍照
  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const base64 = dataUrl.split(',')[1]
    
    setCapturedBase64(base64)
    setPreviewSrc(dataUrl)
    setStatus('captured')
    
    // 停止摄像头
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])
  
  // 上传图片
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target!.result as string
      setCapturedBase64(dataUrl.split(',')[1])
      setPreviewSrc(dataUrl)
      setStatus('captured')
      setErrorMsg('')
    }
    reader.readAsDataURL(file)
  }, [])
  
  // 识别文字
  const runOCR = useCallback(async () => {
    if (!capturedBase64) return
    
    setStatus('loading')
    setErrorMsg('')
    setResultText('')
    
    try {
      const apiUrl = api.getConfig<string>('apiUrl') || ''
      const apiToken = api.getConfig<string>('apiToken') || ''
      
      if (!apiUrl || !apiToken) {
        throw new Error('请先配置 API 地址和 Token')
      }
      
      const text = await recognizeText(capturedBase64, apiUrl, apiToken)
      setResultText(text)
      setStatus('done')
      api.showSuccess('识别成功')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setStatus('error')
      api.showError('识别失败：' + (err as Error).message)
    }
  }, [capturedBase64, api])
  
  // 插入编辑器
  const insertToEditor = useCallback(async () => {
    if (!resultText) return
    
    try {
      await api.insertSourceBlock(resultText, 'import', '📷 OCR 识别')
      api.showSuccess('已插入编辑器')
    } catch (err) {
      api.showError('插入失败：' + (err as Error).message)
    }
  }, [resultText, api])
  
  // 保存为 Block
  const saveAsBlock = useCallback(async () => {
    if (!resultText) return
    
    try {
      await api.saveAsBlock(resultText, {
        title: 'OCR 识别结果',
        tags: ['OCR', '图片识别'],
        source: { type: 'import' },
      })
      api.showSuccess('已保存为 Block')
    } catch (err) {
      api.showError('保存失败：' + (err as Error).message)
    }
  }, [resultText, api])
  
  // 重置
  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCapturedBase64('')
    setPreviewSrc('')
    setResultText('')
    setErrorMsg('')
    setStatus('idle')
  }, [])
  
  return (
    <div className="ocr-panel">
      <h3>OCR 文字识别</h3>
      
      {/* 摄像头/预览区域 */}
      <div className="ocr-preview">
        {status === 'camera' && (
          <video ref={videoRef} autoPlay playsInline muted className="ocr-video" />
        )}
        {previewSrc && status !== 'camera' && (
          <img src={previewSrc} alt="预览" className="ocr-image" />
        )}
        {status === 'idle' && (
          <div className="ocr-placeholder">
            点击下方按钮开始
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      {/* 操作按钮 */}
      <div className="ocr-actions">
        {status === 'idle' && (
          <>
            <button onClick={startCamera}>开启摄像头</button>
            <label className="file-upload-btn">
              上传图片
              <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
            </label>
          </>
        )}
        {status === 'camera' && (
          <button onClick={capture}>拍照</button>
        )}
        {(status === 'captured' || status === 'loading' || status === 'done' || status === 'error') && (
          <>
            <button onClick={runOCR} disabled={status === 'loading'}>
              {status === 'loading' ? '识别中...' : '识别文字'}
            </button>
            <button onClick={reset}>重置</button>
          </>
        )}
      </div>
      
      {errorMsg && <div className="ocr-error">{errorMsg}</div>}
      
      {/* 识别结果 */}
      {resultText && (
        <div className="ocr-result">
          <h4>识别结果</h4>
          <pre className="ocr-result-text">{resultText}</pre>
          <div className="ocr-result-actions">
            <button onClick={insertToEditor}>插入编辑器</button>
            <button onClick={saveAsBlock}>保存为 Block</button>
          </div>
        </div>
      )}
    </div>
  )
}
